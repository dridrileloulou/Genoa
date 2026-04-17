// =====================================================
// UTILITAIRE : enregistre une action dans la table logs
// Appelé dans les routes POST/PATCH/DELETE pour tracer les modifications
// req.user est rempli par le middleware verifyToken (contient id et role)
// =====================================================
const pool = require('../db/pool.js');

const logAction = (id_user, table_modifiée, id_enregistrement, action) => {
    pool.query(
        `INSERT INTO logs (id_user, "table_modifiée", id_enregistrement, action, date)
         VALUES ($1, $2, $3, $4, NOW())`,
        [id_user, table_modifiée, id_enregistrement, action]
    ).catch(err => console.error('Erreur log:', err.message));
};

module.exports = logAction;
