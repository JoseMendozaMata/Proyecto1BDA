var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require("neo4j-driver");
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
var app = express();
const fs = require('fs');


//Para usar el .env config file, para estar seguros que credenciales y base de datos sean correctos
require("dotenv").config();

// Visualización
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//Credenciales para inniciar driver

const URI = process.env.URI;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

//Crear driver

var driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
    disableLosslessIntegers: true,
});
var session = driver.session();

//Middleware para usar el body del json para peticiones
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(fileUpload());

//Contadores como id's

var contInv = 0;
var contPry = 0;
var contPub = 0;

//Nétodos REST

app.get("/", function (req, res) {
    //Carga de datos puede ir en el root
});

// ----------- Investigadores ------------

//Obtener todos los investigadores
app.get("/investigadores", (req, res) => {
    const query = `MATCH (investigador:Investigador)
    RETURN investigador`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar las publicaciones
            linv = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener investigador de query
                inv = result.records[i].get("investigador").properties;

                linv.push(inv);
            }

            res.status(200).send({
                success: true,
                investigadores: linv,
            });
            return;
        })
        .catch((error) => {
            res.status(500).send({
                sucess: false,
                message: error.message,
            });
        });
});

/*se seleccionara el nombre
completo del investigador(a) y se mostrar en pantalla sus datos
basicos, asi como toda la informacion de las investigaciones en las
cuales participa
*/

app.get("/publicaciones_investigador", (req, res) => {
    const query = `MATCH (investigador:Investigador {id: ${req.body.id}})
    OPTIONAL MATCH (investigador)-[:TRABAJA_EN]->(proyecto:Proyecto)
    OPTIONAL MATCH (proyecto)<-[:RELACIONADO_CON]-(publicacion:Publicacion)
    RETURN publicacion, investigador`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar las publicaciones
            lpub = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener investigador de query
                inv = result.records[0].get("investigador").properties;
                //Obtener publicacion de query
                pub = result.records[i].get("publicacion");
                lpub.push(pub.properties);
            }

            res.status(200).send({
                success: true,
                investigador: inv,
                publicaciones: lpub,
            });
            return;
        })
        .catch((error) => {
            res.status(500).send({
                sucess: false,
                message: error.message,
            });
        });
});

app.post("/investigador", (req, res) => {
    const session = driver.session();
  
    const query = `CREATE (i:Investigador {
       id: $id,
       nombre_completo: $nombre_completo,
       titulo_academico: $titulo_academico,
       institucion: $institucion,
       email: $email
    })`;
  
    const params = {
      id: req.body.id,
      nombre_completo: req.body.nombre,
      titulo_academico: req.body.titulo,
      institucion: req.body.inst,
      email: req.body.email
    };
  
    session
      .writeTransaction((transaction) => {
        transaction.run(query, params)
          .then(() => {
            res.status(200).send({
              success: true,
            });
          })
          .catch((error) => {
            res.status(500).send({
              success: false,
              message: error.message,
            });
          })
          .finally(() => {
            session.close();
          });
      });
  });

app.put("/investigador", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `MATCH (i:Investigador)
    WHERE i.id = ${req.body.id}
    SET i.${req.body.atributo} = ${JSON.stringify(req.body.nuevo_valor)}
    `;
    session
        .run(query)

        .then((result) => {
            res.status(200).send({
                success: true,
                data: result.records,
            });
            return;
        })
        .catch((error) => {
            res.status(500).send({
                sucess: false,
                message: error.message,
            });
        });
});

// ----------- Proyectos ------------

app.post("/proyecto", async (req, res) => {
    const session = driver.session();
  
    try {
      const query = `
        CREATE (p:Proyecto {
          idPry: $id,
          titulo_proyecto: $titulo,
          anno_inicio: $anno,
          duracion_meses: $duracion,
          area_conocimiento: $area
        })
      `;
  
      const params = {
        id: req.body.id,
        titulo: req.body.titulo,
        anno: req.body.anno,
        duracion: req.body.duracion,
        area: req.body.area,
      };
  
      await session.writeTransaction(async (transaction) => {
        await transaction.run(query, params);
      });
  
      res.status(200).send({
        success: true,
        message: 'Proyecto node successfully created in Neo4j.',
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    } finally {
      session.close();
    }
  });

app.put("/proyecto", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `MATCH (p:Proyecto)
    WHERE p.idPry = ${req.body.id}
    SET p.${req.body.atributo} = ${JSON.stringify(req.body.nuevo_valor)}
    `;
    session
        .run(query)

        .then((result) => {
            res.status(200).send({
                success: true,
                data: result.records,
            });
            return;
        })
        .catch((error) => {
            res.status(500).send({
                sucess: false,
                message: error.message,
            });
        });
});

// ----------- Publicaciones ------------

app.post("/publicacion", async (req, res) => {
    const session = driver.session();
  
    try {
      const query = `
        CREATE (pb:Publicacion {
          idPub: $id,
          titulo_publicacion: $titulo,
          anno_publicacion: $anno,
          nombre_revista: $nombre
        })
      `;
  
      const params = {
        id: req.body.id,
        titulo: req.body.titulo,
        anno: req.body.anno,
        nombre: req.body.nombre,
      };
  
      await session.writeTransaction(async (transaction) => {
        await transaction.run(query, params);
      });
  
      res.status(200).send({
        success: true,
        message: 'Publicacion node successfully created in Neo4j.',
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    } finally {
      session.close();
    }
  });

app.put("/publicacion", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `MATCH (pb:Publicacion)
    WHERE pb.idPub = ${req.body.id}
    SET pb.${req.body.atributo} = ${JSON.stringify(req.body.nuevo_valor)}
    `;
    session
        .run(query)

        .then((result) => {
            res.status(200).send({
                success: true,
                data: result.records,
            });
            return;
        })
        .catch((error) => {
            res.status(500).send({
                sucess: false,
                message: error.message,
            });
        });
});

// -------------- Asociar investigador(a) ---------------

app.post("/associar_inv_proy", async (req, res) => {
    const session = driver.session();
  
    try {
      const query = `MATCH (i:Investigador), (p:Proyecto)
        WHERE i.id = $id_inv AND p.idPry = $id_pry AND NOT (i)-[:TRABAJA_EN]->(p)
        CREATE (i)-[:TRABAJA_EN]->(p)
      `;
  
      const params = {
        id_inv: req.body.id_inv,
        id_pry: req.body.id_pry,
      };
  
      await session.writeTransaction(async (transaction) => {
        await transaction.run(query, params);
      });
  
      res.status(200).send({
        success: true,
        message: 'Association between Investigador and Proyecto created in Neo4j.',
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    } finally {
      session.close();
    }
  });

// -------------- Asociar Artículo ---------------

app.post("/associar_pub_proy", async (req, res) => {
    const session = driver.session();
  
    try {
      const query = `
        MATCH (pb:Publicacion), (p:Proyecto)
        WHERE pb.idPub = $id_pub AND p.idPry = $id_pry AND NOT (pb)-[:RELACIONADO_CON]->(p)
        CREATE (pb)-[:RELACIONADO_CON]->(p)
      `;
  
      const params = {
        id_pub: req.body.id_pub,
        id_pry: req.body.id_pry,
      };
  
      await session.writeTransaction(async (transaction) => {
        await transaction.run(query, params);
      });
  
      res.status(200).send({
        success: true,
        message: 'Association between Publicacion and Proyecto created in Neo4j.',
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    } finally {
      session.close();
    }
  });


//Listen to port

app.listen(3000);
console.log("Server Started on Port 3000");

module.exports = app;
