# 🗄️ Modélisation de la base de données — Projet Genoa

## 1. Qu'est-ce qu'une table ?

Une **table** en base de données, c'est littéralement un tableau — comme un tableau Excel.
- Chaque **ligne** = un enregistrement (une personne, une relation…)
- Chaque **colonne** = un attribut de cet enregistrement

---

## 2. Les tables principales

### Table `membre`

Stocke toutes les personnes de l'arbre généalogique. Chaque personne = une ligne.

| id | prénom | nom | date_naissance | date_décès | sexe | lock_user_id | lock_time |
|----|--------|-----|----------------|------------|------|--------------|-----------|
| 1  | Henri  | IV  | 1553-12-13     | 1610-05-14 | M    | *null*       | *null*    |

> Les colonnes `lock_user_id` et `lock_time` servent aux **verrous** (voir section 4).

---

### Table `union`

Stocke les relations de couple entre deux membres.

| id_union | id_membre_1 | id_membre_2 | date_union | date_séparation |
|----------|-------------|-------------|------------|-----------------|
| 101      | 1 (Henri IV) | 2 (Marguerite de Valois) | 1572-08-18 | 1599-12-17 |
| 102      | 1 (Henri IV) | 3 (Marie de Médicis)     | 1600-10-05 | *null*     |

---

### Table `enfant`

Relie un enfant à une union (et non directement à deux individus).

| id_enfant | id_union | biologique |
|-----------|----------|------------|
| 4 (Louis XIII)        | 102      | true       |
| 5 (Élisabeth de France) | 102    | true       |

---

## 3. Pourquoi relier l'enfant à une union plutôt qu'aux individus ?

### ❌ Approche naïve — relier directement aux individus

| id_enfant   | id_père    | id_mère          |
|-------------|------------|------------------|
| Louis XIII  | Henri IV   | Marie de Médicis |

**Problèmes :**
- On duplique l'information "Henri IV + Marie de Médicis" à chaque enfant
- Si on retrouve un parent inconnu, il faut corriger **toutes** les lignes enfant

### ✅ Approche union — relier l'enfant à l'union

```
[Henri IV] ──┐
             ├──▶ [Union 102] ◀── [Louis XIII]
[Marie de Médicis] ──┘
```

L'union est un **nœud intermédiaire** : les enfants pointent vers elle, et c'est elle qui connaît les deux parents. Pour savoir qui sont les parents de Louis XIII :

> *"Louis XIII → Union 102 → Henri IV + Marie de Médicis"*

---

## 4. Gérer les parents inconnus

L'approche union ne supprime pas les `null`, mais elle les **centralise**.

### Avec un parent inconnu — approche naïve ❌

| id_enfant   | id_père  | id_mère |
|-------------|----------|---------|
| Louis XIII  | Henri IV | *null*  |
| Élisabeth   | Henri IV | *null*  |
| Gaston      | Henri IV | *null*  |

→ Le `null` est répété à chaque enfant. Si on retrouve la mère, on corrige **toutes** les lignes.

### Avec un parent inconnu — approche union ✅

| id_union | id_membre_1 | id_membre_2 |
|----------|-------------|-------------|
| 103      | Henri IV    | *null*      |

| id_enfant  | id_union |
|------------|----------|
| Louis XIII | 103      |
| Élisabeth  | 103      |
| Gaston     | 103      |

→ Le `null` est écrit **une seule fois**. Si on retrouve la mère, on corrige **une seule ligne** et tous les enfants en bénéficient automatiquement.

> 💡 **En résumé :** L'union signifie *"on sait qu'il y a eu une union, mais on ne connaît pas encore un des deux membres"*. Et *"cette union a donné lieu à un enfant"*. C'est une modélisation de l'**information incomplète mais pas inexistante**.

### Cas des vrais orphelins (parents totalement inconnus)

Si on ne connaît ni le père ni la mère, on ne crée tout simplement **pas d'union**. La colonne `id_union` dans la table enfant est laissée à `null` — ce qui représente un enfant sans parents connus, c'est-à-dire une **racine** de l'arbre généalogique.

---

## 5. Les verrous — gestion de l'accès concurrent

### Le problème

Deux utilisateurs (A et B) veulent modifier la date de naissance d'Henri IV en même temps.

- Sans mécanisme de contrôle → **incohérence** : c'est la dernière écriture qui l'emporte
- **Solution : les verrous**

### Implémentation

On ajoute deux colonnes à la table `membre` :
- `lock_user_id` : l'identifiant de l'utilisateur qui a posé le verrou
- `lock_time` : l'horodatage du verrou

### Fonctionnement

1. Avant d'éditer, le client demande au serveur si la ressource est libre (lecture de `lock_user_id`)
2. Si **libre** → le serveur écrit l'id du client et l'heure. On vérifie ensuite que c'est bien notre id qui a été enregistré (pour éviter qu'A et B écrivent exactement au même instant)
3. Si **occupé** → message d'erreur : *"Ce membre est en cours d'édition"*
4. Une fois l'édition terminée → `lock_user_id` et `lock_time` repassent à `null`

---

## 6. Synchronisation en temps réel — Socket.IO

Quand A modifie Henri IV, comment B voit-il la mise à jour sans recharger la page ?

| Approche | Principe | Limitation |
|----------|----------|------------|
| **Polling classique** | Le client envoie des requêtes en rafale | Surcharge le serveur |
| **Long polling** | Le serveur attend d'avoir quelque chose à dire avant de répondre | Communication half-duplex (un sens à la fois) |
| **WebSocket** | Connexion persistante full-duplex (client ET serveur peuvent initier) | La connexion peut échouer |
| **Socket.IO** ✅ | WebSocket + reprise automatique de connexion en cas d'échec | — |

> **Socket.IO** est la solution retenue pour la synchronisation en temps réel dans Genoa.

---

## 7. Récapitulatif des deux problèmes à résoudre

| Problème | Solution |
|----------|----------|
| Accès concurrent à l'écriture (deux utilisateurs éditent le même membre) | Verrous (`lock_user_id` + `lock_time` dans la table `membre`) |
| Synchronisation en temps réel (tous les clients voient les mises à jour) | Socket.IO |
