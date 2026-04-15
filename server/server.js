// -- Import des Routes --
const route_users = require('./routes/users.js');
const route_membres = require('./routes/membres.js');
const route_unions = require('./routes/unions.js');
const route_coordonnees = require('./routes/coordonnees.js');
const route_logs = require('./routes/logs.js');
const route_professions = require('./routes/professions.js');

const express = require('express');
const cors = require('cors');
const app = express(); 
app.use(cors());
app.use(express.json());

app.use(route_users)
app.use(route_membres)
app.use(route_unions)
app.use(route_coordonnees)
app.use(route_logs)
app.use(route_professions)

app.listen(3000, '0.0.0.0', () => {
  console.log("Server running");
});