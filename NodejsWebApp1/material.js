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
// Function to insert data into the Materials table
async function fetchMaterials() {
    try {
        // Connect to the MSSQL database
        await sql.connect(config);

        // SQL query to fetch data from the Materials table
        const query = 'SELECT * FROM Materials;';

        // Execute the query
        const result = await sql.query(query);

        // Display fetched data
        console.log('Material data:');
        console.table(result.recordset); // Display fetched data in a table format

    } catch (err) {
        console.error('Error fetching material data:', err.message);
    } 
}

// Call the fetchMaterials function
fetchMaterials();