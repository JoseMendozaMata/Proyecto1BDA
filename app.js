var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require("neo4j-driver");
var app = express();

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

var driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
var session = driver.session();

//Middleware para usar el body del json para peticiones
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//Contadores como id's

var contInv = 0;
var contPry = 0;
var contPub = 0;

//Nétodos REST

app.get("/", function (req, res) {
    //Carga de datos puede ir en el root
});

// ----------- Investigadores ------------

app.post("/investigador", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `CREATE (i: Investigador {
        id: ${contInv},
        nombre_completo: ${JSON.stringify(req.body.nombre)}, 
        titulo_academico:${JSON.stringify(req.body.titulo)}, 
        institucion:${JSON.stringify(req.body.inst)}, 
        email:${JSON.stringify(req.body.email)}
    })`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Aumentar contador
            contInv += 1;

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

    //res.send(req.body);
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

app.post("/proyecto", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `CREATE (p: Proyecto {
        idPry: ${contPry},
        titulo_proyecto: ${JSON.stringify(req.body.titulo)}, 
        anno_inicio:${JSON.stringify(req.body.anno)}, 
        duracion_meses:${JSON.stringify(req.body.duracion)}, 
        area_conocimiento:${JSON.stringify(req.body.area)}
    })`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Aumentar contador
            contPry += 1;
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

    //res.send(req.body);
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

app.post("/publicacion", (req, res) => {
    //nombres de acuerdo a los ejemplos de los .csv
    const query = `CREATE (pb: Publicacion {
        idPub: ${contPub},
        titulo_publicacion: ${JSON.stringify(req.body.titulo)}, 
        anno_publicacion:${JSON.stringify(req.body.anno)}, 
        nombre_revista:${JSON.stringify(req.body.nombre)}
    })`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Aumentar contador
            contPub += 1;

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

    //res.send(req.body);
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

app.post("/associar_inv_proy", (req, res) => {
    const query = `MATCH (i:Investigador), (p:Proyecto)
    WHERE i.id = ${req.body.id_inv} AND p.idPry = ${req.body.id_pry} AND NOT (i)-[:TRABAJA_EN]->(p)
    CREATE (i)-[:TRABAJA_EN]->(p)`;

    console.log(query);

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

// -------------- Asociar Artículo ---------------

app.post("/associar_pub_proy", (req, res) => {
    const query = `MATCH (pb:Publicacion), (p:Proyecto)
    WHERE pb.idPub = ${req.body.id_pub} AND p.idPry = ${req.body.id_pry} AND NOT (pb)-[:RELACIONADO_CON]->(p)
    CREATE (pb)-[:RELACIONADO_CON]->(p)`;

    console.log(query);

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

//Listen to port

app.listen(3000);
console.log("Server Started on Port 3000");

module.exports = app;
