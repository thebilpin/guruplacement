import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

console.log('🔧 Firebase Admin SDK initialized');
console.log('📋 Note: Firestore security rules need to be updated in Firebase Console');
console.log('🌐 Go to: https://console.firebase.google.com/project/studio-6552229432-9934b/firestore/rules');
console.log('📝 Copy the rules from firestore.rules file and deploy them');
console.log('⚠️  Current rules may be blocking client-side access');
console.log('✅ Temporary fix: Allow all authenticated users to read/write');

// For now, just log the instructions since we can't deploy rules via script
console.log('\n🔑 Recommended Firestore Rules:');
console.log(`
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary rule for development - allow all authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`);