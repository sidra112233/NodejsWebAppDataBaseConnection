const express = require('express');
const sql = require('mssql');
const config = require('./config'); // Ensure the correct path to your config

const app = express();

// Configure Express to use EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(express.json());

// Route for home page to show courses in sidebar and initial content
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
        console.error('Error fetching courses:', err.message, err.stack);
        res.status(500).send('Error fetching courses');
    }
});

// Route to fetch modules of a specific course
// Route to fetch modules and quizzes of a specific course
app.get('/courses/:courseId/modules', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const pool = await sql.connect(config);

        // Fetch the course name and description
        const courseResult = await pool.request().query(`
            SELECT course_name, description
            FROM Courses
            WHERE course_id = ${courseId}
        `);
        if (courseResult.recordset.length === 0) {
            throw new Error('Course not found');
        }
        const courseName = courseResult.recordset[0].course_name;
        const courseDescription = courseResult.recordset[0].description;

        // Fetch modules for the specific course
        const modulesResult = await pool.request().query(`
            SELECT module_id, module_name
            FROM Modules
            WHERE course_id = ${courseId}
        `);

        // Fetch quizzes for each module
        const quizzesResult = await pool.request().query(`
            SELECT quiz_id, module_id, quiz_title
            FROM Quizzes
            WHERE module_id IN (SELECT module_id FROM Modules WHERE course_id = ${courseId})
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
        console.error('Error fetching modules or quizzes:', err.message, err.stack);
        res.status(500).send('Error fetching modules or quizzes');
    }
});

// Route to fetch module details, materials, and quizzes
app.get('/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const pool = await sql.connect(config);

        // Fetch module details
        const moduleResult = await pool.request().query(`
            SELECT module_name, description
            FROM Modules
            WHERE module_id = ${moduleId}
        `);

        if (moduleResult.recordset.length === 0) {
            throw new Error('Module not found');
        }
        const moduleName = moduleResult.recordset[0].module_name;
        const moduleDescription = moduleResult.recordset[0].description;

        // Fetch materials for the specific module
        const materialsResult = await pool.request().query(`
            SELECT material_id, title, link, description
            FROM Materials
            WHERE module_id = ${moduleId}
        `);

        // Fetch quizzes for the specific module
        const quizzesResult = await pool.request().query(`
            SELECT quiz_id, quiz_title
            FROM Quizzes
            WHERE module_id = ${moduleId}
        `);

        console.log('Quizzes result:', quizzesResult.recordset); // Debugging line

        res.json({
            module_name: moduleName,
            description: moduleDescription,
            materials: materialsResult.recordset,
            quizzes: quizzesResult.recordset
        });
    } catch (err) {
        console.error('Error fetching module details, materials, or quizzes:', err.message, err.stack);
        res.status(500).send('Error fetching module details, materials, or quizzes');
    }
});

// Start the server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
