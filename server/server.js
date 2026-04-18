require('dotenv').config(); // charge les variables d'environnement depuis .env (ex: clé JWT)

// -- Import des Routes --
const route_users = require('./routes/users.js');
const route_membres = require('./routes/membres.js');
const route_unions = require('./routes/unions.js');
const route_coordonnees = require('./routes/coordonnees.js');
const route_logs = require('./routes/logs.js');
const route_professions = require('./routes/professions.js');
const route_login = require('./routes/login.js');
const route_stats = require('./routes/stats.js');
const route_recherche = require('./routes/recherche.js'); // recherche par nom/prénom + navigation familiale

const verifyToken = require('./middleware/auth.js'); // vérifie le JWT à chaque requête protégée
const socketManager = require('./socketManager.js'); // fichier intermédiaire pour partager io avec les routes
const pool = require('./db/pool.js'); // connexion à la base de données

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// ==================== CONFIGURATION CORS ====================
// ✅ CORS doit être configuré AVANT les routes
app.use(cors({
    origin: '*', // ✅ Accepte toutes les origines (développement)
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Parser JSON APRÈS CORS
app.use(express.json());

// ==================== SERVEUR HTTP + SOCKET.IO ====================
const server = http.createServer(app); // on greffe Express sur le serveur HTTP
const io = new Server(server, { // on greffe Socket.IO sur ce même serveur HTTP
    cors: { 
        origin: "*", // Socket.IO a son propre CORS indépendant d'Express
        methods: ["GET", "POST"]
    }
});

socketManager.init(io); // on donne io à socketManager pour que les routes puissent y accéder

// ==================== GESTION DES SOCKETS ====================
const socketUsers = {}; // annuaire socket.id ↔ id_user { "socket_abc123": 42, "socket_def456": 17 }

io.on("connection", (socket) => {
    console.log(`✅ Nouvelle connexion : ${socket.id}`);

    // le client envoie son id_user dès la connexion pour qu'on sache qui est cette socket
    socket.on("identifier", (data) => {
        socketUsers[socket.id] = data.id_user; // on mémorise la correspondance socket ↔ user
        console.log(`🔑 Socket ${socket.id} identifiée comme user ${data.id_user}`);
    });

    // quand un client veut verrouiller un membre (il ouvre le formulaire d'édition)
    socket.on("verrouiller_membre", (data) => {
        // AND lock_user_id IS NULL : si déjà verrouillé par quelqu'un d'autre, la requête ne fait rien
        pool.query(`UPDATE membres SET lock_user_id = \$1, lock_time = NOW() WHERE id = \$2 AND lock_user_id IS NULL`, [data.id_user, data.id_membre])
        .then(() => {
            // on prévient TOUT LE MONDE que ce membre est verrouillé
            io.emit("membre_verrouille", { id_membre: data.id_membre, id_user: data.id_user });
            console.log(`🔒 Membre ${data.id_membre} verrouillé par user ${data.id_user}`);
        })
        .catch(err => console.error('❌ Erreur verrou:', err));
    });

    // quand un client libère un membre (il sauvegarde ou annule l'édition)
    socket.on("liberer_membre", (data) => {
        // AND lock_user_id = id_user : on ne peut libérer que son propre verrou
        pool.query(`UPDATE membres SET lock_user_id = NULL, lock_time = NULL WHERE id = \$1 AND lock_user_id = \$2`, [data.id_membre, data.id_user])
        .then(() => {
            // on prévient TOUT LE MONDE que ce membre est libéré
            io.emit("membre_libere", { id_membre: data.id_membre });
            console.log(`🔓 Membre ${data.id_membre} libéré par user ${data.id_user}`);
        })
        .catch(err => console.error('❌ Erreur libération verrou:', err));
    });

    // quand un client se déconnecte brutalement (ferme l'app sans libérer ses verrous)
    socket.on("disconnect", () => {
        console.log(`❌ Déconnexion : ${socket.id}`);
        const id_user = socketUsers[socket.id]; // on retrouve quel user était cette socket
        if (id_user) {
            // on libère tous les verrous de cet utilisateur automatiquement
            pool.query(`UPDATE membres SET lock_user_id = NULL, lock_time = NULL WHERE lock_user_id = \$1`, [id_user])
            .then(() => {
                io.emit("verrous_liberes", { id_user }); // on prévient tout le monde
                console.log(`🔓 Tous les verrous de user ${id_user} ont été libérés`);
            })
            .catch(err => console.error('❌ Erreur libération verrous déconnexion:', err));
        }
        delete socketUsers[socket.id]; // on nettoie l'annuaire
    });
});

// ==================== ROUTES API ====================
// ✅ Routes publiques (sans authentification)
app.use('/api', route_users);  // inscription
app.use('/api', route_login);  // connexion

// ✅ Middleware d'authentification pour les routes protégées
app.use('/api', verifyToken);

// ✅ Routes protégées (nécessitent un token)
app.use('/api', route_membres);
app.use('/api', route_unions);
app.use('/api', route_coordonnees);
app.use('/api', route_logs);
app.use('/api', route_professions);
app.use('/api', route_stats);
app.use('/api', route_recherche);

// ==================== DÉMARRAGE DU SERVEUR ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
    console.log(`🌐 API accessible sur http://192.168.1.X:${PORT}/api`);
    console.log(`🔌 WebSocket prêt pour les connexions temps réel`);
});