const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- GET --
router.get('/logs', (req, res) => {
    pool.query('SELECT * FROM logs')
    .then(result => {
        res.json(result.rows);
        console.log('GET logs réussi !');
    })
    .catch(err => handleError(res, err, 'GET /logs'));
});

// -- GET (specific log) --
router.get('/logs/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM logs WHERE id = ${id}`)
    .then(result => {
        res.json(result.rows);
        console.log(`GET log id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /logs/:id'));
});

module.exports = router;