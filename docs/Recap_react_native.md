# Récap React Native — Concepts fondamentaux

---

## 1. Les composants — la brique de base

Un composant c'est une **fonction JavaScript qui retourne ce qui s'affiche à l'écran**.

```javascript
function MonComposant() {
  return (
    <View>
      <Text>Bonjour</Text>
    </View>
  );
}
```

**Règles importantes :**
- Un composant commence toujours par une **majuscule** (`MonComposant` et non `monComposant`)
- Un `return` ne peut retourner qu'**un seul élément racine** → d'où l'utilisation de `<View>` pour tout envelopper
- On exporte toujours le composant principal avec `export default`

---

## 2. Le JSX — écrire l'affichage dans le code

Le JSX ressemble à du HTML mais c'est du **JavaScript**. Les balises `< >` sont juste une notation lisible.

Les `{ }` signifient **"ici c'est du vrai JavaScript"** :

```javascript
let prenom = "Alice";

<Text>Bonjour prenom</Text>    // Affiche littéralement : "Bonjour prenom"
<Text>Bonjour {prenom}</Text>  // Affiche : "Bonjour Alice"
```

On peut mettre n'importe quelle expression JS dans les `{ }` :

```javascript
<Text>{2 + 2}</Text>                          // 4
<Text>{prenom.toUpperCase()}</Text>           // ALICE
<Text>{estConnecte ? "Bonjour" : "Connecte-toi"}</Text>
```

---

## 3. Les composants de base de React Native

| Composant | Rôle |
|---|---|
| `<View>` | Une boîte qui contient des éléments (comme un div) |
| `<Text>` | Du texte — **tout texte DOIT être dans un `<Text>`** |
| `<TextInput>` | Un champ de saisie |
| `<TouchableOpacity>` | Un bouton cliquable |
| `<FlatList>` | Afficher une liste de données |

**Différences avec le CSS web :**
- En React Native, le style se fait avec `StyleSheet.create()`
- Les propriétés sont en camelCase : `backgroundColor`, `fontSize`, `fontWeight`
- Pas d'unités : `fontSize: 16` et non `16px`
- **Flexbox est activé par défaut** sur toutes les `<View>`, en direction colonne (vertical)

---

## 4. `useState` — la variable que React surveille

`useState` c'est une variable normale, mais **React la surveille** — dès qu'elle change, l'écran se met à jour automatiquement.

```javascript
const [nombre, setNombre] = useState(0);
//     ^^^^^^  ^^^^^^^^^           ^
//     valeur  fonction pour       valeur
//     actuelle  modifier          de départ
```

**Sans `useState`** → la variable change mais l'écran reste figé.  
**Avec `useState`** → la variable change et l'écran suit.

```javascript
function Compteur() {
  const [nombre, setNombre] = useState(0);

  function handleAppui() {
    setNombre(nombre + 1); // React est prévenu → écran mis à jour
  }

  return (
    <View>
      <Text>{nombre}</Text>
      <TouchableOpacity onPress={handleAppui}>
        <Text>+1</Text>
      </TouchableOpacity>
    </View>
  );
}
```

`useState` peut stocker n'importe quoi :

```javascript
useState(0)      // un nombre
useState('')     // une string
useState(false)  // un booléen
useState([])     // un tableau (ex: liste de membres)
```

---

## 5. Props down, events up

**Les données descendent** du parent vers l'enfant via les props ⬇️  
**Les événements remontent** de l'enfant vers le parent via des fonctions ⬆️

```javascript
// Le parent POSSÈDE la donnée et la logique
function Parent() {
  const [nom, setNom] = useState('Alice');

  return <Enfant nom={nom} setNom={setNom} />;
}

// L'enfant REÇOIT et affiche, mais ne modifie jamais directement
function Enfant(props) {
  return (
    <TouchableOpacity onPress={() => props.setNom('Bob')}>
      <Text>{props.nom}</Text>
    </TouchableOpacity>
  );
}
```

**Règle fondamentale :** Celui qui **possède** la donnée est le seul qui a le droit de la **modifier**.

L'enfant ne peut pas accéder directement à ce qui est dans le parent (question de portée/scope). Les props sont le **seul canal de communication** entre parent et enfant.

La convention `onXxx` (ex: `onPress`, `onChangement`) est utilisée par lisibilité pour nommer les fonctions passées en props — mais c'est juste une convention, pas une obligation.

---

## 6. Les fonctions anonymes `() =>`

C'est une fonction **sans nom**. Les deux écritures sont équivalentes :

```javascript
// Fonction nommée
function direBonjour() {
  console.log("Bonjour");
}

// Fonction anonyme
() => {
  console.log("Bonjour");
}

// Fonction anonyme courte (une seule ligne)
() => console.log("Bonjour")
```

Utilisée souvent dans `onPress` :

```javascript
// Ces deux écritures font la même chose
<TouchableOpacity onPress={handleAppui}>
<TouchableOpacity onPress={() => setNombre(nombre + 1)}>
```

---

## 7. `useEffect` — déclencher du code au bon moment

`useEffect` permet d'exécuter du code **quand l'écran se charge** (ou quand une variable change). C'est là qu'on met les appels `fetch` vers l'API.

```javascript
useEffect(() => {
  // Ce code s'exécute quand l'écran s'affiche
  fetch('http://serveur/membres')
    .then(res => res.json())
    .then(data => setMembres(data));
}, []); // ← tableau de dépendances
```

**Le tableau de dépendances `[]` contrôle quand l'effet se relance :**

```javascript
useEffect(() => { ... }, []);        // une seule fois au chargement
useEffect(() => { ... }, [nombre]);  // à chaque fois que "nombre" change
useEffect(() => { ... });            // à chaque re-rendu (rare, éviter)
```

Sans le `[]`, le `fetch` serait relancé à chaque re-rendu → boucle infinie.

---

## 8. `fetch` — appeler l'API

`fetch` envoie une requête HTTP au serveur et retourne une **promesse**.

```javascript
fetch('http://serveur/membres')  // envoie la requête
  .then(res => res.json())       // convertit la réponse (body) en objet JS
  .then(data => setMembres(data)) // utilise les données
```

- `res` → l'enveloppe HTTP complète (status, headers, body en texte brut)
- `res.json()` → extrait uniquement le body et le convertit en objet JS
- `data` → l'objet JS exploitable

**Les types de requêtes :**

```javascript
// GET — récupérer (par défaut)
fetch('http://serveur/membres')

// POST — créer
fetch('http://serveur/membres', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Dupont', prenom: 'Alice' })
})

// DELETE — supprimer
fetch('http://serveur/membres/1', { method: 'DELETE' })
```

---

## 9. FlatList — afficher une liste

`FlatList` permet d'afficher efficacement une liste de données.

```javascript
const membres = [
  { id: '1', nom: 'Dupont', prenom: 'Alice' },
  { id: '2', nom: 'Martin', prenom: 'Bob' },
];

<FlatList
  data={membres}                              // le tableau à afficher
  keyExtractor={(item) => item.id}            // identifiant unique par élément
  renderItem={({ item }) => (                 // comment afficher chaque élément
    <Text>{item.nom} {item.prenom}</Text>
  )}
/>
```

- `data` → le tableau source (souvent un `useState`)
- `keyExtractor` → fonction qui retourne un identifiant unique pour chaque élément
- `renderItem` → fonction qui décrit l'affichage de chaque élément (`{ item }` = déstructuration)

**En pratique, combiné avec `useEffect` et `useState` :**

```javascript
const [membres, setMembres] = useState([]);

useEffect(() => {
  fetch('http://serveur/membres')
    .then(res => res.json())
    .then(data => setMembres(data));
}, []);

return (
  <FlatList
    data={membres}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <Text>{item.nom}</Text>}
  />
);
```

---

## 10. La navigation — Expo Router

Expo Router utilise les **fichiers** pour définir les routes. Chaque fichier dans `app/` = un écran.

```
app/
  index.tsx        → écran d'accueil (/)
  membres.tsx      → écran membres (/membres)
  (tabs)/          → groupe d'onglets (les parenthèses = invisible dans l'URL)
  (drawer)/        → groupe avec menu burger
```

**Naviguer vers un écran :**

```javascript
import { useRouter } from 'expo-router';

function MonEcran() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/membres')}>
      <Text>Aller aux membres</Text>
    </TouchableOpacity>
  );
}
```

**Les 3 patterns de navigation :**

| Pattern | Style | Usage |
|---|---|---|
| **Stack** | Pile d'écrans, retour en arrière | Navigation en profondeur (détail d'un membre) |
| **Tabs** | Onglets en bas | Sections principales toujours accessibles |
| **Drawer** | Menu burger sur le côté | Navigation entre grandes sections |

---

## 11. Le principe déclaratif

React Native est **déclaratif** — tu décris **ce que tu veux** voir, pas comment l'obtenir étape par étape.

```javascript
// ❌ Impératif (style C) — tu décris les étapes
button.color = "red";
button.text = "Cliqué";

// ✅ Déclaratif (style React) — tu décris l'état final
<TouchableOpacity style={{ backgroundColor: cliqué ? 'red' : 'gray' }}>
  <Text>{cliqué ? 'Cliqué' : 'Clique moi'}</Text>
</TouchableOpacity>
```

**Structure d'un composant (séparation logique / rendu) :**

```javascript
function MonComposant() {
  // PARTIE 1 — logique (variables, fonctions, fetch...)
  const [data, setData] = useState([]);
  function handleAction() { ... }

  // PARTIE 2 — rendu (ce qu'on veut voir)
  return (
    <View>...</View>
  );
}
```

---

## 12. Architecture du projet Genoa

```
Genoa/
  server/          → API REST Node.js
  client/          → App React Native
    app/           → les écrans (un fichier = un écran)
    components/    → les composants réutilisables
    assets/        → images, polices
```

**Le flux de données :**

```
App React Native (client)
        ↕ HTTP / Socket.IO
API Node.js (serveur)
        ↕ SQL / NoSQL
Base de données
```

---

## 13. JWT — authentification

JWT (JSON Web Token) c'est un **badge** généré par le serveur à la connexion, valable 24h.

**Le flux :**
1. L'utilisateur envoie email + mot de passe
2. Le serveur vérifie et génère un token → `eyJhbGci...`
3. Le client stocke ce token et l'envoie à chaque requête dans le header
4. Le serveur vérifie le token avant de répondre

```javascript
// Envoyer le token dans chaque requête
fetch('http://serveur/membres', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

---

## 14. Socket.IO — temps réel

Socket.IO permet une **connexion permanente** entre client et serveur. Le serveur peut envoyer des données sans que le client demande.

**Côté serveur :**
```javascript
io.on('connection', (socket) => {
  socket.on('ajouter_membre', (data) => {
    // traitement...
    io.emit('membre_ajoute', data); // prévient TOUS les clients
  });
});
```

**Côté client :**
```javascript
socket.emit('ajouter_membre', { nom: 'Dupont' }); // envoie au serveur
socket.on('membre_ajoute', (data) => setMembres(...)); // reçoit en temps réel
```

Équivalent des sockets en C, mais sans gérer le bas niveau (bind, listen, accept, poll) — Socket.IO s'en occupe.
