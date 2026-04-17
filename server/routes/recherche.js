const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// =====================================================
// RECHERCHE PAR NOM / PRÉNOM
// Query param "q" : cherche dans prénom ET nom (insensible à la casse)
// Exemple : GET /recherche?q=jean
// =====================================================
router.get('/recherche', (req, res) => {
    const q = req.query.q;

    // Si pas de terme de recherche, on renvoie un tableau vide
    if (!q || q.trim() === '') {
        return res.json([]);
    }

    // ILIKE = LIKE insensible à la casse (spécifique PostgreSQL)
    // On cherche dans prénom OU nom avec le terme entouré de %
    pool.query(
        `SELECT id, "prénom", nom, sexe, date_naissance, "date_décès", photo
         FROM membres
         WHERE "prénom" ILIKE $1 OR nom ILIKE $1
         ORDER BY nom, "prénom"`,
        [`%${q}%`]
    )
    .then(result => {
        res.json(result.rows);
        console.log(`RECHERCHE "${q}" : ${result.rows.length} résultat(s)`);
    })
    .catch(err => handleError(res, err, 'GET /recherche'));
});

// =====================================================
// PARENTS D'UN MEMBRE
// On remonte via id_union du membre → union des parents → les 2 conjoints
// Exemple : GET /recherche/3/parents
// =====================================================
router.get('/recherche/:id/parents', (req, res) => {
    const id = req.params.id;

    // 1) On récupère l'id_union du membre (= union de ses parents)
    // 2) On récupère les 2 membres de cette union
    pool.query(
        `SELECT p.id, p."prénom", p.nom, p.sexe, p.date_naissance, p."date_décès", p.photo
         FROM membres m
         JOIN unions u ON u.id = m.id_union
         JOIN membres p ON (p.id = u.id_membre_1 OR p.id = u.id_membre_2)
         WHERE m.id = $1`,
        [id]
    )
    .then(result => {
        res.json(result.rows);
        console.log(`PARENTS du membre ${id} : ${result.rows.length} trouvé(s)`);
    })
    .catch(err => handleError(res, err, 'GET /recherche/:id/parents'));
});

// =====================================================
// ENFANTS D'UN MEMBRE
// On cherche toutes les unions où le membre est conjoint,
// puis tous les membres nés de ces unions (id_union = union.id)
// Exemple : GET /recherche/3/enfants
// =====================================================
router.get('/recherche/:id/enfants', (req, res) => {
    const id = req.params.id;

    // 1) Trouver les unions où ce membre est parent (id_membre_1 ou id_membre_2)
    // 2) Trouver les membres dont id_union pointe vers ces unions
    pool.query(
        `SELECT e.id, e."prénom", e.nom, e.sexe, e.date_naissance, e."date_décès", e.photo
         FROM unions u
         JOIN membres e ON e.id_union = u.id
         WHERE u.id_membre_1 = $1 OR u.id_membre_2 = $1
         ORDER BY e.date_naissance`,
        [id]
    )
    .then(result => {
        res.json(result.rows);
        console.log(`ENFANTS du membre ${id} : ${result.rows.length} trouvé(s)`);
    })
    .catch(err => handleError(res, err, 'GET /recherche/:id/enfants'));
});

// =====================================================
// FRATRIE D'UN MEMBRE (frères et sœurs)
// = les autres membres qui ont le même id_union (même parents)
// On exclut le membre lui-même du résultat
// Exemple : GET /recherche/3/fratrie
// =====================================================
router.get('/recherche/:id/fratrie', (req, res) => {
    const id = req.params.id;

    // On cherche les membres qui ont le même id_union que le membre ciblé
    // mais qui ne sont pas le membre lui-même
    pool.query(
        `SELECT f.id, f."prénom", f.nom, f.sexe, f.date_naissance, f."date_décès", f.photo
         FROM membres m
         JOIN membres f ON f.id_union = m.id_union AND f.id != m.id
         WHERE m.id = $1 AND m.id_union IS NOT NULL
         ORDER BY f.date_naissance`,
        [id]
    )
    .then(result => {
        res.json(result.rows);
        console.log(`FRATRIE du membre ${id} : ${result.rows.length} trouvé(s)`);
    })
    .catch(err => handleError(res, err, 'GET /recherche/:id/fratrie'));
});

// =====================================================
// CONJOINT(S) D'UN MEMBRE
// = les autres membres présents dans les unions où ce membre apparaît
// Exemple : GET /recherche/3/conjoints
// =====================================================
router.get('/recherche/:id/conjoints', (req, res) => {
    const id = req.params.id;

    // On cherche toutes les unions où le membre est id_membre_1 ou id_membre_2
    // puis on retourne l'autre conjoint de chaque union
    pool.query(
        `SELECT DISTINCT c.id, c."prénom", c.nom, c.sexe, c.date_naissance, c."date_décès", c.photo
         FROM unions u
         JOIN membres c ON (
             (u.id_membre_1 = $1 AND c.id = u.id_membre_2)
             OR (u.id_membre_2 = $1 AND c.id = u.id_membre_1)
         )`,
        [id]
    )
    .then(result => {
        res.json(result.rows);
        console.log(`CONJOINTS du membre ${id} : ${result.rows.length} trouvé(s)`);
    })
    .catch(err => handleError(res, err, 'GET /recherche/:id/conjoints'));
});

module.exports = router;
