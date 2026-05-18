// src/firebase.js
// ─────────────────────────────────────────────────────────────────────
// INSTRUCTIONS : remplace les valeurs ci-dessous par celles de ta
// console Firebase : https://console.firebase.google.com
// Projet → Paramètres → Tes applications → Config
// ─────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "REMPLACE_PAR_TA_CLE",
  authDomain:        "REMPLACE.firebaseapp.com",
  projectId:         "REMPLACE_PAR_TON_PROJECT_ID",
  storageBucket:     "REMPLACE.appspot.com",
  messagingSenderId: "REMPLACE",
  appId:             "REMPLACE_PAR_TON_APP_ID"
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// Active la persistance hors ligne (IndexedDB)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistance impossible : plusieurs onglets ouverts.');
  } else if (err.code === 'unimplemented') {
    console.warn('Ce navigateur ne supporte pas la persistance hors ligne.');
  }
});
