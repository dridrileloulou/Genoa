const isEditor = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'editeur') {
        next();
    } else {
        res.status(403).json({ erreur: "Accès refusé — éditeur ou admin requis" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ erreur: "Accès refusé — admin requis" });
    }
};

module.exports = { isEditor, isAdmin };