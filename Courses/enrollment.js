const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Body parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

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

// Routes
app.get('/', (req, res) => {
    res.render('enroll');
});

app.post('/enroll', (req, res) => {
    // Handle form submission
    const { name, email } = req.body;
    // You can process the form data here (e.g., save to database)
    res.send(`Enrollment successful for ${name} with email ${email}`);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
