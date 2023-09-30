const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

const invURL = 'http://localhost:3000/investigador';
const proyURL = 'http://localhost:3000/proyecto';
const pubURL = 'http://localhost:3000/publicacion';
const ipURL = 'http://localhost:3000/associar_inv_proy';
const ppURL = 'http://localhost:3000/associar_pub_proy';
 

// Posts de Investigadores
fs.createReadStream('data/Investigadores.csv') // Replace with the path to your CSV file
  .pipe(csv())
  .on('data', (row) => {
    const data = {
      id: row.id,
      nombre: row.nombre_completo,
      titulo: row.titulo_academico,
      inst: row.institucion,
      email: row.email,
    };

    // Send a POST request to the API for each row
    axios.post(invURL, data)
      .then((response) => {
        console.log(`Successfully posted data for ID: ${data.id}`);
      })
      .catch((error) => {
        console.error(`Failed to post data for ID: ${data.id}`);
        console.error(error);
      });

  })
  .on('end', () => {
    console.log('Investigadores CSV file processing complete.');
  });

  //Posts de Proyectos
fs.createReadStream('data/Proyectos.csv') // Replace with the path to your CSV file
.pipe(csv())
.on('data', (row) => {
  const data = {
    id: row.idPry,
    titulo: row.titulo_proyecto,
    anno: row.anno_inicio,
    duracion: row.duracion_meses,
    area: row.area_conocimiento,
  };

  // Send a POST request to the API for each row
  axios.post(proyURL, data)
    .then((response) => {
      console.log(`Successfully posted data for ID: ${data.id}`);
    })
    .catch((error) => {
      console.error(`Failed to post data for ID: ${data.id}`);
      console.error(error);
    });
    
})
.on('end', () => {
  console.log('Project CSV file processing complete.');
});

// Posts de Publicaciones
fs.createReadStream('data/Publicaciones.csv') // Replace with the path to your CSV file
.pipe(csv())
.on('data', (row) => {
  const data = {
    id: row.idPub,
    titulo: row.titulo_publicacion,
    anno: row.anno_publicacion,
    nombre: row.nombre_revista,
  };

  // Send a POST request to the API for each row
  axios.post(pubURL, data)
    .then((response) => {
      console.log(`Successfully posted data for ID: ${data.id}`);
    })
    .catch((error) => {
      console.error(`Failed to post data for ID: ${data.id}`);
      console.error(error);
    });

})
.on('end', () => {
  console.log('Publicaiones CSV file processing complete.');
});

