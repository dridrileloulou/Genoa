# Genoa 🌳

Application de gestion d'arbre généalogique familial.  
Projet INP - ENSEIRB-MATMECA – TELECOM 2A | ET8 PG219

---

## Architecture

```
Genoa/
├── client/       # React Native / Expo
├── server/       # Express / Node.js
│   └── server.js
└── database/     # Scripts SQL
    └── genoa.sql
```

---

## Lancer le projet

### Prérequis

- Node.js
- PostgreSQL

### Base de données

```bash
sudo service postgresql start
sudo -u postgres psql -d genoa
```

### Serveur

```bash
cd server
node server.js
```

Le serveur tourne sur `http://localhost:3000`.

---

## API REST

### Convention

- Les données sont échangées au format **JSON**
- Les erreurs renvoient un status **400** avec `{ "error": "message" }`
- Les paramètres `:id` dans l'URL correspondent à l'id de la ressource en base

---

### Users — `/users`

#### GET `/users`
Récupère tous les utilisateurs.

**Réponse :**
```json
[
  { "id": 1, "email": "test@test.com", "role": "admin", "validé": true },
  { "id": 2, "email": "alice@test.com", "role": "user", "validé": false }
]
```

---

#### GET `/users/:id`
Récupère un utilisateur par son id.

**Exemple :** `GET /users/1`

**Réponse :**
```json
[{ "id": 1, "email": "test@test.com", "role": "admin", "validé": true }]
```

---

#### POST `/users`
Crée un nouvel utilisateur. Le rôle est `user` et `validé` est `false` par défaut.

**Body :**
```json
{
  "email": "nouvel@utilisateur.com",
  "password": "motdepasse"
}
```

**Réponse :** `[]` (PostgreSQL ne renvoie rien sur un INSERT sans RETURNING)

---

#### PATCH `/users/:id`
Modifie un utilisateur existant.

**Exemple :** `PATCH /users/1`

**Body :**
```json
{
  "email": "nouveau@email.com",
  "password": "nouveaumotdepasse",
  "role": "admin",
  "valide": true
}
```

**Réponse :** `[]`

---

#### DELETE `/users/:id`
Supprime un utilisateur par son id.

**Exemple :** `DELETE /users/1`

**Réponse :** `[]`

---

## Fonctionnalités implémentées

| Fonctionnalité | Auteur |
|---|---|
| Script de création BDD PostgreSQL | À compléter |
| Routes CRUD `/users` (GET, GET by id, POST, PATCH, DELETE) | À compléter |

---

## À venir

- Routes `/membres` et `/unions`
- Authentification JWT
- Gestion des droits (admin / éditeur / lecteur)
- Synchronisation temps réel avec Socket.IO + verrous
