const express = require('express'); 
const router = express.Router(); 
const pool = require('../db/pool.js'); // SQL
const jwt = require('jsonwebtoken'); 

const handleError = (res, err, route) => {
    console.log(`Erreur ${route}:`, err.message);
    res.status(400).json({ error: err.message });
};

// -- POST --
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    pool.query('SELECT * FROM users WHERE email = $1 AND password = $2 AND "validé" = true', [email,password])
    .then(result => {
        if (result.rows.length === 0){
            res.status(401).json(`Il n'existe pas de compte avec l'adresse mail ET mot de passe suivante : ${email}, ou bien votre inscription n'a pas été validée`);
            console.log(`Tentative de connexion de la part de ${email}`)
        }
        else{
            const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token: token })
            console.log(`Nouvelle connection de la part de ${email}`);
        }
        
    })
    .catch(err => handleError(res, err, 'POST /login'));
});

module.exports = router