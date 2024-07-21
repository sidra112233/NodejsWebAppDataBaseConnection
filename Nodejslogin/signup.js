// Import required modules
const express = require('express');
const sql = require('mssql');
const path = require('path');
// Create Express application
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

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

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        // Connect to the database
        const pool = await sql.connect(config);

        // Insert user data into Users table
        await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(50), password)
            .query(`
        INSERT INTO Student (student_name, email, password_hash)
        VALUES (@username, @email, @password)
      `);

        res.status(201).send('User signed up successfully');
    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).send('Error signing up');
    }
});

// Serve the EJS file
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('signup'); // Assuming your EJS file is named signup.ejs
});
// Start the server
app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
});
