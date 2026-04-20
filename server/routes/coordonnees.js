const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');
const { isEditor, isAdmin } = require('../middleware/roles.js');
const { getIO } = require('../socketManager.js'); // getIO -> envoie a toutes les sockets
const logAction = require('../utils/logAction.js');
const checkLock = require('../utils/checkLock.js');


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
router.post('/coordonnees', isEditor, async (req, res) => {
    const { id_membre, adresse, téléphone, email } = req.body;
    if (await checkLock(id_membre, req.user.id)) return res.status(423).json({ erreur: 'Membre verrouillé par un autre utilisateur' });
    pool.query(`INSERT INTO "coordonnées" (id_membre, adresse, "téléphone", email) VALUES (${id_membre}, '${adresse}', '${téléphone}', '${email}')`)
    .then(result => {
        res.json(`Nouvelles coordonnées ajoutées pour membre id=${id_membre} !`);
        getIO().emit('coordonées_ajoutées', { id : id_membre });
        console.log(`Nouvelles coordonnées ajoutées pour membre id=${id_membre} !`);
        logAction(req.user.id, 'coordonnées', null, 'POST'); // log de l'ajout
    })
    .catch(err => handleError(res, err, 'POST /coordonnees'));
});

// -- PATCH --
router.patch('/coordonnees/:id', isEditor, async (req, res) => {
    const { id_membre, adresse, téléphone, email } = req.body;
    const id = req.params.id;
    if (await checkLock(id_membre, req.user.id)) return res.status(423).json({ erreur: 'Membre verrouillé par un autre utilisateur' });
    pool.query(`UPDATE "coordonnées" SET id_membre=${id_membre}, adresse='${adresse}', "téléphone"='${téléphone}', email='${email}' WHERE id=${id}`)
    .then(result => {
        res.json(`Coordonnées id=${id} mises à jour !`);
        getIO().emit('coordonées_modifiées', { id : id_membre });
        console.log(`Coordonnées id=${id} mises à jour !`);
        logAction(req.user.id, 'coordonnées', id, 'PATCH'); // log de la modification
    })
    .catch(err => handleError(res, err, 'PATCH /coordonnees'));
});

// -- DELETE --
router.delete('/coordonnees/:id', isAdmin , (req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM "coordonnées" WHERE id=${id}`)
    .then(result => {
        res.json(`Coordonnées id=${id} supprimées !`);
        getIO().emit('coordonées_suprimées', { id : id });
        console.log(`Coordonnées id=${id} supprimées !`);
        logAction(req.user.id, 'coordonnées', id, 'DELETE'); // log de la suppression
    })
    .catch(err => handleError(res, err, 'DELETE /coordonnees'));
});

module.exports = router;