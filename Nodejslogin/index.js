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

// Connect to MSSQL
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });
app.get('/login', (req, res) => {
    res.render('login'); // Render login.ejs template
});
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT student_id, student_name, email, password_hash FROM Student WHERE student_name = @username', (err, result) => {
                if (err) {
                    console.error('SQL error:', err);
                    return res.status(500).send('Server error');
                }

                if (result.recordset.length > 0) {
                    const user = result.recordset[0];
                    // Check password here; for simplicity, assuming password_hash is plaintext for now
                    if (user.password_hash === password) {
                        // Authentication successful
                        res.send('Login successful!');
                    } else {
                        // Authentication failed
                        res.send('Invalid username or password');
                    }
                } else {
                    // No user found
                    res.send('Invalid username or password');
                }
            });
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).send('Server error');
    }
});
// Start the server
app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
});
