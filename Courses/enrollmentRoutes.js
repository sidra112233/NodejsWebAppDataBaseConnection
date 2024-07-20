const express = require('express');
const router = express.Router();
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

// POST /enroll - Enroll a student in a course
router.post('/enroll', async (req, res) => {
    const { student_id, course_id } = req.body;
    const enrollment_date = new Date().toISOString().split('T')[0]; // Today's date

    try {
        await sql.connect(config);

        // Check if student is already enrolled in the course
        const checkQuery = `
            SELECT * FROM Enrollments
            WHERE student_id = @student_id AND course_id = @course_id;
        `;
        const checkRequest = new sql.Request();
        checkRequest.input('student_id', sql.Int, student_id);
        checkRequest.input('course_id', sql.Int, course_id);
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset.length > 0) {
            return res.status(400).send('Student is already enrolled in the course.');
        }

        // Insert enrollment record
        const insertQuery = `
            INSERT INTO Enrollments (student_id, course_id, enrollment_date)
            VALUES (@student_id, @course_id, @enrollment_date);
        `;
        const insertRequest = new sql.Request();
        insertRequest.input('student_id', sql.Int, student_id);
        insertRequest.input('course_id', sql.Int, course_id);
        insertRequest.input('enrollment_date', sql.Date, enrollment_date);
        await insertRequest.query(insertQuery);

        res.status(201).send('Student enrolled successfully.');

    } catch (err) {
        console.error('Error enrolling student:', err.message);
        res.status(500).send('Error enrolling student. Please try again later.');
    } 
});

module.exports = router;
