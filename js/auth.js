// =====================================================
// SENTINELA AGRO ERP — Módulo de Autenticação
// =====================================================

import {
  auth, db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where
} from './firebase-config.js';

/**
 * Estado global do usuário autenticado
 */
let currentUser = null;
let currentUserData = null;
const authCallbacks = [];

/**
 * Inicializa o listener de autenticação
 */
export function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      // Busca dados do usuário no Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          currentUserData = { id: user.uid, ...userDoc.data() };
        } else {
          // Primeiro usuário? Cria como admin
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const role = usersSnapshot.empty ? 'admin' : 'vendedor';
          
          const userData = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            role: role,
            created_at: serverTimestamp()
          };
          await setDoc(doc(db, 'users', user.uid), userData);
          currentUserData = { id: user.uid, ...userData };
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        currentUserData = {
          id: user.uid,
          name: user.email.split('@')[0],
          email: user.email,
          role: 'vendedor'
        };
      }
    } else {
      currentUser = null;
      currentUserData = null;
    }
    
    // Notifica callbacks
    authCallbacks.forEach(cb => cb(currentUser, currentUserData));
  });
}

/**
 * Login com email e senha
 */
export async function signIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    let message = 'Erro ao fazer login';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        message = 'Email ou senha incorretos';
        break;
      case 'auth/wrong-password':
        message = 'Senha incorreta';
        break;
      case 'auth/too-many-requests':
        message = 'Muitas tentativas. Tente novamente mais tarde';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
    }
    return { success: false, error: message };
  }
}

/**
 * Registrar novo usuário
 */
export async function signUp(email, password, name) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Verifica se é o primeiro usuário (será admin)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const role = usersSnapshot.empty ? 'admin' : 'vendedor';
    
    // Cria documento do usuário no Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      name: name || email.split('@')[0],
      email: email,
      role: role,
      created_at: serverTimestamp()
    });
    
    return { success: true, user: result.user, role };
  } catch (error) {
    let message = 'Erro ao criar conta';
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este email já está em uso';
        break;
      case 'auth/weak-password':
        message = 'A senha deve ter pelo menos 6 caracteres';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
    }
    return { success: false, error: message };
  }
}

/**
 * Logout
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Erro ao sair:', error);
  }
}

/**
 * Registra callback para mudanças de autenticação
 */
export function onAuthChange(callback) {
  authCallbacks.push(callback);
  // Se já temos um estado, chama imediatamente
  if (currentUser !== undefined) {
    callback(currentUser, currentUserData);
  }
}

/**
 * Retorna usuário atual
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Retorna dados do usuário atual (do Firestore)
 */
export function getCurrentUserData() {
  return currentUserData;
}

/**
 * Verifica se o usuário é admin
 */
export function isAdmin() {
  return currentUserData?.role === 'admin';
}

/**
 * Protege página: redireciona para login se não autenticado
 * Retorna Promise que resolve com os dados do usuário quando autenticado
 */
export function requireAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login.html';
        return;
      }
      
      // Espera os dados do Firestore
      let attempts = 0;
      const waitForData = () => {
        if (currentUserData || attempts > 20) {
          resolve(currentUserData || { id: user.uid, email: user.email, name: user.email.split('@')[0], role: 'vendedor' });
          return;
        }
        attempts++;
        setTimeout(waitForData, 100);
      };
      waitForData();
    });
  });
}
