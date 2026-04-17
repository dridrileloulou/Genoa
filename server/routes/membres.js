const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');
const { isEditor, isAdmin } = require('../middleware/roles.js');
const { getIO } = require('../socketManager.js');

const handleError = (res, err, route) => {
  console.log(`Erreur ${route}:`, err.message);
  res.status(400).json({ error: err.message });
};

// Convertit "null", "", undefined en vrai null
const clean = (val) => {
  if (val === 'null' || val === 'undefined' || val === '' || val === undefined || val === null) return null;
  return val;
};

// ---- API REST ----

// -- GET --
router.get('/membres', (req, res) => {
  pool.query('SELECT * FROM membres')
    .then(result => {
      res.json(result.rows);
      console.log('GET de tous les membres réussi !');
    })
    .catch(err => handleError(res, err, 'GET /membres'));
});

// -- GET (specific user) --
router.get('/membres/:id', (req, res) => {
  const id = req.params.id;
  pool.query(`SELECT * FROM membres WHERE id = ${id}`)
    .then(result => {
      res.json(result.rows);
      console.log(`GET membre id=${id} réussi !`);
    })
    .catch(err => handleError(res, err, 'GET /membres/:id'));
});

// -- POST --
router.post('/membres', isEditor, (req, res) => {
  console.log('=== BODY REÇU POST /membres ===', req.body);

  const { sexe, nom, date_naissance, id_user, informations_complémentaires, photo, id_union, biologique } = req.body;
  const prénom = req.body['prénom'] || req.body['prenom'];
  const date_décès = req.body['date_décès'] || req.body['date_deces'] || null;
  const privé = req.body['privé'] ?? req.body['prive'] ?? false;

  pool.query(
    `INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique) VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11)`,
    [clean(sexe), prénom, clean(nom), clean(date_naissance), clean(date_décès), clean(id_user), clean(informations_complémentaires), clean(photo), privé, clean(id_union), clean(biologique)]
  )
    .then(result => {
      res.json(`Nouveau membre ${nom} ${prénom} ajouté !`);
      console.log(`Nouveau membre ${nom} ${prénom} ajouté !`);
      getIO().emit('membre_ajouté', { nom: nom, prenom: prénom });
    })
    .catch(err => handleError(res, err, 'POST /membres'));
});

// -- PATCH --
router.patch('/membres/:id', isEditor, (req, res) => {
  console.log('=== BODY REÇU PATCH /membres ===', req.body);

  const { sexe, nom, date_naissance, informations_complémentaires, photo, id_union, biologique } = req.body;
  const prénom = req.body['prénom'] || req.body['prenom'];
  const date_décès = req.body['date_décès'] || req.body['date_deces'] || null;
  const privé = req.body['privé'] ?? req.body['prive'] ?? false;
  const id = req.params.id;

  pool.query(
    `UPDATE membres SET sexe=\$1, "prénom"=\$2, nom=\$3, date_naissance=\$4, "date_décès"=\$5, "informations_complémentaires"=\$6, photo=\$7, "privé"=\$8, id_union=\$9, biologique=\$10 WHERE id=\$11`,
    [clean(sexe), prénom, clean(nom), clean(date_naissance), clean(date_décès), clean(informations_complémentaires), clean(photo), privé, clean(id_union), clean(biologique), id]
  )
    .then(result => {
      res.json(`Mise à jour du membre ${nom} ${prénom} réussie !`);
      getIO().emit('membre_modifie', { id: id });
      console.log(`Mise à jour du membre ${nom} ${prénom} réussie !`);
    })
    .catch(err => handleError(res, err, 'PATCH /membres'));
});

// -- DELETE --
router.delete('/membres/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query(`DELETE FROM membres WHERE id = ${id};`)
    .then(result => {
      res.json(`Suppression du membre id=${id} réussie !`);
      getIO().emit('membre_supprimé', { id: id });
      console.log(`Suppression du membre id=${id} réussie !`);
    })
    .catch(err => handleError(res, err, 'DELETE /membres'));
});

module.exports = router;