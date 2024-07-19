const express = require('express');
const sql = require('mssql');

const app = express();

// Configuration for your SQL Server
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

// Middleware to set view engine and static folder
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route to fetch data from Courses table and render EJS template
app.get('/courses', async (req, res) => {
    try {
        // Connect to database
        await sql.connect(config);

        // Query to fetch all courses
        const query = `
            SELECT course_id, course_name, category, difficulty, description, payment_status, payment_amount, payment_date, enrolled_students, start_date, duration
            FROM Courses;
        `;

        // Execute query
        const result = await sql.query(query);

        // Render EJS template and pass courses data
        res.render('courses', { courses: result.recordset });

    } catch (err) {
        console.error('Error fetching courses:', err.message);
        res.status(500).send('Error fetching courses. Please try again later.');
    } 
});

let PORT = 3000
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
