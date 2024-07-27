const express = require('express');
const sql = require('mssql');
const config = require('./config'); // Ensure the correct path

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
            selectedModule: ''
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
            SELECT module_id, module_name, description
            FROM Modules
            WHERE course_id = ${courseId}
        `);

        // Render EJS template with modules data, course name, and course description
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

// Route to fetch materials of a specific module
app.get('/modules/:moduleId/materials', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const pool = await sql.connect(config);

        // Fetch materials for the specific module
        const materialsResult = await pool.request().query(`
            SELECT material_id, title, link
            FROM Materials
            WHERE module_id = ${moduleId}
        `);

        // Render EJS template with materials data
        res.json({
            materials: materialsResult.recordset
        });
    } catch (err) {
        console.error('Error fetching materials:', err.message, err.stack);
        res.status(500).send('Error fetching materials');
    }
});

// Start the server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
