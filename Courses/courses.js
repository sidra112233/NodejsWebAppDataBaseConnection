const express = require('express');
const sql = require('mssql');
const session = require('express-session');
const config = require('./config'); // Ensure the correct path to your config
const path = require('path');
const compiler = require("compilex");

const app = express();
app.set('views', path.join(__dirname, 'views')); // Ensure this points to your views directory
app.set('view engine', 'ejs'); // Configure Express to use EJS as the view engine
const option = { stats: true };
compiler.init(option);
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(session({
    secret: 'Sidra',
    resave: false,
    saveUninitialized: true,
}));
// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.student_id) {
        return next();
    }
    res.redirect('/login');
}

// Define protected routes
app.use('/modules/:moduleId/materials', ensureAuthenticated);
app.use('/modules/:moduleId/quizzes', ensureAuthenticated);
app.use('/quiz', ensureAuthenticated);
app.use('/quiz/start', ensureAuthenticated);
app.use('/next', ensureAuthenticated);
// Define fixed quiz parameters
const quizParams = {
    timeLimit: 30, // in minutes
    numberOfQuestions: 10,
    pointsToScore: 100,
    passingScore: 50
};
// Route for home page
app.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const coursesResult = await pool.request().query(`
            SELECT course_id, course_name, description
            FROM Courses
        `);

        res.render('layout', {
            courses: coursesResult.recordset,
            modules: [],
            materials: [],
            courseName: '',
            courseDescription: '',
            moduleName: '',
            moduleDescription: ''
        });
    } catch (err) {
        console.error('Error fetching courses:', err.message);
        res.status(500).send('Error fetching courses');
    }
});

// Route to fetch modules and quizzes for a specific course
app.get('/courses/:courseId/modules', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const pool = await sql.connect(config);

        // Fetch course details
        const courseResult = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query(`
                SELECT course_name, description
                FROM Courses
                WHERE course_id = @courseId
            `);

        if (courseResult.recordset.length === 0) {
            throw new Error('Course not found');
        }
        const courseName = courseResult.recordset[0].course_name;
        const courseDescription = courseResult.recordset[0].description;

        // Fetch modules and quizzes
        const modulesResult = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query(`
                SELECT module_id, module_name
                FROM Modules
                WHERE course_id = @courseId
            `);

        const quizzesResult = await pool.request()
            .input('courseId', sql.Int, courseId)
            .query(`
                SELECT quiz_id, module_id, quiz_title
                FROM Quizzes
                WHERE module_id IN (
                    SELECT module_id
                    FROM Modules
                    WHERE course_id = @courseId
                )
            `);

        // Organize quizzes by module
        const quizzesByModule = quizzesResult.recordset.reduce((acc, quiz) => {
            if (!acc[quiz.module_id]) {
                acc[quiz.module_id] = [];
            }
            acc[quiz.module_id].push(quiz);
            return acc;
        }, {});

        res.json({
            courseName,
            courseDescription,
            modules: modulesResult.recordset,
            quizzes: quizzesByModule
        });
    } catch (err) {
        console.error('Error fetching modules or quizzes:', err.message);
        res.status(500).send('Error fetching modules or quizzes');
    }
});

// Route to fetch module details, materials, and quizzes
app.get('/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const pool = await sql.connect(config);

        // Fetch module details
        const moduleResult = await pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT module_name, description
                FROM Modules
                WHERE module_id = @moduleId
            `);

        if (moduleResult.recordset.length === 0) {
            throw new Error('Module not found');
        }
        const moduleName = moduleResult.recordset[0].module_name;
        const moduleDescription = moduleResult.recordset[0].description;

        // Fetch materials and quizzes
        const materialsResult = await pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT material_id, title, link, description
                FROM Materials
                WHERE module_id = @moduleId
            `);

        const quizzesResult = await pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT quiz_id, quiz_title
                FROM Quizzes
                WHERE module_id = @moduleId
            `);

        res.json({
            module_name: moduleName,
            description: moduleDescription,
            materials: materialsResult.recordset,
            quizzes: quizzesResult.recordset
        });
    } catch (err) {
        console.error('Error fetching module details, materials, or quizzes:', err.message);
        res.status(500).send('Error fetching module details, materials, or quizzes');
    }
});

// Login and signup routes
app.get('/login', (req, res) => {
    if (req.session && req.session.student_id) {
        return res.redirect('/'); // Redirect logged in users to the homepage
    }
    res.render('login');
});
app.post('/login', async (req, res) => {
    const { student_name, password_hash } = req.body;

    try {
        const pool = await sql.connect(config);

        // Query to check user credentials
        const userQuery = 'SELECT * FROM Student WHERE student_name = @student_name AND password_hash = @password_hash';
        const userResult = await pool.request()
            .input('student_name', sql.VarChar, student_name)
            .input('password_hash', sql.VarChar, password_hash)
            .query(userQuery);

        if (userResult.recordset.length > 0) {
            const student = userResult.recordset[0];

            // Set session data
            req.session.student_id = student.student_id;

            // Fetch enrolled courses
            const coursesQuery = `
                SELECT c.course_id, c.course_name, c.description
                FROM Enrollments e
                JOIN Courses c ON e.course_id = c.course_id
                WHERE e.student_id = @student_id
            `;
            const coursesResult = await pool.request()
                .input('student_id', sql.Int, student.student_id)
                .query(coursesQuery);

            // Fetch available courses
            const allCoursesQuery = 'SELECT * FROM Courses';
            const allCoursesResult = await pool.request().query(allCoursesQuery);

            // Fetch modules for enrolled courses with quiz info
            const modulesQuery = `
                SELECT m.module_id, m.course_id, m.module_name, q.quiz_id
                FROM Modules m
                LEFT JOIN Quizzes q ON m.module_id = q.module_id
                JOIN Enrollments e ON m.course_id = e.course_id
                WHERE e.student_id = @student_id
            `;
            const modulesResult = await pool.request()
                .input('student_id', sql.Int, student.student_id)
                .query(modulesQuery);

            // Organize modules by course
            const modulesByCourse = modulesResult.recordset.reduce((acc, module) => {
                if (!acc[module.course_id]) {
                    acc[module.course_id] = [];
                }
                acc[module.course_id].push(module);
                return acc;
            }, {});

            // Render dashboard with all necessary data
            res.render('dashboard', {
                student: student,
                enrolledCourses: coursesResult.recordset || [],
                courses: allCoursesResult.recordset || [],
                modulesByCourse: modulesByCourse
            });
        } else {
            res.send('Incorrect Student Name or Password');
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.send('An error occurred while processing your request.');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup'); // Render the signup page
});

app.post('/signup', async (req, res) => {
    const { student_name, password_hash, email } = req.body;
    try {
        const pool = await sql.connect(config);
        const sqlQuery = 'INSERT INTO Student (student_name, password_hash, email) VALUES (@student_name, @password_hash, @email)';
        await pool.request()
            .input('student_name', sql.VarChar, student_name)
            .input('password_hash', sql.VarChar, password_hash)
            .input('email', sql.VarChar, email)
            .query(sqlQuery);
        res.send('Signup successful! You can now log in.');
    } catch (err) {
        console.error('Error executing query:', err);
        res.send('An error occurred while processing your request.');
    }
});
app.get('/enroll', (req, res) => {
    const courseId = req.query.course_id;
    res.render('enroll', { courseId });
});
// Add this route to your `courses.js` or relevant file
app.post('/enroll', async (req, res) => {
    const { course_id } = req.body;
    const student_id = req.session.student_id;

    if (!student_id) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const pool = await sql.connect(config);
        const query = `
            INSERT INTO Enrollments (student_id, course_id)
            VALUES (@student_id, @course_id)
        `;
        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('course_id', sql.Int, course_id)
            .query(query);
        res.redirect('/dashboard');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send('You are already enrolled in this course.');
        } else {
            console.error('Enrollment Error:', error);
            res.status(500).send('An error occurred while processing your request.');
        }
    }
});
app.get('/dashboard', async (req, res) => {
    const student_id = req.session.student_id;

    if (!student_id) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    try {
        const pool = await sql.connect(config);

        // Fetch the student information
        const studentQuery = 'SELECT * FROM Student WHERE student_id = @student_id';
        const studentResult = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(studentQuery);

        // Ensure the student is found
        if (studentResult.recordset.length === 0) {
            return res.status(404).send('Student not found.');
        }

        const student = studentResult.recordset[0];

        // Fetch enrolled courses
        const coursesQuery = `
            SELECT c.course_id, c.course_name, c.description
            FROM Enrollments e
            JOIN Courses c ON e.course_id = c.course_id
            WHERE e.student_id = @student_id
        `;
        const coursesResult = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(coursesQuery);

        // Fetch available courses
        const allCoursesQuery = 'SELECT * FROM Courses';
        const allCoursesResult = await pool.request().query(allCoursesQuery);

        // Fetch modules for enrolled courses
        const modulesQuery = `
            SELECT m.module_id, m.course_id, m.module_name
            FROM Modules m
            JOIN Enrollments e ON m.course_id = e.course_id
            WHERE e.student_id = @student_id
        `;
        const modulesResult = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(modulesQuery);

        // Fetch quizzes for each module
        const quizzesQuery = `
            SELECT q.quiz_id, q.module_id, q.quiz_title, q.total_marks
            FROM Quizzes q
            JOIN Modules m ON q.module_id = m.module_id
            JOIN Enrollments e ON m.course_id = e.course_id
            WHERE e.student_id = @student_id
        `;
        const quizzesResult = await pool.request()
            .input('student_id', sql.Int, student_id)
            .query(quizzesQuery);

        // Organize modules by course
        const modulesByCourse = modulesResult.recordset.reduce((acc, module) => {
            if (!acc[module.course_id]) {
                acc[module.course_id] = [];
            }
            acc[module.course_id].push(module);
            return acc;
        }, {});

        // Organize quizzes by module
        const quizzesByModule = quizzesResult.recordset.reduce((acc, quiz) => {
            if (!acc[quiz.module_id]) {
                acc[quiz.module_id] = [];
            }
            acc[quiz.module_id].push(quiz);
            return acc;
        }, {});

        // Render dashboard with all necessary data
        res.render('dashboard', {
            student: student, // Pass the student data here
            enrolledCourses: coursesResult.recordset || [],
            courses: allCoursesResult.recordset || [],
            modulesByCourse: modulesByCourse,
            quizzesByModule: quizzesByModule
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.send('An error occurred while processing your request.');
    }
});

app.get('/module-details/:moduleId', async (req, res) => {
    const { moduleId } = req.params;

    try {
        const pool = await sql.connect(config);

        // Fetch module materials
        const materialsQuery = 'SELECT * FROM Materials WHERE module_id = @module_id';
        const materialsResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(materialsQuery);

        // Fetch quizzes for the module
        const quizzesQuery = 'SELECT quiz_id, quiz_title, total_marks FROM Quizzes WHERE module_id = @module_id';
        const quizzesResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(quizzesQuery);

        res.json({
            materials: materialsResult.recordset,
            quizzes: quizzesResult.recordset
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('An error occurred while fetching module details.');
    }
});


// Serve the material link if authenticated
app.get('/materials/:materialId', ensureAuthenticated, async (req, res) => {
    try {
        const materialId = req.params.materialId;
        const pool = await sql.connect(config);

        const materialResult = await pool.request()
            .input('materialId', sql.Int, materialId)
            .query('SELECT description, link FROM Materials WHERE material_id = @materialId');

        if (materialResult.recordset.length === 0) {
            return res.status(404).send('Material not found');
        }

        // Retrieve material link and description
        const material = materialResult.recordset[0];
        res.json(material);
    } catch (err) {
        console.error('Error fetching material details:', err.message);
        res.status(500).send('Error fetching material details');
    }
});

app.get('/modules/:moduleId/quizzes', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const pool = await sql.connect(config);

        const quizzesResult = await pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT quiz_id, quiz_title
                FROM Quizzes
                WHERE module_id = @moduleId
            `);

        res.json(quizzesResult.recordset);
    } catch (err) {
        console.error('Error fetching quizzes:', err.message);
        res.status(500).send('Error fetching quizzes');
    }
});



// Route to start the quiz
app.post('/quiz/start', async (req, res) => {
    const quizId = parseInt(req.body.quiz_id, 10);

    if (!quizId) {
        return res.status(400).send('Quiz ID is required');
    }

    try {
        const pool = await sql.connect(config);
        const quizResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT * FROM Quizzes WHERE quiz_id = @quizId');

        if (quizResult.recordset.length === 0) {
            return res.status(404).send('Quiz not found');
        }

        const quiz = quizResult.recordset[0];
        req.session.quiz_id = quiz.quiz_id;
        req.session.student_id = await getNextStudentId();
        req.session.currentQuestionIndex = 0;
        req.session.startTime = new Date().getTime();

        res.redirect('/quiz'); // Redirect to the quiz page
    } catch (err) {
        console.error('Error starting quiz:', err.message);
        res.status(500).send('Error starting quiz');
    }
});
// Helper function to fetch questions from the database
async function getQuestionsFromDatabase(quizId) {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .input('quizId', sql.Int, quizId)
        .query('SELECT * FROM QuizQuestions WHERE quiz_id = @quizId');
    return result.recordset.map(question => ({
        question_id: question.question_id,
        question_text: question.question_text,
        options: [question.option1, question.option2, question.option3, question.option4],
        correct_option: question.correct_option
    }));
}

// Helper function to fetch the next student ID
async function getNextStudentId() {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .query('SELECT ISNULL(MAX(student_id), 0) + 1 as nextStudentId FROM QuizSubmissions');
    return result.recordset[0].nextStudentId;
}

// Helper function to save quiz submission
async function saveQuizSubmission(student_id, quiz_id, totalScore) {
    const pool = await sql.connect(config);
    await pool.request()
        .input('student_id', sql.Int, student_id)
        .input('quiz_id', sql.Int, quiz_id)
        .input('score', sql.Int, totalScore)
        .query('INSERT INTO QuizSubmissions (student_id, quiz_id,score) VALUES (@student_id, @quiz_id, @score)');
}
app.get('/quiz/start/:id', async (req, res) => {
    const quizId = req.params.id;

    console.log('Received quiz ID:', quizId);

    if (!quizId || isNaN(quizId)) {
        console.log('Invalid quiz ID:', quizId);
        return res.status(400).send('Invalid quiz ID');
    }

    try {
        const pool = await sql.connect(config);

        // Fetch quiz details
        const quizResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT * FROM Quizzes WHERE quiz_id = @quizId');

        console.log('Quiz query result:', quizResult);

        if (quizResult.recordset.length === 0) {
            console.log('Quiz not found for ID:', quizId);
            return res.status(404).send('Quiz not found');
        }

        const quiz = quizResult.recordset[0];
        req.session.quiz_id = quiz.quiz_id;
        req.session.currentQuestionIndex = 0;
        req.session.startTime = new Date().getTime();

        // Fetch quiz questions
        const questionsResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query(`
            SELECT question_id, question_text, option1, option2, option3, option4
            FROM QuizQuestions
            WHERE quiz_id = @quizId
        `);

        console.log('Questions query result:', questionsResult);

        if (questionsResult.recordset.length === 0) {
            console.log('No questions found for quiz ID:', quizId);
            return res.status(404).send('No questions found for this quiz');
        }

        // Define fixed quiz parameters
        const quizParams = {
            timeLimit: 30, // in minutes
            numberOfQuestions: 10,
            pointsToScore: 100,
            passingScore: 50
        };

        // Render the quiz start page with fixed parameters
        res.render('quizStart', {
            quizTitle: quiz.quiz_title,
            timeLimit: quizParams.timeLimit,
            numberOfQuestions: quizParams.numberOfQuestions,
            pointsToScore: quizParams.pointsToScore,
            passingScore: quizParams.passingScore,
            quiz_id: quiz.quiz_id, // Pass quiz_id to the template
            questions: questionsResult.recordset
        });
    } catch (err) {
        console.error('Error starting quiz:', err.message);
        res.status(500).send('Error starting quiz');
    }
});


// Route to serve quiz page
app.get('/quiz', async (req, res) => {
    try {
        const questions = await getQuestionsFromDatabase(req.session.quiz_id);
        const totalQuestions = questions.length;
        const currentQuestionIndex = req.session.currentQuestionIndex || 0;

        if (!req.session.student_id) {
            req.session.student_id = await getNextStudentId();
        }

        if (!req.session.startTime) {
            req.session.startTime = new Date().getTime();
        }

        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - req.session.startTime) / 1000;
        const timeLimitInSeconds = quizParams.timeLimit * 60;
        const timeLeft = Math.max(0, timeLimitInSeconds - elapsedTime);

        res.render('quiz', {
            student_id: req.session.student_id,
            quiz_id: req.session.quiz_id,
            questions,
            currentQuestionIndex,
            totalQuestions,
            timeLimit: quizParams.timeLimit,
            timeLeft
        });
    } catch (err) {
        console.error('Error serving quiz:', err.message);
        res.status(500).send('Error serving quiz');
    }
});


// Handle quiz navigation and submission
app.post('/next', async (req, res) => {
    const { action, answers, currentQuestionId } = req.body;
    const student_id = req.session.student_id;
    const quiz_id = req.session.quiz_id;
    const questions = await getQuestionsFromDatabase(quiz_id);
    const totalQuestions = questions.length;
    let currentQuestionIndex = req.session.currentQuestionIndex || 0;

    if (!req.session.scores) {
        req.session.scores = [];
    }

    // Check if the quiz has timed out
    const currentTime = new Date().getTime();
    const startTime = req.session.startTime;
    const elapsedTime = (currentTime - startTime) / 1000; // Time in seconds
    const timeLimitInSeconds = quizParams.timeLimit * 60; // Total quiz time in seconds
    if (elapsedTime > timeLimitInSeconds) {
        req.session.destroy(); // Clear session data
        return res.render('result', { totalScore: req.session.scores.reduce((acc, cur) => acc + cur, 0), timeExpired: true });
    }

    // Process answers
    if (answers && currentQuestionId) {
        const answersObj = Array.isArray(answers) ? { [currentQuestionId]: answers[0] } : answers;
        const selectedOptionId = parseInt(answersObj[currentQuestionId], 10);
        const currentQuestion = questions.find(q => q.question_id == currentQuestionId);
        const correctOptionId = currentQuestion.correct_option;

        if (!isNaN(selectedOptionId)) {
            const score = selectedOptionId === correctOptionId ? 10 : 0;
            req.session.scores[currentQuestionIndex] = score;
        }
    }

    // Move to the next question or submit the quiz
    if (action === 'next') {
        currentQuestionIndex++;
        req.session.currentQuestionIndex = currentQuestionIndex;
    }

    if (action === 'submit' || currentQuestionIndex >= totalQuestions) {
        req.session.scores = req.session.scores || [];
        const totalScore = req.session.scores.reduce((acc, cur) => acc + cur, 0);

        await saveQuizSubmission(student_id, quiz_id, totalScore);

        req.session.destroy(); // Clear session data
        return res.render('result', { totalScore });
    }

    // Render the next question
    res.render('quiz', {
        student_id,
        quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions,
        timeLimit: quizParams.timeLimit,
        timeLeft: Math.max(0, Math.round(timeLimitInSeconds - elapsedTime)) // Time left in seconds
    });
});
app.get("/dashboard", function (req, res) {
    res.render("dashboard", {
        languages: [
            { value: "c", label: "C" },
            { value: "cpp", label: "C++" },
            { value: "python", label: "Python" }
        ],
        themes: [
            { value: "vs-dark", label: "Dark" },
            { value: "light", label: "Light" }
        ],
        userLang: "python",
        userTheme: "vs-dark",
        fontSize: 20
    });
});
app.post("/compilecode", function (req, res) {
    var code = req.body.code;
    var input = req.body.input;
    var inputRadio = req.body.inputRadio;
    var lang = req.body.lang;

    if (lang === "C" || lang === "C++") {
        var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
        if (inputRadio === "true") {
            compiler.compileCPPWithInput(envData, code, input, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        } else {
            compiler.compileCPP(envData, code, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        }
    } else if (lang === "Python") {
        var envData = { OS: "windows" };
        if (inputRadio === "true") {
            compiler.compilePythonWithInput(envData, code, input, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        } else {
            compiler.compilePython(envData, code, function (data) {
                if (data.error) {
                    res.send(data.error);
                } else {
                    res.send(data.output);
                }
            });
        }
    } else {
        res.send("Unsupported language");
    }
});

app.get("/fullStat", function (req, res) {
    compiler.fullStat(function (data) {
        res.send(data);
    });
});

compiler.flush(function () {
    console.log("All temporary files flushed!");
});
// Start the server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
