// server.js

const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');

const app = express();
const port = 3000; // You can use any port you prefer

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

// Connect to MSSQL
sql.connect(config)
    .then(() => console.log('Connected to MSSQL'))
    .catch(err => console.error('Failed to connect to MSSQL', err));

// Routes
app.get('/login', (req, res) => {
    res.render('login'); // Render login page
});

app.get('/register', (req, res) => {
    res.render('register'); // Render registration page
});

app.post('/login', (req, res) => {
    const { student_name, password_hash } = req.body;

    // Perform SQL query to check credentials
    const query = `SELECT * FROM Student WHERE student_name = '${student_name}' AND password_hash = '${password_hash}'`;

    new sql.Request().query(query)
        .then(result => {
            if (result.recordset.length > 0) {
                res.send('Login successful'); // Replace with your logic for successful login
            } else {
                res.send('Login failed'); // Replace with your logic for failed login
            }
        })
        .catch(err => {
            console.error('SQL Error', err);
            res.status(500).send('Error logging in');
        });
});

app.post('/register', (req, res) => {
    const { student_name, password } = req.body;

    // Perform SQL query to insert new user into database
    const query = `INSERT INTO Student (student_name, password_hash) VALUES ('${student_name}', '${password}')`;

    new sql.Request().query(query)
        .then(() => {
            res.send('Registration successful'); // Replace with your logic for successful registration
        })
        .catch(err => {
            console.error('SQL Error', err);
            res.status(500).send('Error registering');
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
