const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');


const ipURL = 'http://localhost:3080/associar_inv_proy';
const ppURL = 'http://localhost:3080/associar_pub_proy';
 
// Posts de InvestigadoresProy
const loadAsociaciones = () => {
  fs.createReadStream('data/InvestigadoresProy.csv') // Replace with the path to your CSV file
  .pipe(csv())
  .on('data', (row) => {
    const data = {
      id_inv: row.idInv,
      id_pry: row.idProy,
    };

    // Send a POST request to the API for each row
    axios.post(ipURL, data)
      .then((response) => {
        console.log(`Successfully posted data for ID: ${data.id_inv}`);
      })
      .catch((error) => {
        console.error(`Failed to post data for ID: ${data.id_inv}`);
        // console.error(error);
      });

  })
  .on('end', () => {
    console.log('Investigador-Proyecto CSV file processing complete.');
  });

  // Posts de PublicacionesProy

  fs.createReadStream('data/PublicacionesProy.csv') // Replace with the path to your CSV file
  .pipe(csv())
  .on('data', (row) => {
    const data = {
      id_pry: row.idProyecto, // Parse as integer
      id_pub: row.idArt, // Parse as integer
    };

    // Send a POST request to the API for each row
    axios.post(ppURL, data)
      .then((response) => {
        console.log(`Successfully posted data for ID: ${data.id_proy}`);
      })
      .catch((error) => {
        console.error(`Failed to post data for ID: ${data.id_proy}`);
        // console.error(error);
      });

  })
  .on('end', () => {
    console.log('Publicacion-Proyecto CSV file processing complete.');
  });
}
module.exports.loadAsociaciones = loadAsociaciones;