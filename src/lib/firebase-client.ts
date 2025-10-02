import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHCeCxCmDdx7Nx-5RZvIpjZMEFBO2TrxQ",
  authDomain: "studio-6552229432-9934b.firebaseapp.com",
  projectId: "studio-6552229432-9934b",
  storageBucket: "studio-6552229432-9934b.firebasestorage.app",
  messagingSenderId: "153263759971",
  appId: "1:153263759971:web:9e883896e4e10d74a94e56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;