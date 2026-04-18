# Genoa

Application de gestion d'arbre généalogique familial.
Projet INP - ENSEIRB-MATMECA – TELECOM 2A | ET8 PG219

---

## Auteurs

| Nom | Rôle |
|-----|------|
| **Dimitri** | Back-end (API, base de données, authentification, sockets, logs) |
| **Adrien** | Front-end (interface React Native, arbre généalogique, composants UI) |

---

## Architecture

```
Genoa/
├── genoa/            # Front-end React Native / Expo Router
│   ├── app/
│   │   ├── (tabs)/   # Pages principales (onglets)
│   │   ├── tree.jsx   # Vue arbre généalogique
│   │   └── _layout.tsx
│   ├── components/    # Composants réutilisables
│   ├── contexts/      # Contextes React (AuthContext)
│   └── constants/     # Configuration (socket, thème)
├── server/            # Back-end Node.js / Express
│   ├── routes/        # Routes API REST
│   ├── middleware/     # Auth JWT + rôles
│   ├── utils/         # Utilitaires (logAction)
│   ├── db/            # Connexion PostgreSQL
│   ├── socketManager.js
│   └── server.js
└── database/          # Scripts SQL (schéma + seed)
```

---

## Lancer le projet

### Prérequis

- Node.js
- PostgreSQL

### Base de données

```bash
cd database
sudo service postgresql start
sudo -u postgres psql -d genoa
```
Pour ajouter directement un admin (username: admin; pwd : mdp)
```sql
INSERT INTO "users" ("email", "password", "role", "validé")
VALUES ('admin@example.com', 'mdp', 'admin', true);
```
```bash
# Optionnel : insérer les données d'exemple (descendance Henri IV)
sudo -u postgres psql -d genoa -f database/seed_henri_iv.sql
```

### Serveur

```bash
cd server
npm install dotenv
node server.js
```

Le serveur tourne sur `http://localhost:3000`.

### Application mobile

```bash
cd genoa
npm install expo
npx expo start
```

---

## Fonctionnalités implémentées

### Back-end (Dimitri)

| Fonctionnalité | Description |
|----------------|-------------|
| Script de création BDD PostgreSQL | Tables `membres`, `unions`, `coordonnées`, `professions`, `users`, `logs` avec contraintes et clés étrangères |
| Seed de données | 24 membres (descendance Henri IV, 4 générations) + 7 unions historiques détaillées |
| Routes CRUD `/users` | GET, GET by id, POST, PATCH, DELETE |
| Routes CRUD `/membres` | GET, GET by id, POST (éditeur), PATCH (éditeur), DELETE (admin) |
| Routes CRUD `/unions` | GET, GET by id, POST (éditeur), PATCH (éditeur), DELETE (admin) |
| Routes CRUD `/coordonnees` | GET, GET by id, POST (éditeur), PATCH (éditeur), DELETE (admin) |
| Routes CRUD `/professions` | GET, GET by id, POST (éditeur), PATCH (éditeur), DELETE (admin) |
| Routes `/logs` | GET (admin), GET by id (admin) — historique des modifications |
| Route `/login` | Authentification par email/mot de passe, retourne un JWT (24h) |
| Route `/stats` | Statistiques calculées depuis la BDD (total membres, H/F, espérance de vie, générations, moyenne enfants) |
| Routes `/recherche` | Recherche par nom/prénom (ILIKE) + navigation familiale (parents, enfants, fratrie, conjoints) |
| Authentification JWT | Middleware `verifyToken` appliqué globalement, token contient `id` et `role` |
| Gestion des rôles | Middleware `isEditor` et `isAdmin` pour protéger les routes sensibles (3 rôles : admin, éditeur, lecteur) |
| Socket.IO temps réel | Émissions sur tous les POST/PATCH/DELETE + système de verrous sur les membres (`verrouiller_membre`, `liberer_membre`) avec libération auto à la déconnexion |
| Logs automatiques | Chaque POST/PATCH/DELETE sur membres, unions, coordonnées, professions enregistre une entrée dans la table `logs` |

### Front-end (Adrien)

| Fonctionnalité | Description |
|----------------|-------------|
| Login | Formulaire de connexion avec stockage JWT dans AsyncStorage |
| Inscription | Modal d'inscription (SignUpModal) |
| Page profil | Affichage du profil utilisateur, détection du rôle, affichage conditionnel admin/user |
| Dashboard admin | Gestion des utilisateurs (voir, valider, supprimer) |
| Arbre généalogique | Visualisation interactive de l'arbre avec zoom et navigation (tree.jsx) |
| Composants thématiques | ThemedText, ThemedView, ParallaxScrollView, HapticTab |

### Commun (Dimitri + Adrien)

| Fonctionnalité | Description |
|----------------|-------------|
| Page statistiques | Route back `/stats` + page front `stats.jsx` avec affichage en cartes (total, H/F, espérance de vie, générations, enfants/union) |
| Page recherche | Route back `/recherche` + page front `recherche.jsx` avec barre de recherche, fiches membres et navigation familiale (parents, enfants, fratrie, conjoints) |
| Page logs | Route back `/logs` + page front `logs.jsx` avec badges colorés POST/PATCH/DELETE, accès admin uniquement |
| Bouton déconnexion global | AuthContext partagé + bouton "Déconnexion" dans le header visible sur toutes les pages |
| Navigation par onglets | 5 onglets : Home, Profile, Recherche, Stats, Logs |

---

## API REST

### Convention

- Les données sont échangées au format **JSON**
- Les erreurs renvoient un status **400** avec `{ "error": "message" }`
- Les paramètres `:id` dans l'URL correspondent à l'id de la ressource en base
- Les routes protégées nécessitent un header `Authorization: Bearer <token>`

### Routes

| Méthode | Route | Auth | Rôle min. | Description |
|---------|-------|------|-----------|-------------|
| POST | `/login` | Non | — | Connexion, retourne un JWT |
| GET/POST | `/users` | Non | — | Liste / inscription |
| PATCH/DELETE | `/users/:id` | Oui | admin | Modifier / supprimer un user |
| GET | `/membres` | Oui | lecteur | Liste de tous les membres |
| POST/PATCH | `/membres/:id` | Oui | éditeur | Ajouter / modifier un membre |
| DELETE | `/membres/:id` | Oui | admin | Supprimer un membre |
| GET | `/unions` | Oui | lecteur | Liste de toutes les unions |
| POST/PATCH | `/unions/:id` | Oui | éditeur | Ajouter / modifier une union |
| DELETE | `/unions/:id` | Oui | admin | Supprimer une union |
| GET | `/coordonnees` | Oui | lecteur | Liste des coordonnées |
| POST/PATCH | `/coordonnees/:id` | Oui | éditeur | Ajouter / modifier des coordonnées |
| DELETE | `/coordonnees/:id` | Oui | admin | Supprimer des coordonnées |
| GET | `/professions` | Oui | lecteur | Liste des professions |
| POST/PATCH | `/professions/:id` | Oui | éditeur | Ajouter / modifier une profession |
| DELETE | `/professions/:id` | Oui | admin | Supprimer une profession |
| GET | `/logs` | Oui | admin | Historique des modifications |
| GET | `/stats` | Oui | lecteur | Statistiques de l'arbre |
| GET | `/recherche?q=` | Oui | lecteur | Recherche par nom/prénom |
| GET | `/recherche/:id/parents` | Oui | lecteur | Parents d'un membre |
| GET | `/recherche/:id/enfants` | Oui | lecteur | Enfants d'un membre |
| GET | `/recherche/:id/fratrie` | Oui | lecteur | Frères et soeurs |
| GET | `/recherche/:id/conjoints` | Oui | lecteur | Conjoint(s) d'un membre |

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Back-end | Node.js, Express, PostgreSQL, Socket.IO, JWT |
| Front-end | React Native, Expo, Expo Router, AsyncStorage |
| Temps réel | Socket.IO (verrous, notifications de modifications) |
| Auth | JWT (jsonwebtoken), rôles admin/éditeur/lecteur |
