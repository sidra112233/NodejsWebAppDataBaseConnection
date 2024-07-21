const express = require('express');
const app = express();
const sql = require('mssql');

const config = {
    server: 'DESKTOP-5NP2PDK\\MSSQLSERVER2022',          // Your server name or IP address
    database: 'LearnCodePro',// Your database name
    driver: 'msnodesqlv8',
    user: 'Sidra',
    password: 'Sidra',
    options: {
        encrypt: true,             // Use encryption
        trustServerCertificate: true // Trust the server certificate
    }
};
// Middleware to parse JSON bodies
app.use(express.json());

// Route to fetch all courses
app.get('/courses', async (req, res) => {
    try {
        const pool = await sql.connect(config);

        // Fetch all courses
        const coursesResult = await pool.request().query(`
            SELECT course_id, course_name, description
            FROM Courses
        `);

        // Render EJS template with courses data
        res.render('courses', { courses: coursesResult.recordset });
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).send('Error fetching courses');
    }
});

// Route to fetch modules of a specific course
app.get('/courses/:courseId/modules', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const pool = await sql.connect(config);

        // Fetch modules for the specific course
        const modulesResult = await pool.request().query(`
            SELECT module_id, module_name, description
            FROM Modules
            WHERE course_id = ${courseId}
        `);

        // Render EJS template with modules data
        res.render('modules', { modules: modulesResult.recordset });
    } catch (err) {
        console.error('Error fetching modules:', err);
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
        res.render('materials', { materials: materialsResult.recordset });
    } catch (err) {
        console.error('Error fetching materials:', err);
        res.status(500).send('Error fetching materials');
    }
});



// Configure Express to use EJS as the view engine
app.set('view engine', 'ejs');
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
