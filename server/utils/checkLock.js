const pool = require('../db/pool.js');

// Retourne true si le membre est verrouillé par quelqu'un d'autre que req.user
const checkLock = async (id_membre, req_user_id) => {
  const result = await pool.query('SELECT lock_user_id FROM membres WHERE id = $1', [id_membre]);
  const membre = result.rows[0];
  return membre && membre.lock_user_id !== null && membre.lock_user_id !== req_user_id;
};

module.exports = checkLock;
