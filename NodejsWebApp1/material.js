const sql = require('mssql');
const express = require('express');
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
const sql = require('mssql');
// Function to fetch questions from the database
async function fetchQuestions() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM QuizQuestions');
        return result.recordset;
    } catch (err) {
        console.error('SQL error', err);
    }
}

// Function to store quiz score in the database
async function storeScore(userId, score) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('student_id', sql.Int, userId)
            .input('score', sql.Int, score)
            .query('INSERT INTO QuizSubmissions (student_id, score) VALUES (@student_id, @score)');
    } catch (err) {
        console.error('SQL error', err);
    }
}

// Example usage
(async () => {
    let questions = await fetchQuestions();
    console.log('Fetched Questions:', questions);

    // Simulate quiz submission
    let student_id = 1; // Example user ID
    let score = 85; // Example score
    await storeScore(student_id, score);
    console.log('Score stored successfully');
})();

