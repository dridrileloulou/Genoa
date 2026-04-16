const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- GET --
router.get('/coordonnees', (req, res) => {
    pool.query('SELECT * FROM "coordonnées"')
    .then(result => {
        res.json(result.rows);
        console.log('GET coordonnées réussi !');
    })
    .catch(err => handleError(res, err, 'GET /coordonnees'));
});

// -- GET (specific coordonnée) --
router.get('/coordonnees/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM "coordonnées" WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET coordonnées id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /coordonnees/:id'));
});

// -- POST --
router.post('/coordonnees', (req, res) => {
    const { id_membre, adresse, téléphone, email } = req.body;
    pool.query(`INSERT INTO "coordonnées" (id_membre, adresse, "téléphone", email) VALUES (${id_membre}, '${adresse}', '${téléphone}', '${email}')`)
    .then(result => {
        res.json(`Nouvelles coordonnées ajoutées pour membre id=${id_membre} !`);
        console.log(`Nouvelles coordonnées ajoutées pour membre id=${id_membre} !`);
    })
    .catch(err => handleError(res, err, 'POST /coordonnees'));
});

// -- PATCH --
router.patch('/coordonnees/:id', (req, res) => {
    const { id_membre, adresse, téléphone, email } = req.body;
    const id = req.params.id;
    pool.query(`UPDATE "coordonnées" SET id_membre=${id_membre}, adresse='${adresse}', "téléphone"='${téléphone}', email='${email}' WHERE id=${id}`)
    .then(result => {
        res.json(`Coordonnées id=${id} mises à jour !`);
        console.log(`Coordonnées id=${id} mises à jour !`);
    })
    .catch(err => handleError(res, err, 'PATCH /coordonnees'));
});

// -- DELETE --
router.delete('/coordonnees/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM "coordonnées" WHERE id=${id}`)
    .then(result => {
        res.json(`Coordonnées id=${id} supprimées !`);
        console.log(`Coordonnées id=${id} supprimées !`);
    })
    .catch(err => handleError(res, err, 'DELETE /coordonnees'));
});

module.exports = router;