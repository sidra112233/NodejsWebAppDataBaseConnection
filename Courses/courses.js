const express = require('express');
const sql = require('mssql');
const session = require('express-session');
const config = require('./config'); // Ensure the correct path to your config
const path = require('path');

const app = express();
app.set('views', path.join(__dirname, 'views')); // Ensure this points to your views directory
app.set('view engine', 'ejs'); // Configure Express to use EJS as the view engine

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

// Define quiz parameters
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

            // Fetch modules for enrolled courses
            const modulesQuery = `
                SELECT m.module_id, m.course_id, m.module_name
                FROM Modules m
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
                modulesByCourse: modulesByCourse,
                showSidePanel: false // Hide side panel when viewing a specific module

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

        res.redirect('/dashboard'); // Redirect to the dashboard or another page after enrollment
    } catch (err) {
        console.error('Error enrolling in course:', err);
        res.status(500).send('An error occurred while enrolling in the course.');
    }
});
app.get('/dashboard', async (req, res) => {
    const student_id = req.session.student_id;

    if (!student_id) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    try {
        const pool = await sql.connect(config);

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
        console.log('Enrolled courses:', coursesResult.recordset);

        // Fetch available courses
        const allCoursesQuery = 'SELECT * FROM Courses';
        const allCoursesResult = await pool.request().query(allCoursesQuery);
        console.log('All courses:', allCoursesResult.recordset);

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
        console.log('Modules by course:', modulesResult.recordset);

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
            student: { student_id: student_id }, // Replace with actual student data if needed
            enrolledCourses: coursesResult.recordset || [],
            courses: allCoursesResult.recordset || [],
            modulesByCourse: modulesByCourse,
            showSidePanel: true // Show side panel on dashboard
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.send('An error occurred while processing your request.');
    }
});
app.get('/module-details/:moduleId', async (req, res) => {
    const moduleId = req.params.moduleId;

    try {
        const pool = await sql.connect(config);

        // Fetch module details
        const moduleQuery = `
            SELECT module_name
            FROM Modules
            WHERE module_id = @module_id
        `;
        const moduleResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(moduleQuery);

        if (moduleResult.recordset.length === 0) {
            return res.status(404).send({ error: 'Module not found' });
        }

        const moduleName = moduleResult.recordset[0].module_name;

        // Fetch materials for the module
        const materialsQuery = `
            SELECT title, type, description, link
            FROM Materials
            WHERE module_id = @module_id
        `;
        const materialsResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(materialsQuery);

        // Fetch quizzes for the module
        const quizzesQuery = `
            SELECT quiz_title, total_marks
            FROM Quizzes
            WHERE module_id = @module_id
        `;
        const quizzesResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(quizzesQuery);

        res.json({
            module_name: moduleName,
            materials: materialsResult.recordset,
            quizzes: quizzesResult.recordset
        });
    } catch (err) {
        console.error('Error fetching module details:', err);
        res.status(500).send({ error: 'An error occurred while processing your request.' });
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
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
app.get('/quiz/start/:id', async (req, res) => {
    const quizId = parseInt(req.params.id, 10);

    if (isNaN(quizId)) {
        return res.status(400).send('Invalid quiz ID');
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

        res.render('quizStart', {
            quiz,
            questions: questionsResult.recordset
        });
    } catch (err) {
        console.error('Error starting quiz:', err.message);
        res.status(500).send('Error starting quiz');
    }
});
app.get('/quiz/questions/:quizId', async (req, res) => {
    const quizId = parseInt(req.params.quizId, 10);

    if (isNaN(quizId)) {
        return res.status(400).send('Invalid quiz ID');
    }

    try {
        const pool = await sql.connect(config);
        const questionsResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query(`
                SELECT question_id, question_text, option1, option2, option3, option4, correct_option
                FROM QuizQuestions
                WHERE quiz_id = @quizId
            `);

        if (questionsResult.recordset.length === 0) {
            return res.status(404).send('No questions found for this quiz');
        }

        res.json(questionsResult.recordset);
    } catch (err) {
        console.error('Error fetching quiz questions:', err.message);
        res.status(500).send('Error fetching quiz questions');
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

// Route to render the quiz page
app.get('/quiz', async (req, res) => {
    try {
        const questions = await getQuestionsFromDatabase();
        const totalQuestions = questions.length;
        const currentQuestionIndex = req.session.currentQuestionIndex || 0;

        if (!req.session.student_id) {
            req.session.student_id = await getNextStudentId();
        }
        if (!req.session.quiz_id) {
            req.session.quiz_id = await getNextQuizId();
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
    const questions = await getQuestionsFromDatabase();
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

// Helper functions
async function getQuestionsFromDatabase() {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM QuizQuestions');
    return result.recordset.map(question => ({
        question_id: question.question_id,
        question_text: question.question_text,
        options: [question.option1, question.option2, question.option3, question.option4],
        correct_option: question.correct_option
    }));
}

async function getNextStudentId() {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT ISNULL(MAX(student_id), 0) + 1 as nextStudentId FROM QuizSubmissions');
    return result.recordset[0].nextStudentId;
}

async function getNextQuizId() {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT ISNULL(MAX(quiz_id), 0) + 1 as nextQuizId FROM QuizSubmissions');
    return result.recordset[0].nextQuizId;
}

async function saveQuizSubmission(student_id, quiz_id, totalScore) {
    try {
        const pool = await sql.connect(config);
        const query = `
            INSERT INTO QuizSubmissions (student_id, quiz_id, score)
            VALUES (@student_id, @quiz_id, @score);
        `;

        await pool.request()
            .input('student_id', sql.Int, student_id)
            .input('quiz_id', sql.Int, quiz_id)
            .input('score', sql.Float, totalScore)
            .query(query);

        console.log('Score saved successfully.');
    } catch (err) {
        console.error('Error saving score:', err.message);
    }
}

// Start the server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
