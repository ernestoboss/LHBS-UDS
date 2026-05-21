import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7t9zcDLq7ibLsX2ZP7F5Md2Cl609LPgg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lhbs-uds.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://lhbs-uds-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lhbs-uds",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lhbs-uds.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1058227638387",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1058227638387:web:44c56889f99baf8e12da06"
};

if (!firebaseConfig.apiKey) {
  throw new Error("Missing Firebase configuration in environment variables.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getDatabase(app);
