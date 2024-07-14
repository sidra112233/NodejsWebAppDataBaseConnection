// Require necessary modules
const sql = require('mssql');
const express = require('express');

// Initialize Express app

app.use(express.json());
// Middleware setup

// Configure database connection
const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'DESKTOP-5NP2PDK\MSSQLSERVER2022',    // Your SQL Server instance
    database: 'LearnCodePro',
    options: {
        Trustedconnection : true 
        enableArithAbort: true  // Use this if you are on SQL Server 2019 or newer
    }
};

// Define a route that connects to SQL Server and executes a query
app.get('/data', async (req, res) => {
    try {
        // Connect to database
        await sql.connect(config);

        // Query
        const result = await sql.query`SELECT * FROM Student`;

        // Send response
        res.json(result.recordset);

    } catch (err) {
        console.error('Error connecting to SQL Server or executing query:', err);
        res.status(500).send('Error connecting to SQL Server or executing query');
    } finally {
        // Close the connection
        sql.close();
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
