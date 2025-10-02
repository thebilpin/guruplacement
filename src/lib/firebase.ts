
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Admin (server-side)
import admin from 'firebase-admin';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHCeCxCmDdx7Nx-5RZvIpjZMEFBO2TrxQ",
  authDomain: "studio-6552229432-9934b.firebaseapp.com",
  projectId: "studio-6552229432-9934b",
  storageBucket: "studio-6552229432-9934b.firebasestorage.app",
  messagingSenderId: "153263759971",
  appId: "1:153263759971:web:9e883896e4e10d74a94e56"
};

// Initialize Firebase Client
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Firebase Admin (server-side)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      // In development, Firebase will use default credentials or run without auth
    });
  } catch (error) {
    console.log('Firebase Admin initialization - using default configuration for development');
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export const adminDb = admin.firestore();
