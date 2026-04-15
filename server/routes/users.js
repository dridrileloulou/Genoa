const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js'); // pool


//Affiche l'erreur côté serveur (node) et client(postman ou reactnative)
const handleError = (res, err, route) => {  
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// ---- API REST ----

// -- GET -- 
router.get('/users', (req, res) => {

    //on va chercher côté bdd (pool.query = va chercher dans la BDD sql)
    pool.query('SELECT * FROM users')   
    .then(result => {
        res.json(result.rows);
        console.log('GET de tous les users réussi !')
    })
    .catch(err => handleError(res, err, 'GET /users'))
});


// -- GET (specific user) --
router.get('/users/:id', (req, res) => {

    const id = req.params.id
    
    pool.query(`SELECT * FROM users WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET réussi sur l'utilisateur id = ${id} !`)
    })
    .catch(err => handleError(res, err, 'GET /users/:id'))

});
// -- POST -- 
router.post('/users', (req, res) => { // /post <email> <password>

    const email = req.body.email 
    const password = req.body.password

    // En SQL, pour différencier valeurs et nom de colonne = ''
    // par défaut, role et false sont nuls   
    pool.query(`INSERT INTO users (email, password, role, validé) VALUES ('${email}', '${password}', 'user', false) ;`) 
    .then(result => {
        res.json(`Ajout de l'utilisateur ${email} !`);
        console.log(`Ajout de l'utilisateur ${email} !`);
    })
    .catch(err => handleError(res, err, 'POST /users'))
    
});

// -- PATCH -- 
router.patch('/users/:id', (req, res) => {

    const email = req.body.email 
    const password = req.body.password
    const role = req.body.role
    const validé = req.body.valide

    const id = req.params.id
    pool.query(`UPDATE users SET email = '${email}',password = '${password}',role = '${role}',"validé" = '${validé}' WHERE id = ${id} ;`) 
    .then(result => {
        res.json(`Mise à jour réussie sur l'utilisateur ${email} !`);
        console.log(`Mise à jour réussie sur l'utilisateur ${email} !`);
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
    
});

// -- DELETE -- 
router.delete('/users/:id', (req, res) => {

    const id = req.params.id
    
    pool.query(`DELETE FROM users WHERE id = ${id};`) 
    .then(result => {
        res.json(`Supression de l'utilisateur id = ${id} réussie !`);
        console.log(`Supression de l'utilisateur id = ${id} réussie !`);
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
    
});

module.exports = router;
