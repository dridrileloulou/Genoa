const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');
const { isEditor, isAdmin } = require('../middleware/roles.js');
const { getIO } = require('../socketManager.js'); // getIO -> envoie a toutes les sockets
const logAction = require('../utils/logAction.js'); // enregistre les actions dans la table logs

const handleError = (res, err, route) => {
  console.log(`Erreur ${route}:`, err.message);
  // ✅ Protection contre double envoi
  if (!res.headersSent) {
    res.status(400).json({ error: err.message });
  }
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

// -- GET (specific) (✅ SÉCURISÉ) --
router.get('/unions/:id', (req, res) => {
  const id = req.params.id;
  pool.query(`SELECT * FROM unions WHERE id = \$1`, [id]) // ✅ Paramètre préparé
    .then(result => {
      res.json(result.rows);
      console.log(`GET union id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /unions/:id'));
});

// -- POST (✅ CORRIGÉ) --
router.post('/unions', isEditor, (req, res) => {
  console.log('=== BODY REÇU POST /unions ===', req.body);
  const { id_membre_1, id_membre_2, date_union } = req.body;
  const date_séparation = req.body['date_séparation'] || req.body['date_separation'] || null;

  // ✅ Validation : au moins un membre doit être présent
  if (!id_membre_1 && !id_membre_2) {
    return res.status(400).json({ error: 'Au moins un membre doit être renseigné pour créer une union' });
  }

  pool.query(
    `INSERT INTO unions (id_membre_1, id_membre_2, date_union, "date_séparation") 
     VALUES (\$1, \$2, \$3, \$4) 
     RETURNING *`, // ✅ Retourner l'objet créé
    [clean(id_membre_1), clean(id_membre_2), clean(date_union), clean(date_séparation)]
  )
    .then(result => {
        const newUnion = result.rows[0]; // ✅ Récupérer l'objet créé
        res.status(201).json(newUnion); // ✅ Retourner l'objet (pas un message texte)
        console.log('✅ Nouvelle union créée:', newUnion);
        getIO().emit('union_ajoutée', newUnion); // ✅ Envoyer l'objet complet
        logAction(req.user.id, 'unions', newUnion.id, 'POST'); // ✅ Logger avec l'id
    })
    .catch(err => handleError(res, err, 'POST /unions'));
});

// -- PATCH (✅ CORRIGÉ) --
router.patch('/unions/:id', isEditor, (req, res) => {
  console.log('=== BODY REÇU PATCH /unions ===', req.body);
  const { id_membre_1, id_membre_2, date_union } = req.body;
  const date_séparation = req.body['date_séparation'] || req.body['date_separation'] || null;
  const id = req.params.id;

  pool.query(
    `UPDATE unions 
     SET id_membre_1=\$1, id_membre_2=\$2, date_union=\$3, "date_séparation"=\$4 
     WHERE id=\$5 
     RETURNING *`, // ✅ Retourner l'objet modifié
    [clean(id_membre_1), clean(id_membre_2), clean(date_union), clean(date_séparation), id]
  )
    .then(result => {
        const updatedUnion = result.rows[0]; // ✅ Récupérer l'objet modifié
        res.json(updatedUnion); // ✅ Retourner l'objet
        console.log('✅ Union mise à jour:', updatedUnion);
        getIO().emit('union_modifiée', updatedUnion); // ✅ Envoyer l'objet complet
        logAction(req.user.id, 'unions', id, 'PATCH');
    })
    .catch(err => handleError(res, err, 'PATCH /unions'));
});

// -- DELETE (✅ CORRIGÉ) --
router.delete('/unions/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query(`DELETE FROM unions WHERE id=\$1 RETURNING *`, [id]) // ✅ Paramètre préparé + RETURNING
    .then(result => {
        const deletedUnion = result.rows[0]; // ✅ Récupérer l'objet supprimé
        res.json({ message: 'Union supprimée', union: deletedUnion }); // ✅ Retourner les infos
        console.log('✅ Union supprimée:', deletedUnion);
        getIO().emit('union_supprimée', { id: id });
        logAction(req.user.id, 'unions', id, 'DELETE');
    })
    .catch(err => handleError(res, err, 'DELETE /unions'));
});

module.exports = router;