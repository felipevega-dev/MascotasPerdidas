import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCkskZi285IA6AP82zlmI10JLOg2tbdJbw",
    authDomain: "mascotasperdidas-b0faa.firebaseapp.com",
    projectId: "mascotasperdidas-b0faa",
    storageBucket: "mascotasperdidas-b0faa.firebasestorage.app",
    messagingSenderId: "611224145118",
    appId: "1:611224145118:web:dc25d9d07b6b7cfd9c464f",
    measurementId: "G-FEDXD1NL0D"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics only on client side
if (typeof window !== 'undefined') {
    isSupported().then(yes => yes && getAnalytics(app));
}

export { app, db, storage, auth };
