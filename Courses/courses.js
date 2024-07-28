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

        res.json({
            courseName,
            courseDescription,
            modules: modulesResult.recordset
        });
    } catch (err) {
        console.error('Error fetching modules:', err.message, err.stack);
        res.status(500).send('Error fetching modules');
    }
});

// Route to fetch module details and materials
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

        res.json({
            module_name: moduleName,
            description: moduleDescription,
            materials: materialsResult.recordset
        });
    } catch (err) {
        console.error('Error fetching module details or materials:', err.message, err.stack);
        res.status(500).send('Error fetching module details or materials');
    }
});


// Start the server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
