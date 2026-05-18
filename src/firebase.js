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
  apiKey:            "AIzaSyCvlbodvEAG0g8PwzFqVG_h0pVk61LZco0",
  authDomain:        "aquimar-journal.firebaseapp.com",
  projectId:         "aquimar-journal",
  storageBucket:     "aquimar-journal.firebasestorage.app",
  messagingSenderId: "396397169380",
  appId:             "1:396397169380:web:c3953a614ebe78a3f77af1"
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
