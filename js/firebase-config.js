// =====================================================
// SENTINELA AGRO ERP — Configuração Firebase
// =====================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, writeBatch, runTransaction, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKEbmr7Jhsyc7aoWS73pTkTiImL-plmUI",
  authDomain: "sentinela-agro-dev.firebaseapp.com",
  projectId: "sentinela-agro-dev",
  storageBucket: "sentinela-agro-dev.firebasestorage.app",
  messagingSenderId: "961065577918",
  appId: "1:961065577918:web:d20e32b3bde82617c35def"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta tudo que os módulos precisam
export {
  app,
  auth,
  db,
  // Auth
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  // Firestore
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp
};
