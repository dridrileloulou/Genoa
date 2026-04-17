const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- GET --
router.get('/stats', async (req, res) => {
    try {
        // Nombre total de membres
        const totalResult = await pool.query('SELECT COUNT(*) AS total FROM membres');
        const total = parseInt(totalResult.rows[0].total);

        // Répartition hommes / femmes
        const sexeResult = await pool.query(`
            SELECT sexe, COUNT(*) AS count FROM membres
            WHERE sexe IS NOT NULL
            GROUP BY sexe
        `);
        let hommes = 0, femmes = 0;
        for (const row of sexeResult.rows) {
            if (row.sexe === 'M') hommes = parseInt(row.count);
            else if (row.sexe === 'F') femmes = parseInt(row.count);
        }

        // Espérance de vie moyenne (membres décédés uniquement)
        const esperanceResult = await pool.query(`
            SELECT AVG(EXTRACT(YEAR FROM AGE("date_décès", date_naissance))) AS esperance
            FROM membres
            WHERE "date_décès" IS NOT NULL AND date_naissance IS NOT NULL
        `);
        const esperance_vie = esperanceResult.rows[0].esperance
            ? parseFloat(parseFloat(esperanceResult.rows[0].esperance).toFixed(1))
            : null;

        // Nombre de générations (profondeur max de l'arbre via les unions parent -> enfant)
        // Un membre enfant a un id_union qui pointe vers l'union de ses parents
        // Génération 0 = membres sans id_union (racines), on descend ensuite
        const generationsResult = await pool.query(`
            WITH RECURSIVE gen AS (
                SELECT m.id, 0 AS depth
                FROM membres m
                WHERE m.id_union IS NULL
                UNION ALL
                SELECT m2.id, g.depth + 1
                FROM gen g
                JOIN unions u ON (u.id_membre_1 = g.id OR u.id_membre_2 = g.id)
                JOIN membres m2 ON m2.id_union = u.id AND m2.id != g.id
            )
            SELECT COALESCE(MAX(depth), 0) AS generations FROM gen
        `);
        const generations = parseInt(generationsResult.rows[0].generations);

        // Nombre moyen d'enfants par union
        const enfantsResult = await pool.query(`
            SELECT AVG(nb_enfants) AS moyenne_enfants FROM (
                SELECT id_union, COUNT(*) AS nb_enfants
                FROM membres
                WHERE id_union IS NOT NULL
                GROUP BY id_union
            ) sub
        `);
        const moyenne_enfants = enfantsResult.rows[0].moyenne_enfants
            ? parseFloat(parseFloat(enfantsResult.rows[0].moyenne_enfants).toFixed(1))
            : null;

        res.json({
            total,
            hommes,
            femmes,
            esperance_vie,
            generations,
            moyenne_enfants
        });
        console.log('GET /stats réussi !');

    } catch (err) {
        handleError(res, err, 'GET /stats');
    }
});

module.exports = router;
