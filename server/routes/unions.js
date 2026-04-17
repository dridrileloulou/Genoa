const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');
const { isEditor, isAdmin } = require('../middleware/roles.js');
const { getIO } = require('../socketManager.js'); // getIO -> envoie a toutes les sockets
const logAction = require('../utils/logAction.js'); // enregistre les actions dans la table logs

const handleError = (res, err, route) => {
  console.log(`Erreur ${route}:`, err.message);
  res.status(400).json({ error: err.message });
};

const clean = (val) => {
  if (val === 'null' || val === 'undefined' || val === '' || val === undefined || val === null) return null;
  return val;
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

// -- GET (specific) --
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
  console.log('=== BODY REÇU POST /unions ===', req.body);
  const { id_membre_1, id_membre_2, date_union } = req.body;
  const date_séparation = req.body['date_séparation'] || null;

  pool.query(
    `INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation") VALUES (\$1, \$2, \$3, \$4)`,
    [clean(id_membre_1), clean(id_membre_2), clean(date_union), clean(date_séparation)]
  )
    .then(result => {
        res.json(`Nouvelle union ajoutée entre ${id_membre_1} et ${id_membre_2} !`);
        getIO().emit('union_ajoutée', { id : id_membre });
        console.log(`Nouvelle union ajoutée entre ${id_membre_1} et ${id_membre_2} !`);
        logAction(req.user.id, 'unions', null, 'POST'); // log de l'ajout
    })
    .catch(err => handleError(res, err, 'POST /unions'));
});

// -- PATCH --
router.patch('/unions/:id', isEditor, (req, res) => {
  console.log('=== BODY REÇU PATCH /unions ===', req.body);
  const { id_membre_1, id_membre_2, date_union } = req.body;
  const date_séparation = req.body['date_séparation'] || null;
  const id = req.params.id;

  pool.query(
    `UPDATE unions SET id_membre_1=\$1, id_membre_2=\$2, date_union=\$3, "date_séparation"=\$4 WHERE id=\$5`,
    [clean(id_membre_1), clean(id_membre_2), clean(date_union), clean(date_séparation), id]
  )
    .then(result => {
        res.json(`Union mise à jour entre ${id_membre_1} et ${id_membre_2} !`);
        getIO().emit('Union_modifiée', { id : id_membre });
        console.log(`Union mise à jour entre ${id_membre_1} et ${id_membre_2} !`);
        logAction(req.user.id, 'unions', id, 'PATCH'); // log de la modification
    })
    .catch(err => handleError(res, err, 'PATCH /unions'));
});

// -- DELETE --
router.delete('/unions/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query(`DELETE FROM unions WHERE id=${id}`)
    .then(result => {
        res.json(`Union supprimée entre ${id_membre_1} et ${id_membre_2}!`);
        getIO().emit('Union_supprimée', { id : id });
        console.log(`Union supprimée entre ${id_membre_1} et ${id_membre_2}!`);
        logAction(req.user.id, 'unions', id, 'DELETE'); // log de la suppression
    })
    .catch(err => handleError(res, err, 'DELETE /unions'));
});

module.exports = router;