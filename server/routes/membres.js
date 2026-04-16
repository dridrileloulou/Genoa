const express = require('express'); // express
const router = express.Router(); // routeur
const pool = require('../db/pool.js'); // pool
const { isEditor, isAdmin } = require('../middleware/roles.js'); // pour les roles (user,éditeur,admin)


//Affiche l'erreur côté serveur (node) et client(postman ou reactnative)
const handleError = (res, err, route) => {  
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// ---- API REST ----

// -- GET -- 
router.get('/membres', (req, res) => {

    //on va chercher côté bdd (pool.query = va chercher dans la BDD sql)
    pool.query('SELECT * FROM membres')   
    .then(result => {
        res.json(result.rows);
        console.log('GET de tous les membres réussi !')
    })
    .catch(err => handleError(res, err, 'GET /membres'))
});


// -- GET (specific user) --
router.get('/membres/:id', (req, res) => {

    const id = req.params.id
    
    pool.query(`SELECT * FROM membres WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET membre id=${id} réussi !`)
    })
    .catch(err => handleError(res, err, 'GET /membres/:id'))

});

// -- POST -- 
router.post('/membres', isEditor, (req, res) => {
    const { sexe, prénom, nom, date_naissance, date_décès, id_user, informations_complémentaires, photo, privé, id_union, biologique } = req.body;
    pool.query(`INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique) VALUES ('${sexe}', '${prénom}', '${nom}', '${date_naissance}', ${date_décès ? `'${date_décès}'` : 'NULL'}, ${id_user}, ${informations_complémentaires ? `'${informations_complémentaires}'` : 'NULL'}, ${photo ? `'${photo}'` : 'NULL'}, ${privé}, ${id_union ? id_union : 'NULL'}, ${biologique !== undefined ? biologique : 'NULL'})`)
    .then(result => {
        res.json(`Nouveau membre ${nom} ${prénom} ajouté !`);
        console.log(`Nouveau membre ${nom} ${prénom} ajouté !`);
    })
    .catch(err => handleError(res, err, 'POST /membres'))
});


// -- PATCH -- 
router.patch('/membres/:id', isEditor, (req, res) => {
    const { sexe, prénom, nom, date_naissance, date_décès, informations_complémentaires, photo, privé, id_union, biologique } = req.body;
    const id = req.params.id;
    pool.query(`UPDATE membres SET sexe='${sexe}', "prénom"='${prénom}', nom='${nom}', date_naissance='${date_naissance}', "date_décès"='${date_décès}', "informations_complémentaires"='${informations_complémentaires}', photo='${photo}', "privé"=${privé}, id_union=${id_union}, biologique=${biologique} WHERE id=${id}`)
    .then(result => {
        res.json(`Mise à jour du membre ${nom} ${prénom} réussie !`);
        console.log(`Mise à jour du membre ${nom} ${prénom} réussie !`);
    })
    .catch(err => handleError(res, err, 'PATCH /membres'))
});

// -- DELETE -- 
router.delete('/membres/:id', isAdmin, (req, res) => {

    const id = req.params.id
    
    pool.query(`DELETE FROM membres WHERE id = ${id};`) 
    .then(result => {
        res.json(`Suppression du membre id=${id} réussie !`);
        console.log(`Suppression du membre id=${id} réussie !`);
    })
    .catch(err => handleError(res, err, 'DELETE /membres'))
    
});

module.exports = router;
