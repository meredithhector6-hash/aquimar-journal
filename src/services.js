// src/services.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ─── HELPERS ─────────────────────────────────────────────────────────
const userCol = (userId, col) => collection(db, 'users', userId, col);
const userDoc = (userId, col, id) => doc(db, 'users', userId, col, id);

// ─── PROFIL ──────────────────────────────────────────────────────────
export const saveProfile = (userId, data) =>
  setDoc(doc(db, 'users', userId, 'profile', 'main'), data, { merge: true });

export const listenProfile = (userId, callback) =>
  onSnapshot(doc(db, 'users', userId, 'profile', 'main'), snap => {
    callback(snap.exists() ? snap.data() : null);
  });

// ─── ENTRÉES DE JOURNAL ───────────────────────────────────────────────
export const addEntry = (userId, entry) =>
  addDoc(userCol(userId, 'entries'), {
    ...entry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const deleteEntry = (userId, entryId) =>
  deleteDoc(userDoc(userId, 'entries', entryId));

export const listenEntries = (userId, callback) => {
  const q = query(userCol(userId, 'entries'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const entries = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));
    callback(entries);
  });
};

// ─── PROJETS ─────────────────────────────────────────────────────────
export const addProject = (userId, project) =>
  addDoc(userCol(userId, 'projects'), {
    ...project,
    createdAt: serverTimestamp(),
  });

export const updateProject = (userId, projectId, data) =>
  updateDoc(userDoc(userId, 'projects', projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const listenProjects = (userId, callback) => {
  const q = query(userCol(userId, 'projects'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(projects);
  });
};

// ─── TÂCHES (sous-collection de projet) ──────────────────────────────
const taskCol = (userId, projectId) =>
  collection(db, 'users', userId, 'projects', projectId, 'tasks');
const taskDoc = (userId, projectId, taskId) =>
  doc(db, 'users', userId, 'projects', projectId, 'tasks', taskId);

export const addTask = (userId, projectId, task) =>
  addDoc(taskCol(userId, projectId), {
    ...task,
    createdAt: serverTimestamp(),
  });

export const toggleTask = (userId, projectId, taskId, done) =>
  updateDoc(taskDoc(userId, projectId, taskId), { done, updatedAt: serverTimestamp() });

export const listenTasks = (userId, projectId, callback) => {
  const q = query(taskCol(userId, projectId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const tasks = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      deadline: d.data().deadline || '',
    }));
    callback(tasks);
  });
};
