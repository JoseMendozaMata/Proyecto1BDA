# Aplicación creada con Node.js con el framework express para realizar el API con mayor facilidad.

Requerimientos:

- Node.js
- npm

# Puesta en marcha:

En el archivo package.json se encuentran las dependencias del proyecto, por lo que deben colocarse en el root del proyecto en una terminal, luego ejecutar:

npm install

Esto descargará todas las dependencias necesarias para el proyecto, este folder se encuentra en el .gitignore porque es bastante pesada y se puede descargar fácilmente con el comando anterior.
Una vez descargadas las dependencias, ejecute:

nodemon app

Esto inicia la aplicación en la dirección localhost:3000, pueden entrar a esta dirección en su buscador para revisar que funcione, recuerden usar http en vez de https porque sino no funciona la conexión por razones de seguridad.
Una vez el servidor esté en marcha, todo debería funcionar. La base de datos es en Neo4j: La uri, el usuario y contraseña se encuentran en el archivo .env que se usa para realizar la conexión con js, entonces todo debería funcionar bien.
Si quieren hacer peticiones, usen Postman o algo parecido, revisen bien el formato del JSON y pueden añadir nodos y relaciones.

Usé esto para guiarme con el api:

https://www.youtube.com/watch?v=L72fhGm1tfE
https://www.youtube.com/watch?v=snjnJCZhXUM&t=1383s
