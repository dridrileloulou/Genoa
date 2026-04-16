const { Pool } = require('pg'); // pool = fonction "tirer", importé depuis pg (postgre)
 
const config = { // connexion à PostGreSQL
    user: 'postgres',
    host: 'localhost',
    database: 'genoa',
    password: '1234',
    port: 5432, // port par défaut de PostGre
};
 
const pool = new Pool(config); // 
 
module.exports = pool; // export pour pouvoir être utilisé par les routes
