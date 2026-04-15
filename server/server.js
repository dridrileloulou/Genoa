const express = require('express');
const cors = require('cors');

const app = express(); // 👈 ICI app est créé

app.use(cors());
app.use(express.json());

const {Pool} = require ('pg'); // import de Pool uniquement dans biblio pg


//config
const config = {
    user : 'postgres',
    host : 'localhost',
    database : 'genoa',
    password : '1234',
    port : 5432,
};

const pool = new Pool (config);

app.use(express.json()); // pour que express lise du Json

//Affiche l'erreur côté serveur (node) et client(postman ou react)
const handleError = (res, err, route) => {  
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// ---- API REST ----

//console.log("Server is running on http://localhost:3000");


// -- GET -- 
app.get('/users', (req, res) => {
    console.log("GET /users hit");

    //on va chercher côté bdd (pool.query = va chercher dans la BDD sql)
    pool.query('SELECT * FROM users')   
    .then(result => {
        res.json(result.rows);
        console.log('GET réussi !')
    })
    .catch(err => handleError(res, err, 'GET /users'))
});


// -- GET (specific user) --
app.get('/users/:id', (req, res) => {
    console.log("GET /users/:id hit");

    let id = req.params.id
    
    pool.query(`SELECT * FROM users WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log('GET réussi !')
    })
    .catch(err => handleError(res, err, 'GET /users'))

});
// -- POST -- 
app.post('/users', (req, res) => { // /post <email> <password>
    console.log("POST /users hit");
    let email = req.body.email 
    let password = req.body.password

    // En SQL, pour différencier valeurs et nom de colonne = ''
    // par défaut, role et false sont nuls   
    pool.query(`INSERT INTO users (email, password, role, validé) VALUES ('${email}', '${password}', 'user', false) ;`) 
    .then(result => {
        res.json(result.rows);
        console.log("Nouvel ajout d'utilisateur réussi !");
    })
    .catch(err => handleError(res, err, 'POST /users'))
    
});

// -- PATCH -- 
app.patch('/users/:id', (req, res) => {
    console.log("PATCH /users/:id hit");
    let email = req.body.email 
    let password = req.body.password
    let role = req.body.role
    let validé = req.body.valide

    let id = req.params.id
    pool.query(`UPDATE users SET email = '${email}',password = '${password}',role = '${role}',"validé" = '${validé}' WHERE id = ${id} ;`) 
    .then(result => {
        res.json(result.rows);
        console.log("Update d'utilisateur réussi !");
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
    
});

// -- DELETE -- 
app.delete('/users/:id', (req, res) => {
    console.log("DELETE /users/:id hit");
    let id = req.params.id
    
    pool.query(`DELETE FROM users WHERE id = ${id};`) 
    .then(result => {
        res.json(result.rows);
        console.log("Supression d'utilisateur réussi !");
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
    
});


app.listen(3000, '0.0.0.0', () => {
  console.log("Server running");
});
