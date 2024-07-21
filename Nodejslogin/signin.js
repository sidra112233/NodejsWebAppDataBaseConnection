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
// Route to serve the sign-in form
app.get('/signin', (req, res) => {
    res.render('signin'); // Assuming your EJS file is named signin.ejs
});

// Route to handle POST request for sign-in
app.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Connect to the database
        const pool = await sql.connect(config);

        // Check if user exists with provided credentials
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(50), password)
            .query(`
        SELECT student_name
        FROM Student
        WHERE student_name = @student_name AND password_hash = @password_hash
      `);

        // If user exists, redirect or send success message
        if (result.recordset.length > 0) {
            res.send(`Welcome ${username}!`);
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error signing in:', err);
        res.status(500).send('Error signing in');
    }
});
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
app.get('/signup', (req, res) => {
    res.render('signup'); // Assuming your EJS file is named signup.ejs
});

// Configure Express to use EJS as the view engine
// Start the server
app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
});