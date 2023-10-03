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

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Credenciales para inniciar driver

const URI = process.env.URI;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT;

//Crear driver

var driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
    disableLosslessIntegers: true,
});
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
                inv = {
                    name: result.records[i].get("investigador").properties.nombre_completo,
                    "Investigador": result.records[i].get("investigador").properties.nombre_completo,
                    Id: result.records[i].get("investigador").properties.id,
                    "Titulo Academico": result.records[i].get("investigador").properties.titulo_academico,
                    "Institucion": result.records[i].get("investigador").properties.institucion,
                    "Email": result.records[i].get("investigador").properties.email
                };

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

/*Se seleccionara el nombre
completo del investigador(a) y se mostrar en pantalla sus datos
basicos, asi como toda la informacion de las investigaciones en las
cuales participa
*/

app.get("/publicaciones_investigador/:id", (req, res) => {
    const query = `MATCH (i:Investigador {id: '${req.params.id}'})
    OPTIONAL MATCH (i)-[:TRABAJA_EN]->(p:Proyecto)
    OPTIONAL MATCH (p)<-[:RELACIONADO_CON]-(pb:Publicacion)
    RETURN i as investigador, pb as publicacion`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar las publicaciones
            lpub = [];
            //Obtener investigador de query
            console.log(result);
            inv = {
                name: result.records[0].get("investigador").properties.nombre_completo,
                "Investigador": result.records[0].get("investigador").properties.nombre_completo,
                Id: result.records[0].get("investigador").properties.id,
                "Titulo Academico": result.records[0].get("investigador").properties.titulo_academico,
                "Institucion": result.records[0].get("investigador").properties.institucion,
                "Email": result.records[0].get("investigador").properties.email
            };
            lpub.push(inv);
        

            for (let i = 0; i < result.records.length; i++) {
                //Obtener publicacion de query
                pub = {
                    name:result.records[i].get("publicacion").properties.titulo_publicacion,
                    "Articulo":result.records[i].get("publicacion").properties.titulo_publicacion,
                    Id:result.records[i].get("publicacion").properties.idPub,
                    "Año de Publicacion":result.records[i].get("publicacion").properties.anno_publicacion,
                    "Nombre de la Revista" : result.records[i].get("publicacion").properties.nombre_revista,
                }
                lpub.push(pub);
            }

            res.status(200).send({
                success: true,
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

//Top 5 investigadores que participan en más investigaciones
app.get("/top_5_investigadores", (req, res) => {
    const query = `MATCH (i:Investigador)-[TRABAJA_EN]->(p:Proyecto)
    WITH i, p
    MATCH (pb:Publicacion)-[RELACIONADO_CON]->(p:Proyecto)
        WHERE pb.idPub IS NOT NULL
        WITH i AS Investigador, count(p) AS count
        ORDER BY count DESC
        LIMIT 5
        RETURN Investigador, count`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar los proyectos
            linst = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener area_conocimiento de query
                inv = result.records[i].get("Investigador");
                //Obtener cantidad de ocurrencias de query
                count = result.records[i].get("count");

                console.log(i);

                //Crear objeto con el nombre completo, la institución donde labora y la cantidad de proyectos de investigación
                const obj = {
                    name:inv.properties["nombre_completo"],
                    "Investigador": inv.properties["nombre_completo"],
                    "Institucion": inv.properties["institucion"],
                    "Cantidad de Proyectos": count,
                };

                linst.push(obj);
            }

            res.status(200).send({
                success: true,
                investigadores: linst,
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

//Crear investigador
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

//Obtener todos los proyectos de la BD
app.get("/proyectos", (req, res) => {
    const query = `MATCH (p:Proyecto)
    RETURN p`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar los proyectos
            lproy = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener proyectos de query
                proy = {
                    name: result.records[i].get("p").properties.titulo_proyecto,
                    "Proyectos":result.records[i].get("p").properties.titulo_proyecto,
                    Id:result.records[i].get("p").properties.idPry,
                    "Año de Inicio":result.records[i].get("p").properties.anno_inicio,
                    "Duracion (meses)" : result.records[i].get("p").properties.duracion_meses,
                    "Area de Conocimiento":result.records[i].get("p").properties.area_conocimiento
                }

                lproy.push(proy);
            }

            res.status(200).send({
                success: true,
                proyectos: lproy,
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

//Obtener todas las publicaciones de la BD
app.get("/publicaciones", (req, res) => {
    const query = `MATCH (p:Publicacion)
    RETURN p`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar los proyectos
            lpub = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener proyectos de query
                pub = {
                    name: result.records[i].get("p").properties.titulo_publicacion,
                    "Articulo":result.records[i].get("p").properties.titulo_publicacion,
                    Id:result.records[i].get("p").properties.idPub,
                    "Año de Publicacion":result.records[i].get("p").properties.anno_publicacion,
                    "Nombre de la Revista" : result.records[i].get("p").properties.nombre_revista,
                }

                lpub.push(pub);
            }

            res.status(200).send({
                success: true,
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

//Obtener top 5 areas de conocimiento que cuenten con mayor cantidad de publicaciones
app.get("/top_5_area_conocimiento", (req, res) => {
    const query = `MATCH (p:Proyecto)
    WHERE p.area_conocimiento IS NOT NULL
    WITH p.area_conocimiento AS AreaConocimiento, count(p.area_conocimiento) AS count
    ORDER BY count DESC
    LIMIT 5
    RETURN AreaConocimiento, count`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar los proyectos
            lareas = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener area_conocimiento de query
                a = result.records[i].get("AreaConocimiento");
                //Obtener cantidad de ocurrencias de query
                c = result.records[i].get("count");

                //Crear objeto con area_conocimiento y cantidad
                const obj = {
                    name: a,
                    "Area de Conocimiento": a,
                    "Cantidad de Proyectos": c,
                };

                lareas.push(obj);
            }

            res.status(200).send({
                success: true,
                publicaciones: lareas,
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

//Obtener top 5 instituciones que cuenten con mayor cantidad de publicaciones
app.get("/top_5_instituciones", (req, res) => {
    const query = `MATCH (i:Investigador)-[RELACIONADO_CON]->(p:Proyecto)
        WHERE i.institucion IS NOT NULL
        WITH i.institucion AS Institucion, count(p) AS count
        ORDER BY count DESC
        LIMIT 5
        RETURN Institucion, count`;

    session //nombres de acuerdo a los ejemplos de los .csv
        .run(query)

        .then((result) => {
            //Lista para guardar los proyectos
            linst = [];

            for (let i = 0; i < result.records.length; i++) {
                //Obtener area_conocimiento de query
                inst = result.records[i].get("Institucion");
                //Obtener cantidad de ocurrencias de query
                count = result.records[i].get("count");

                console.log(i);

                //Crear objeto con area_conocimiento y cantidad
                const obj = {
                    name: ins,
                    "Institución": inst,
                    "Cantidad de Proyectos": count,
                };

                linst.push(obj);
            }

            res.status(200).send({
                success: true,
                publicaciones: linst,
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

app.listen(PORT);
console.log(`Server Started on Port ${PORT}`);

module.exports = app;
