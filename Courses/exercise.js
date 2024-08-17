const express = require('express');
const path = require('path');
const sql = require('mssql');

const app = express();

// Database configuration
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

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Route to get exercises for a specific module
app.get('/exercises/:moduleId', async (req, res) => {
    const moduleId = req.params.moduleId; // Get the module ID from the URL parameter

    try {
        const pool = await sql.connect(config);
        // Query to fetch exercises for the specific module ID
        const result = await pool.request()
            .input('moduleId', sql.Int, moduleId) // Use parameterized query to prevent SQL injection
            .query('SELECT * FROM Exercises WHERE module_id = @moduleId');
        
        const exercises = result.recordset;
        res.render('exercise', { exercises }); // Pass exercises to the view
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Server error');
    }
});



// Home route
app.get('/', (req, res) => {
    res.send('Home Page');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
