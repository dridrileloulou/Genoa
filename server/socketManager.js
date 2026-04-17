let io = null; // on stocke io ici, accessible dans tout le fichier

function init(serveurIO) {
    io = serveurIO; // server.js nous donne io, on le garde en mémoire
}

function getIO() {
    if (!io) throw new Error("Socket.IO n'est pas initialisé !"); // sécurité : si on appelle getIO() avant init(), on plante proprement
    return io; // on retourne io aux fichiers qui en ont besoin
}

module.exports = { init, getIO }; // on expose uniquement ces deux fonctions