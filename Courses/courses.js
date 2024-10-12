const express = require('express');
const sql = require('mssql');
const session = require('express-session');
const config = require('./config'); // Ensure the correct path to your config
const path = require('path');
const compiler = require("compilex");

const app = express();
app.use(express.static('public'));
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
    res.redirect('/sign-in');
}
// Middleware to check if the user is an admin
function ensureAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    // Sending a JSON response to be handled on the client side
    res.status(403).json({ message: 'Access Denied. Admins only.' });
}

// Make student name and role available in EJS templates
app.use((req, res, next) => {
    res.locals.student = req.session.student_name;
    res.locals.role = req.session.role; // Make role available in EJS templates
    next();
});

// Define routes that require admin access
app.use('/modules/:moduleId/materials', ensureAuthenticated, ensureAdmin);
app.use('/modules/:moduleId/quizzes', ensureAuthenticated, ensureAdmin);
app.use('/exercises/:moduleId', ensureAuthenticated, ensureAdmin);
app.use('/quiz', ensureAuthenticated, ensureAdmin);
app.use('/quiz/start', ensureAuthenticated, ensureAdmin);
app.use('/next', ensureAuthenticated, ensureAdmin);

// Define fixed quiz parameters
const quizParams = {
    timeLimit: 15, // in minutes
    numberOfQuestions: 10,
    pointsToScore: 100,
    passingScore: 50
};
// Define the route for your home page
app.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config);

        // Fetch all courses
        const coursesResult = await pool.request().query(`
            SELECT course_id, course_name, description
            FROM Courses 
        `);

        res.render('home', {
            courses: coursesResult.recordset
        });
    } catch (err) {
        console.error('Error fetching courses:', err.message);
        res.status(500).send('Error fetching courses');
    }
});
app.get('/course/:courseId', async (req, res) => {
    const courseId = req.params.courseId; // Course ID from URL parameters

    try {
        const pool = await sql.connect(config);

        // Fetch all courses for displaying on the homepage
        const coursesResult = await pool.request().query(`
            SELECT course_id, course_name, description
            FROM Courses
        `);

        let courseName = '';
        let courseDescription = '';
        let modulesResult = { recordset: [] };

        if (courseId) {
            // If a specific course is requested, fetch its details and modules
            const courseResult = await pool.request()
                .input('courseId', sql.Int, courseId)
                .query(`
                    SELECT course_name, description
                    FROM Courses
                    WHERE course_id = @courseId
                `);

            if (courseResult.recordset.length > 0) {
                courseName = courseResult.recordset[0].course_name;
                courseDescription = courseResult.recordset[0].description;

                modulesResult = await pool.request()
                    .input('courseId', sql.Int, courseId)
                    .query(`
                        SELECT module_id, module_name, description
                        FROM Modules
                        WHERE course_id = @courseId
                    `);
            } else {
                console.error(`No course found with ID: ${courseId}`);
            }
        }

        // Render the layout page with the list of courses and optional course details
        res.render('layout', {
            courses: coursesResult.recordset, // All courses for display
            selectedCourse: courseId, // Pass the selected course ID to the template
            modules: modulesResult.recordset, // Modules for the selected course
            materials: [], // Placeholder for materials if needed
            examples: [],
            courseName: courseName,
            courseDescription: courseDescription,
            moduleName: '',
            moduleDescription: ''
        });
    } catch (err) {
        console.error('Error fetching course details:', err.message);
        res.status(500).send('Error fetching course details');
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
        });

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
});// Route to fetch module details, materials, quizzes, and exercises
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

        // Fetch materials, quizzes, and exercises
        const materialsPromise = pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT material_id, title, link, description
                FROM Materials
                WHERE module_id = @moduleId
            `);

        const quizzesPromise = pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT quiz_id, quiz_title
                FROM Quizzes
                WHERE module_id = @moduleId
            `);

        const exercisesPromise = pool.request()
            .input('moduleId', sql.Int, moduleId)
            .query(`
                SELECT exercise_id, code_snippet
                FROM Exercises
                WHERE module_id = @moduleId
            `);

        // Use Promise.all to run all queries in parallel
        const [materialsResult, quizzesResult, exercisesResult] = await Promise.all([
            materialsPromise,
            quizzesPromise,
            exercisesPromise
        ]);

        // Send the combined result as JSON
        res.json({
            module_name: moduleName,
            description: moduleDescription,
            materials: materialsResult.recordset || [],
            quizzes: quizzesResult.recordset || [],
            exercises: exercisesResult.recordset || []
        });
    } catch (err) {
        console.error('Error fetching module details, materials, quizzes, or exercises:', err.message);
        res.status(500).send('Error fetching module details, materials, quizzes, or exercises');
    }
});
app.get('/exercises/:moduleId', async (req, res) => {
    const moduleId = req.params.moduleId; // Get the module ID from the URL parameter

    try {
        // Connect to the database
        const pool = await sql.connect(config);

        // Log the moduleId for debugging
        console.log('Fetching exercises for moduleId:', moduleId);

        // Query to fetch exercises for the specific module ID
        const exercisesResult = await pool.request()
            .input('module_id', sql.Int, moduleId) // Use parameterized query to prevent SQL injection
            .query('SELECT * FROM Exercises WHERE module_id = @module_id');

        // Log the result for debugging
        console.log('Exercises Result:', exercisesResult.recordset);
        // Render the exercise view with exercises and include a link to the dashboard
        res.render('exercise', {
            exercises: exercisesResult.recordset,
            dashboardUrl: '/dashboard' // Optionally pass the URL to the view
        });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error');
    }
});

// Login and signup routes
app.get('/sign-in', (req, res) => {
    if (req.session && req.session.student_id) {
        return res.redirect('/sign-in'); // Redirect logged in users to the homepage
    }
    res.render('sign-in');
});
app.post('/sign-in', async (req, res) => {
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
            req.session.studentId = userResult.recordset[0].student_id; // Save ID in session

            // Set session data
            req.session.student_id = student.student_id;
            req.session.student_name = student.student_name; // Store student name

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
app.get('/sign-up', (req, res) => {
    res.render('sign-up'); // Make sure you have a login.ejs or equivalent file
});
app.post('/sign-up', async (req, res) => {
    const { student_name, email, password_hash, confirmPassword } = req.body;

    if (password_hash !== confirmPassword) {
        req.session.message = 'Passwords do not match';
        return res.redirect('/sign-up');
    }

    try {
        const pool = await sql.connect(config);
        const sqlQuery = 'INSERT INTO Student (student_name, password_hash, email) VALUES (@student_name, @password_hash, @email)';
        await pool.request()
            .input('student_name', sql.VarChar, student_name)
            .input('password_hash', sql.VarChar, password_hash)
            .input('email', sql.VarChar, email)
            .query(sqlQuery);

        // Set a session variable to store the success message
        req.session.message = 'Signup successful! You can now log in.';

        // Redirect the user to the login page
        return res.redirect('/sign-in');
    } catch (err) {
        console.error('Error executing query:', err);
        req.session.message = 'An error occurred while processing your request.';
        return res.redirect('/sign-up');
    }
});
app.get('/sign-out', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
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
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    const student_id = req.session.student_id;

    if (!student_id) {
        return res.redirect('/sign-in'); // Redirect to login if not authenticated
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

        // Check if moduleId is passed as a query parameter or handle it appropriately
        const moduleId = req.query.module_id; // Example of getting moduleId from query parameters
        if (moduleId) {
            // Fetch exercises for the specific module
            const exercisesQuery = `
                SELECT exercise_id, code_snippet
                FROM Exercises
                WHERE module_id = @module_id
            `;
            const exercisesResult = await pool.request()
                .input('module_id', sql.Int, moduleId)
                .query(exercisesQuery);

            // Organize exercises by module
            const exercisesByModule = exercisesResult.recordset.reduce((acc, exercise) => {
                if (!acc[exercise.module_id]) {
                    acc[exercise.module_id] = [];
                }
                acc[exercise.module_id].push(exercise);
                return acc;
            }, {});

            // Render dashboard with exercises data
            return res.render('dashboard', {
                student: student,
                enrolledCourses: coursesResult.recordset || [],
                courses: allCoursesResult.recordset || [],
                modulesByCourse: modulesResult.recordset.reduce((acc, module) => {
                    if (!acc[module.course_id]) {
                        acc[module.course_id] = [];
                    }
                    acc[module.course_id].push(module);
                    return acc;
                }, {}),
                quizzesByModule: quizzesResult.recordset.reduce((acc, quiz) => {
                    if (!acc[quiz.module_id]) {
                        acc[quiz.module_id] = [];
                    }
                    acc[quiz.module_id].push(quiz);
                    return acc;
                }, {}),
                exercisesByModule: exercisesByModule // Pass exercises by module
            });
        } else {
            // Render dashboard without exercises data
            res.render('dashboard', {
                student: student,
                enrolledCourses: coursesResult.recordset || [],
                courses: allCoursesResult.recordset || [],
                modulesByCourse: modulesResult.recordset.reduce((acc, module) => {
                    if (!acc[module.course_id]) {
                        acc[module.course_id] = [];
                    }
                    acc[module.course_id].push(module);
                    return acc;
                }, {}),
                quizzesByModule: quizzesResult.recordset.reduce((acc, quiz) => {
                    if (!acc[quiz.module_id]) {
                        acc[quiz.module_id] = [];
                    }
                    acc[quiz.module_id].push(quiz);
                    return acc;
                }, {}),
                exercisesByModule: {} // Empty if no moduleId is provided
            });
        }

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

        // Fetch examples for the module
        const examplesQuery = 'SELECT * FROM ModuleCode WHERE module_id = @module_id';
        const examplesResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(examplesQuery);

        // Fetch examples for the module
        const exercisesQuery = 'SELECT * FROM Exercises WHERE module_id = @module_id';
        const exercisesResult = await pool.request()
            .input('module_id', sql.Int, moduleId)
            .query(exercisesQuery);

        res.json({
            materials: materialsResult.recordset,
            examples: examplesResult.recordset,  // Fetch and include module-specific examples
            quizzes: quizzesResult.recordset,
            exercises: exercisesResult.recordset
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('An error occurred while fetching module details.');
    }
});


// Serve the material link if authenticated
app.get('/materials/:materialId', ensureAuthenticated, ensureAdmin, async (req, res) => {
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
        // Only generate student ID if it does not exist in session
        if (!req.session.student_id) {
            req.session.student_id = await getNextStudentId(); // This should only be done once
        }
        req.session.quiz_id = quiz.quiz_id;
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
        .query(`
        SELECT TOP 10 question_id, question_text, option1, option2, option3, option4, correct_option
        FROM QuizQuestions 
        WHERE quiz_id = @quizId
        ORDER BY NEWID();
    `);
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
async function saveQuizSubmission(student_id, quiz_id, totalScore) {
    const progress = Math.round((totalScore / 100) * 100);
    const pool = await sql.connect(config);

    // Check if student_id exists in Student table
    const studentCheck = await pool.request()
        .input('student_id', sql.Int, student_id)
        .query('SELECT COUNT(*) AS studentExists FROM Student WHERE student_id = @student_id');

    if (studentCheck.recordset[0].exists === 0) {
        throw new Error('Student ID does not exist');
    }

    // Proceed to save the submission
    await pool.request()
        .input('student_id', sql.Int, student_id)
        .input('quiz_id', sql.Int, quiz_id)
        .input('score', sql.Int, totalScore) // Make sure totalScore is defined at this point
        .input('progress', sql.Int, progress)
        .query('INSERT INTO QuizSubmissions (student_id, quiz_id, score, progress) VALUES (@student_id, @quiz_id, @score, @progress)');
}

app.get('/quiz/start/:id', async (req, res) => {
    const quizId = req.params.id;
    const questions = req.session.questions;

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
        req.session.questions = questions;
        req.session.quiz_id = quiz.quiz_id;
        req.session.currentQuestionIndex = 0;
        req.session.startTime = new Date().getTime();

        // Fetch quiz questions
        const questionsResult = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query(`
        SELECT TOP 10  question_id, question_text, option1, option2, option3, option4, correct_option
        FROM QuizQuestions 
        WHERE quiz_id = @quizId
        ORDER BY NEWID();
    `);

        console.log('Questions query result:', questionsResult);

        if (questionsResult.recordset.length === 0) {
            console.log('No questions found for quiz ID:', quizId);
            return res.status(404).send('No questions found for this quiz');
        }

        // Define fixed quiz parameters
        const quizParams = {
            timeLimit: 15, // in minutes
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
        const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;
        res.render('quiz', {
            student_id: req.session.student_id,
            quiz_id: req.session.quiz_id,
            questions,
            currentQuestionIndex,
            totalQuestions,
            timeLimit: quizParams.timeLimit,
            timeLeft,
            progressPercentage // Pass progress to the template
        });
    } catch (err) {
        console.error('Error serving quiz:', err.message);
        res.status(500).send('Error serving quiz');
    }
});
// Restart the quiz route

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

app.post('/next', async (req, res) => {
    const { action, answers, currentQuestionId } = req.body;
    const student_id = req.session.student_id;
    const quiz_id = req.session.quiz_id;

    // Check if the 10 shuffled questions are already stored in the session
    let questions = req.session.questions;

    // If questions are not in the session, fetch and shuffle them
    if (!questions) {
        questions = await getQuestionsFromDatabase(quiz_id); // Fetch 10 questions
        req.session.questions = shuffleArray(questions); // Shuffle and store in session
    }

    const totalQuestions = questions.length;
    let currentQuestionIndex = req.session.currentQuestionIndex || 0;

    const timeLimitInSeconds = quizParams.timeLimit * 60;
    const currentTime = new Date().getTime(); // Current time in milliseconds
    const elapsedTime = (currentTime - req.session.startTime) / 1000; // Convert to seconds

    if (!req.session.scores) {
        req.session.scores = [];
    }

    // Log received currentQuestionId and shuffled questions array for debugging
    console.log("Received Current Question ID:", currentQuestionId);
    console.log("Shuffled Questions array:", questions);

    // Ensure answers and currentQuestionId are provided
    if (answers && currentQuestionId) {
        const answersObj = Array.isArray(answers) ? { [currentQuestionId]: answers[0] } : answers;
        const selectedOptionId = parseInt(answersObj[currentQuestionId], 10);

        // Find the current question from the shuffled list of questions
        const currentQuestion = questions.find(q => q.question_id == currentQuestionId);

        // Check if the current question exists
        if (!currentQuestion) {
            console.error(`Question with ID ${currentQuestionId} not found.`);
            return res.status(400).send('Current question not found.');
        }

        const correctOptionId = currentQuestion.correct_option;

        // Ensure the selected option is valid before proceeding with scoring
        if (!isNaN(selectedOptionId)) {
            const score = selectedOptionId === correctOptionId ? 10 : 0;
            req.session.scores[currentQuestionIndex] = score;
        }
    }

    // Handle navigation action (next, back, or submit)
    if (action === 'next') {
        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
        }
    } else if (action === 'back') {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
        }
    }

    req.session.currentQuestionIndex = currentQuestionIndex; // Update session

    // Handle quiz submission
    if (action === 'submit' || currentQuestionIndex >= totalQuestions) {
        const totalScore = req.session.scores.reduce((acc, cur) => acc + cur, 0);
        await saveQuizSubmission(student_id, quiz_id, totalScore);
        const progress = Math.round((totalScore / 100) * 100); // Assuming 100 is the max score

        // Clear quiz-related session data
        req.session.quiz_id = null;
        req.session.currentQuestionIndex = null;
        req.session.startTime = null;
        req.session.questions = null; // Clear questions from session
        return res.render('result', { totalScore, progress });
    }

    // Calculate the progress percentage
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

    // Render the next question
    res.render('quiz', {
        student_id,
        quiz_id,
        questions,
        currentQuestionIndex,
        totalQuestions,
        timeLimit: quizParams.timeLimit,
        timeLeft: Math.max(0, Math.round(timeLimitInSeconds - elapsedTime)), // Time left in seconds
        progressPercentage // Pass the progress percentage to the template
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
app.post('/compilecode', function (req, res) {

    var code = req.body.code;
    var input = req.body.input;
    var inputRadio = req.body.inputRadio;
    var lang = req.body.lang;
    if ((lang === "C") || (lang === "C++")) {
        if (inputRadio === "true") {
            var envData = { OS: "windows", cmd: "g++" };
            compiler.compileCPPWithInput(envData, code, input, function (data) {
                if (data.error) {
                    res.send(data.error);
                }
                else {
                    res.send(data.output);
                }
            });
        }
        else {

            var envData = { OS: "windows", cmd: "g++" };
            compiler.compileCPP(envData, code, function (data) {
                if (data.error) {
                    res.send(data.error);
                }
                else {
                    res.send(data.output);
                }

            });
        }
    }
  
        
    if (lang === "Python") {
        if (inputRadio === "true") {
            var envData = { OS: "windows" };
            compiler.compilePythonWithInput(envData, code, input, function (data) {
                res.send(data);
            });
        }
        else {
            var envData = { OS: "windows" };
            compiler.compilePython(envData, code, function (data) {
                res.send(data);
            });
        }
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