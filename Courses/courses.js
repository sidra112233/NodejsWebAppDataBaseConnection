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
app.get('/courses', async (req, res) => {
    try {
        const pool = await sql.connect(config);

        // Fetch courses with modules and materials
        const coursesResult = await pool.request().query(`
      SELECT c.course_id, c.course_name, c.description as course_description,
             m.module_id, m.module_name, m.description as module_description,
             ma.material_id, ma.title, ma.link
      FROM Courses c
      LEFT JOIN Modules m ON c.course_id = m.course_id
      LEFT JOIN Materials ma ON m.module_id = ma.module_id
    `);

        // Organize data into structured format
        const courses = [];
        let currentCourse = null;
        let currentModule = null;

        for (let record of coursesResult.recordset) {
            if (!currentCourse || currentCourse.course_id !== record.course_id) {
                // New course encountered
                currentCourse = {
                    course_id: record.course_id,
                    course_name: record.course_name,
                    description: record.course_description,
                    modules: []
                };
                courses.push(currentCourse);
            }

            if (!currentModule || currentModule.module_id !== record.module_id) {
                // New module encountered
                currentModule = {
                    module_id: record.module_id,
                    module_name: record.module_name,
                    description: record.module_description,
                    materials: []
                };
                currentCourse.modules.push(currentModule);
            }

            // Add material if exists
            if (record.material_id) {
                currentModule.materials.push({
                    material_id: record.material_id,
                    title: record.title,
                    link: record.link
                });
            }
        }

        // Render EJS template with courses data
        res.render('courses', { courses });
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).send('Error fetching courses');
    }
});

// Configure Express to use EJS as the view engine
app.set('view engine', 'ejs');

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
