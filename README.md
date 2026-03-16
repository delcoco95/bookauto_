# 🚗 Documentation du projet **BookAuto**

## 1. 🎯 Présentation du projet

**BookAuto** est une plateforme web de mise en relation entre **particuliers** et **professionnels** dans les secteurs de la **réparation automobile**, de la **serrurerie** et de la **plomberie**.

Elle permet :
- aux **particuliers** de rechercher un professionnel selon leurs besoins,
- de **réserver un créneau d’intervention** en ligne,
- et aux **professionnels** de proposer leurs **services** et leurs **disponibilités**.

L’objectif est de **simplifier la prise de rendez-vous** et de **digitaliser la relation client-prestataire** dans les métiers techniques.

---

## 2. ⚙️ Technologies utilisées

| Composant | Technologie |
|------------|-------------|
| **Front-end** | HTML5, CSS3, JavaScript |
| **Back-end** | Node.js + Express.js |
| **Base de données** | JSON / (ou MongoDB selon version déployée) |
| **Conteneurisation** | Docker & Docker Compose |
| **Serveur web** | Nginx |
| **Déploiement** | Netlify (front) / Docker (back) |
| **Gestion des dépendances** | npm (Node.js) |

---

## 3. 🧩 Architecture du projet

```

bookauto_/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── node_modules/
├── src/
│   ├── app.js           # Point d'entrée serveur Node.js
│   ├── routes/          # Routes API (utilisateurs, pros, réservations)
│   ├── controllers/     # Logique métier
│   ├── models/          # Schémas de données JSON/Mongo
│   └── public/          # Fichiers front (HTML, CSS, JS)
└── data/
└── users.json       # Données de test locales

````

---

## 4. 🧰 Installation locale

### 📦 Prérequis
- Node.js ≥ 18  
- npm ≥ 9  
- Docker (optionnel pour conteneurisation)

### 🚀 Étapes d’installation
```bash
git clone https://github.com/delcoco95/bookauto_.git
cd bookauto_
npm install
npm start
````

➡️ Le serveur démarre sur : **[http://localhost:3000](http://localhost:3000)**

---

## 5. 🐳 Déploiement avec Docker

### Fichier `docker-compose.yml` (exemple)

```yaml
version: "3"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=production
```

### Démarrage des conteneurs

```bash
docker compose up -d
```

Pour arrêter :

```bash
docker compose down
```

---

## 6. 🌐 Structure fonctionnelle

### 🔹 Côté particulier

* Création de compte utilisateur
* Recherche par métier ou zone géographique
* Réservation d’un créneau horaire
* Consultation de l’historique d’interventions

### 🔹 Côté professionnel

* Inscription et création de profil entreprise
* Définition des prestations proposées
* Paramétrage des disponibilités
* Consultation et gestion des réservations

---

## 7. 📡 API et routes principales

| Méthode | Route                       | Description                             |
| ------- | --------------------------- | --------------------------------------- |
| `GET`   | `/api/pros`                 | Liste tous les professionnels           |
| `GET`   | `/api/pros/:id`             | Récupère les infos d’un professionnel   |
| `POST`  | `/api/reservations`         | Crée une nouvelle réservation           |
| `GET`   | `/api/reservations/:userId` | Liste des réservations d’un utilisateur |
| `POST`  | `/api/login`                | Authentifie un utilisateur              |

---

## 8. 💾 Gestion des données

Les données sont initialement stockées en **JSON local** :

```json
{
  "id": 1,
  "nom": "Garage Riviera",
  "service": "Réparation auto",
  "disponibilites": ["Lundi", "Mardi"],
  "ville": "Nice"
}
```

Une future évolution prévue est la migration vers une **base MongoDB** pour la persistance et la scalabilité.

---

## 9. 📊 Supervision et monitoring

Dans le cadre de l’intégration avec le **serveur Mediaschool**, le projet peut être **monitoré via Prometheus et Grafana**, grâce à :

* un **Node Exporter** pour surveiller les performances de la VM,
* un **Alertmanager** pour détecter les arrêts de service Docker.

---

## 10. 🔐 Sécurité et RGPD

* Connexions sécurisées via HTTPS (Netlify / Nginx)
* Données utilisateurs limitées aux informations nécessaires à la réservation
* Sauvegarde des données locales chiffrée
* Objectif futur : authentification OAuth2 pour les pros

---

## 11. 🧑‍💻 Contribution

### Démarrage en mode développement

```bash
npm run dev
```

### Formatage du code

```bash
npm run lint
```

### Ajouter un nouveau service

1. Ajouter un fichier dans `/routes`
2. Créer le contrôleur correspondant dans `/controllers`
3. Ajouter la logique de validation dans `/models`

---

## 12. 🚀 Déploiement en production

### Option 1 : via Netlify (front uniquement)

* Pousser les fichiers front (`public/`) sur Netlify
* Configurer le back-end (Node.js) sur un serveur Docker

### Option 2 : full Docker sur un VPS

```bash
docker compose up -d --build
```

Le site est alors accessible sur :
👉 `http://<ip_du_serveur>:3000`

---

## 13. 🧠 Objectifs pédagogiques

Ce projet permet d’aborder :

* la **conception d’une application web complète** (front + back),
* l’utilisation d’**API REST**,
* la **gestion d’un environnement Dockerisé**,
* la **mise en production continue** via Netlify,
* la **supervision applicative** (Prometheus, Grafana),
* et les **bonnes pratiques DevOps et RGPD**.

---

## 14. 👥 Équipe & crédits

**Projet BookAuto** — Campus Mediaschool Nice
Développé par : *Équipe IRIS / BTS SIO*
Encadré par : *Nedj*
Année : **2025**

```

---

Souhaites-tu que je t’en fasse une **version PDF à partir de ce Markdown**, avec une belle mise en page (logo Mediaschool, table des matières, en-têtes colorés) ?
```
