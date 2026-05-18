import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCvlbodvEAG0g8PwzFqVG_h0pVk61LZco0",
  authDomain: "aquimar-journal.firebaseapp.com",
  projectId: "aquimar-journal",
  storageBucket: "aquimar-journal.firebasestorage.app",
  messagingSenderId: "396397169380",
  appId: "1:396397169380:web:c3953a614ebe78a3f77af1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
