const { Pool } = require('pg'); // on prend juste Pool de pg
 
const config = { // connexion à PostGreSQL
    user: 'postgres',
    host: 'localhost',
    database: 'genoa',
    password: '1234',
    port: 5432, // port par défaut de PostGre
};
 
const pool = new Pool(config); // pool = groupe de connexions ouvertes en permanence
 
module.exports = pool; // export pour pouvoir être utilisé par les routes
