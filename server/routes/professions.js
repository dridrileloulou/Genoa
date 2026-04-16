const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- GET --
router.get('/professions', (req, res) => {
    pool.query('SELECT * FROM professions')
    .then(result => {
        res.json(result.rows);
        console.log('GET professions réussi !');
    })
    .catch(err => handleError(res, err, 'GET /professions'));
});

// -- GET (specific profession) --
router.get('/professions/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM professions WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET profession id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /professions/:id'));
});

// -- POST --
router.post('/professions', (req, res) => {
    const { id_membre, métier, date_début, date_fin } = req.body;
    pool.query(`INSERT INTO professions (id_membre, "métier", "date_début", date_fin) VALUES (${id_membre}, '${métier}', '${date_début}', '${date_fin}')`)
    .then(result => {
        res.json(`Nouvelle profession ajoutée pour membre id=${id_membre} !`);
        console.log(`Nouvelle profession ajoutée pour membre id=${id_membre} !`);
    })
    .catch(err => handleError(res, err, 'POST /professions'));
});

// -- PATCH --
router.patch('/professions/:id', (req, res) => {
    const { id_membre, métier, date_début, date_fin } = req.body;
    const id = req.params.id;
    pool.query(`UPDATE professions SET id_membre=${id_membre}, "métier"='${métier}', "date_début"='${date_début}', date_fin='${date_fin}' WHERE id=${id}`)
    .then(result => {
        res.json(`Profession id=${id} mise à jour !`);
        console.log(`Profession id=${id} mise à jour !`);
    })
    .catch(err => handleError(res, err, 'PATCH /professions'));
});

// -- DELETE --
router.delete('/professions/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM professions WHERE id=${id}`)
    .then(result => {
        res.json(`Profession id=${id} supprimée !`);
        console.log(`Profession id=${id} supprimée !`);
    })
    .catch(err => handleError(res, err, 'DELETE /professions'));
});

module.exports = router;