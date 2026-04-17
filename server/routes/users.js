const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js'); // pool
const { isEditor, isAdmin } = require('../middleware/roles.js');
const verifyToken = require('../middleware/auth.js');



//Affiche l'erreur côté serveur (node) et client(postman ou reactnative)
const handleError = (res, err, route) => {  
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// ---- API REST ----

// -- GET -- 
router.get('/users', verifyToken, isAdmin, (req, res) => {

    //on va chercher côté bdd (pool.query = va chercher dans la BDD sql)
    pool.query('SELECT * FROM users')   
    .then(result => {
        res.json(result.rows);
        console.log('GET de tous les users réussi !')
    })
    .catch(err => handleError(res, err, 'GET /users'))
});


// -- GET (specific user) --
router.get('/users/:id', verifyToken, isAdmin, (req, res) => {

    const id = req.params.id
    
    pool.query(`SELECT * FROM users WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET réussi sur l'utilisateur id = ${id} !`)
    })
    .catch(err => handleError(res, err, 'GET /users/:id'))

});

// -- POST -- = seule route accessible pour un user lambda
router.post('/users', (req, res) => { // /post <email> <password>

    const email = req.body.email 
    const password = req.body.password

    // En SQL, pour différencier valeurs et nom de colonne = ''
    // par défaut, role et false sont nuls   
    pool.query(`INSERT INTO users (email, password, role, validé) VALUES ('${email}', '${password}', 'lecteur', false) ;`) 
    .then(result => {
        res.json(`Ajout de l'utilisateur ${email} !`);
        console.log(`Ajout de l'utilisateur ${email} !`);

        // cas premier utilisateur :

        pool.query('SELECT * FROM users')
        .then(result => {
        if (result.rows.length === 1){
            pool.query(`UPDATE users SET role = 'admin', "validé" = true WHERE email = '${email}'`)
        }
        })
    })
    .catch(err => handleError(res, err, 'POST /users'))

    
});

// -- PATCH --
// Mise à jour partielle : on ne modifie que les champs envoyés dans le body
// Retourne l'utilisateur mis à jour pour que le front puisse rafraîchir l'affichage
router.patch('/users/:id', verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    const { email, password, role, valide } = req.body;

    // On construit dynamiquement la requête avec seulement les champs fournis
    const fields = [];
    const values = [];
    let idx = 1;

    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (password !== undefined) { fields.push(`password = $${idx++}`); values.push(password); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (valide !== undefined) { fields.push(`"validé" = $${idx++}`); values.push(valide); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ à modifier' });
    }

    values.push(id); // dernier paramètre = id pour le WHERE
    pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values)
    .then(result => {
        res.json(result.rows[0]); // retourne l'user mis à jour
        console.log(`Mise à jour réussie sur l'utilisateur id=${id} !`);
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
});

// -- DELETE -- 
router.delete('/users/:id', verifyToken, isAdmin, (req, res) => {

    const id = req.params.id
    
    pool.query(`DELETE FROM users WHERE id = ${id};`) 
    .then(result => {
        res.json(`Supression de l'utilisateur id = ${id} réussie !`);
        console.log(`Supression de l'utilisateur id = ${id} réussie !`);
    })
    .catch(err => handleError(res, err, 'PATCH /users'))
    
});

module.exports = router;
