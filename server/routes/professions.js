const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');
const { isEditor, isAdmin } = require('../middleware/roles.js');
const { getIO } = require('../socketManager.js'); // getIO -> envoie a toutes les sockets

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
router.post('/professions', isEditor, (req, res) => {
    const { id_membre, métier, date_début, date_fin } = req.body;
    pool.query(`INSERT INTO professions (id_membre, "métier", "date_début", date_fin) VALUES (${id_membre}, '${métier}', '${date_début}', '${date_fin}')`)
    .then(result => {
        res.json(`Nouvelle profession ajoutée pour membre id=${id_membre} !`);
        getIO().emit('profession_ajoutée', { id : id_membre });
        console.log(`Nouvelle profession ajoutée pour membre id=${id_membre} !`);
    })
    .catch(err => handleError(res, err, 'POST /professions'));
});

// -- PATCH --
router.patch('/professions/:id', isEditor, (req, res) => {
    const { id_membre, métier, date_début, date_fin } = req.body;
    const id = req.params.id;
    pool.query(`UPDATE professions SET id_membre=${id_membre}, "métier"='${métier}', "date_début"='${date_début}', date_fin='${date_fin}' WHERE id=${id}`)
    .then(result => {
        res.json(`Profession id=${id} mise à jour !`);
        getIO().emit('profession_modifiée', { id : id_membre });
        console.log(`Profession id=${id} mise à jour !`);
    })
    .catch(err => handleError(res, err, 'PATCH /professions'));
});

// -- DELETE --
router.delete('/professions/:id', isAdmin ,(req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM professions WHERE id=${id}`)
    .then(result => {
        res.json(`Profession id=${id} supprimée !`);
        getIO().emit('profession_supprimée', { id : id });
        console.log(`Profession id=${id} supprimée !`);
    })
    .catch(err => handleError(res, err, 'DELETE /professions'));
});

module.exports = router;