// ── FIREBASE CONFIG — KNOCKOUT LEAGUE ───────────────────────────────
// Substitui pelos dados do TEU projeto Firebase novo
// (Firebase Console → Definições do projeto → As tuas apps → Config)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, collectionGroup, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, serverTimestamp, runTransaction, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbd1arZEQREoMOYltx92ni25WL3s_nbRQ",
  authDomain: "knockout-league-22921.firebaseapp.com",
  projectId: "knockout-league-22921",
  storageBucket: "knockout-league-22921.firebasestorage.app",
  messagingSenderId: "905383002063",
  appId: "1:905383002063:web:9fa002d9a4ea32a1861cba",
  measurementId: "G-S3WZ45DQ01"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { collection, collectionGroup, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, serverTimestamp, runTransaction, arrayUnion, arrayRemove };
