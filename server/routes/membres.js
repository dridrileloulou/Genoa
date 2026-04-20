const express = require('express'); // express
const router = express.Router(); // routeur
const pool = require('../db/pool.js'); // pool
const { isEditor, isAdmin } = require('../middleware/roles.js'); // pour les roles (user,éditeur,admin)
const { getIO } = require('../socketManager.js'); // getIO -> envoie a toutes les sockets
const logAction = require('../utils/logAction.js'); // enregistre les actions dans la table logs

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

// -- POST (✅ MODIFIÉ) --
router.post('/membres', isEditor, (req, res) => {
  console.log('=== BODY REÇU POST /membres ===', req.body);

  const { sexe, nom, date_naissance, id_user, informations_complémentaires, photo, id_union, biologique } = req.body;
  const prénom = req.body['prénom'] || req.body['prenom'];
  const date_décès = req.body['date_décès'] || req.body['date_deces'] || null;
  const privé = req.body['privé'] ?? req.body['prive'] ?? false;

  pool.query(
    `INSERT INTO membres (sexe, "prénom", nom, date_naissance, "date_décès", id_user, "informations_complémentaires", photo, "privé", id_union, biologique) 
     VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11) 
     RETURNING *`,
    [clean(sexe), prénom, clean(nom), clean(date_naissance), clean(date_décès), clean(id_user), clean(informations_complémentaires), clean(photo), privé, clean(id_union), clean(biologique)]
  )
    .then(result => {
        const newMembre = result.rows[0];
        res.status(201).json(newMembre);
        console.log(`✅ Nouveau membre créé:`, newMembre);
        getIO().emit('membre_ajouté', newMembre);
        logAction(req.user.id, 'membres', newMembre.id, 'POST');
    })
    .catch(err => handleError(res, err, 'POST /membres'));
});

// -- PATCH (✅ MODIFIÉ) --
router.patch('/membres/:id', isEditor, async (req, res) => {
  console.log('=== BODY REÇU PATCH /membres ===', req.body);

  const id = req.params.id;

  // Vérification du verrou : refuser si verrouillé par quelqu'un d'autre
  try {
    const lockCheck = await pool.query('SELECT lock_user_id FROM membres WHERE id = $1', [id]);
    const membre = lockCheck.rows[0];
    if (membre && membre.lock_user_id !== null && membre.lock_user_id !== req.user.id) {
      return res.status(423).json({ erreur: 'Membre verrouillé par un autre utilisateur' });
    }
  } catch (err) {
    return handleError(res, err, 'PATCH /membres lock check');
  }

  const { sexe, nom, date_naissance, informations_complémentaires, photo, id_union, biologique } = req.body;
  const prénom = req.body['prénom'] || req.body['prenom'];
  const date_décès = req.body['date_décès'] || req.body['date_deces'] || null;
  const privé = req.body['privé'] ?? req.body['prive'] ?? false;

  pool.query(
    `UPDATE membres SET sexe=\$1, "prénom"=\$2, nom=\$3, date_naissance=\$4, "date_décès"=\$5, "informations_complémentaires"=\$6, photo=\$7, "privé"=\$8, id_union=\$9, biologique=\$10 WHERE id=\$11 RETURNING *`,
    [clean(sexe), prénom, clean(nom), clean(date_naissance), clean(date_décès), clean(informations_complémentaires), clean(photo), privé, clean(id_union), clean(biologique), id]
  )
    .then(result => {
        const updatedMembre = result.rows[0];
        res.json(updatedMembre);
        getIO().emit('membre_modifie', updatedMembre);
        console.log(`✅ Membre mis à jour:`, updatedMembre);
        logAction(req.user.id, 'membres', id, 'PATCH');
    })
    .catch(err => handleError(res, err, 'PATCH /membres'));
});

// -- DELETE (✅ MODIFIÉ) --
router.delete('/membres/:id', isAdmin, (req, res) => {
  const id = req.params.id;
  pool.query(`DELETE FROM membres WHERE id = ${id} RETURNING *;`)
    .then(result => {
        const deletedMembre = result.rows[0];
        res.json({ message: `Membre supprimé`, membre: deletedMembre });
        getIO().emit('membre_supprimé', { id: id });
        console.log(`✅ Membre supprimé:`, deletedMembre);
        logAction(req.user.id, 'membres', id, 'DELETE');
    })
    .catch(err => handleError(res, err, 'DELETE /membres'));
});

module.exports = router;