# Aquim'@rt Journal — PWA

Journal intime intelligent + gestion de projets · Stack : React · Vite · Firebase · GitHub Pages

---

## 🚀 Mise en ligne (depuis ton téléphone)

### Étape 1 — Créer le dépôt GitHub

1. Va sur **github.com** depuis ton navigateur
2. Connecte-toi à ton compte
3. Clique **"New repository"** (bouton vert +)
4. Nomme-le exactement : `aquimart-journal`
5. Laisse-le **Public**
6. **Ne coche rien** (pas de README, pas de .gitignore)
7. Clique **"Create repository"**

---

### Étape 2 — Uploader les fichiers

Sur la page du dépôt vide qui s'affiche :

1. Clique **"uploading an existing file"**
2. Uploade **tous les fichiers** de ce projet en respectant la structure :
   - `index.html`
   - `vite.config.js`
   - `package.json`
   - `.gitignore`
   - `src/` → tous les fichiers dedans
   - `.github/workflows/deploy.yml`
3. En bas, écris un message : `Initial commit`
4. Clique **"Commit changes"**

> ⚠️ Pour uploader `.github/workflows/deploy.yml`, GitHub ne montre pas les dossiers cachés facilement.
> Utilise l'option **"Create new file"** et tape le chemin complet : `.github/workflows/deploy.yml`
> puis colle le contenu du fichier.

---

### Étape 3 — Configurer Firebase

1. Va sur **console.firebase.google.com**
2. Clique **"Créer un projet"** → nomme-le `aquimart-journal`
3. Menu gauche → **Authentication** → **Commencer** → active **E-mail/Mot de passe**
4. Menu gauche → **Firestore Database** → **Créer** → **Mode test**
5. Paramètres du projet (⚙️) → **Ajouter une application** → icône `</>`
6. Copie le bloc `firebaseConfig`

Ensuite, dans GitHub :
1. Va dans ton dépôt → **Settings** → **Secrets and variables** → **Actions**
2. Tu n'en as pas besoin ici car la config Firebase est dans `src/firebase.js`

**Ouvre `src/firebase.js`** dans GitHub (clique sur le fichier → icône crayon) et remplace les valeurs :
```js
apiKey:            "ta_vraie_clé",
authDomain:        "ton-projet.firebaseapp.com",
projectId:         "ton-projet-id",
storageBucket:     "ton-projet.appspot.com",
messagingSenderId: "ton_sender_id",
appId:             "ton_app_id"
```
Clique **"Commit changes"**.

---

### Étape 4 — Activer GitHub Pages

1. Dans ton dépôt → **Settings** → **Pages**
2. **Source** → sélectionne **"GitHub Actions"**
3. Sauvegarde

---

### Étape 5 — Lancer le déploiement

Le déploiement se lance automatiquement à chaque commit.
Pour vérifier : onglet **Actions** dans ton dépôt.

Quand c'est vert ✅, ton app est disponible à :
```
https://TON_USERNAME.github.io/aquimart-journal/
```

---

### Étape 6 — Installer l'app sur ton téléphone (PWA)

**Android (Chrome) :**
1. Ouvre l'URL dans Chrome
2. Menu ⋮ → **"Ajouter à l'écran d'accueil"**
3. L'app apparaît comme une vraie appli

**iPhone (Safari) :**
1. Ouvre l'URL dans Safari
2. Bouton partage □↑ → **"Sur l'écran d'accueil"**
3. Confirme

---

## 📁 Structure du projet

```
aquimart-journal/
├── .github/workflows/deploy.yml   ← déploiement automatique
├── src/
│   ├── main.jsx                   ← point d'entrée
│   ├── App.jsx                    ← app principale + auth
│   ├── firebase.js                ← ⚠️ mettre ta config ici
│   ├── services.js                ← CRUD Firestore
│   └── views/
│       ├── AuthScreen.jsx
│       ├── HomeView.jsx
│       ├── JournalView.jsx
│       ├── ProjectsView.jsx
│       ├── StatsView.jsx
│       └── SettingsView.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔧 Modifier l'app

Tout se fait directement depuis GitHub sur ton téléphone :
1. Ouvre le fichier à modifier
2. Clique l'icône crayon ✏️
3. Fais tes changements
4. **"Commit changes"** → le déploiement se relance automatiquement (2-3 min)

---

## 🗄️ Règles Firestore (sécurité)

Dans la console Firebase → Firestore → **Règles**, remplace par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Cela garantit que chaque utilisatrice n'accède qu'à ses propres données.

---

*Aquim'@rt Journal · Des faits, des idées, des gens.*
