const axios = require('axios');
const fs = require('fs');

async function loadCSVToNeo4jAura(
  csvFilePath,
  neo4jUrl,
  neo4jUsername,
  neo4jPassword
) {
  try {
    // Read the CSV file
    const csvData = fs.readFileSync(csvFilePath, 'utf8');

    // Prepare the Cypher query to load the CSV data
    const cypherQuery = `
      USING PERIODIC COMMIT
      LOAD CSV WITH HEADERS FROM 'data:text/csv;charset=utf-8,${encodeURIComponent(
        csvData
      )}' AS row
      CREATE (:Person {
        id: toInteger(row.id),
        nombre_completo: row.nombre_completo,
        titulo_academico: row.titulo_academico,
        institucion: row.institucion,
        email: row.email
      });
    `;

    // Define the Neo4j HTTP API endpoint for executing queries
    const apiUrl = `${neo4jUrl}/db/data/transaction/commit`;

    // Prepare the request payload
    const requestData = {
      statements: [
        {
          statement: cypherQuery,
          resultDataContents: ['row', 'graph'],
        },
      ],
    };

    // Send the HTTP POST request to Neo4j
    const response = await axios.post(apiUrl, requestData, {
      auth: {
        username: neo4jUsername,
        password: neo4jPassword,
      },
    });

    console.log('CSV data loaded into Neo4j Aura successfully.');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error loading CSV data into Neo4j Aura:', error.message);
  }
}
// Usage example:
const csvFilePath = 'data/Investigadores.csv';
const neo4jUrl = "neo4j+s://82f36757.databases.neo4j.io";
const neo4jUsername = "neo4j";
const neo4jPassword = "12345678";

loadCSVToNeo4jAura(csvFilePath, neo4jUrl, neo4jUsername, neo4jPassword);
