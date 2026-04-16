const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js'); // pool
const { isEditor, isAdmin } = require('../middleware/roles.js');

//Affiche l'erreur côté serveur (node) et client(postman ou reactnative)
const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- GET --
router.get('/unions', (req, res) => {
    pool.query('SELECT * FROM unions')
    .then(result => {
        res.json(result.rows);
        console.log('GET unions réussi !');
    })
    .catch(err => handleError(res, err, 'GET /unions'));
});

// -- GET (specific union) --
router.get('/unions/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM unions WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET union id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /unions/:id'));
});

// -- POST --
router.post('/unions', isEditor, (req, res) => {
    const { id_membre_1, id_membre_2, date_union, date_séparation } = req.body;
    pool.query(`INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation") VALUES (${id_membre_1}, ${id_membre_2}, ${date_union ? `'${date_union}'` : 'NULL'}, ${date_séparation ? `'${date_séparation}'` : 'NULL'})`)
    .then(result => {
        res.json(`Nouvelle union ajoutée entre ${id_membre_1} et ${id_membre_2} !`);
        console.log(`Nouvelle union ajoutée entre ${id_membre_1} et ${id_membre_2} !`);
    })
    .catch(err => handleError(res, err, 'POST /unions'));
});

// -- PATCH --
router.patch('/unions/:id', isEditor, (req, res) => {
    const { id_membre_1, id_membre_2, date_union, date_séparation } = req.body;
    const id = req.params.id;
    pool.query(`UPDATE unions SET id_membre_1=${id_membre_1}, id_membre_2=${id_membre_2}, date_union='${date_union}', "date_séparation"='${date_séparation}' WHERE id=${id}`)
    .then(result => {
        res.json(`Union mise à jour entre ${id_membre_1} et ${id_membre_2} !`);
        console.log(`Union mise à jour entre ${id_membre_1} et ${id_membre_2} !`);
    })
    .catch(err => handleError(res, err, 'PATCH /unions'));
});

// -- DELETE --
router.delete('/unions/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM unions WHERE id=${id}`)
    .then(result => {
        res.json(`Union supprimée entre ${id_membre_1} et ${id_membre_2}!`);
        console.log(`Union supprimée entre ${id_membre_1} et ${id_membre_2}!`);
    })
    .catch(err => handleError(res, err, 'DELETE /unions'));
});

module.exports = router;