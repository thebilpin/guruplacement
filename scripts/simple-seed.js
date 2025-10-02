// Simple Firebase initialization and data seeding script
const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, addDoc } = require('firebase/firestore');

// Firebase config
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
const db = getFirestore(app);

async function seedBasicData() {
  try {
    console.log('🌱 Seeding basic student compliance data...');
    
    // Simple test document
    const testDoc = {
      name: 'Test Student',
      status: 'active',
      createdAt: new Date(),
      message: 'This is a test document to verify Firebase connection'
    };
    
    await addDoc(collection(db, 'test'), testDoc);
    console.log('✅ Test document created successfully');
    
    console.log('🎉 Basic seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeding
seedBasicData();