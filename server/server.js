// -- Import des Routes --
const route_users = require('./routes/users.js');
const route_membres = require('./routes/membres.js');
const route_unions = require('./routes/unions.js');
const route_coordonnees = require('./routes/coordonnees.js');
const route_logs = require('./routes/logs.js');
const route_professions = require('./routes/professions.js');

//
const express = require('express');
const app = express();

app.use(express.json()); // pour que express lise du Json

app.use(route_users) // tables users
app.use(route_membres) // tables membres
app.use(route_unions) // table unions
app.use(route_coordonnees)
app.use(route_logs)
app.use(route_professions)

app.listen(3000)