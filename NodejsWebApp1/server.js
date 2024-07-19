const sql = require('mssql');
const express = require('express');
const app = express();
const port = 3000;

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

async function executeQuery() {
    try {
        // Connect to the database
        await sql.connect(config);

        // Query database
        const result = await sql.query`SELECT * FROM Student`; // Replace YourTableName with your actual table name
        console.log(result.recordset); // Output the result set

    } catch (err) {
        console.error('Error querying database:', err);
    } 
}

// Call the function to execute the query
executeQuery();

