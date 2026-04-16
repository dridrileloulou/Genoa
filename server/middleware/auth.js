const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // pour recup le token dans chaine de caractère
    
    if (!token) return res.status(401).json({ erreur: "Token manquant" }); // verif préalable qu'on a bien mis un token
    
    try { // jwt lance une erreur si token a expiré ou invalide, donc peut pas faire de if ou else, try redirige vers catch si erreur
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ erreur: "Token invalide" });
    }
};

module.exports = verifyToken;