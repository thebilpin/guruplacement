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

const auth = admin.auth();
const db = admin.firestore();

async function updateAdminPassword() {
  console.log('🔐 Updating admin password...');
  
  const userId = '6XTuk3cIXXPg6LdkWYDC5pFqPG72';
  const newPassword = 'microlab631911';
  const email = 'admin@placementhero.com.au';
  
  try {
    // First, check if the user exists in Firebase Auth
    try {
      const userRecord = await auth.getUser(userId);
      console.log('📋 Current Firebase Auth user:');
      console.log(`  • UID: ${userRecord.uid}`);
      console.log(`  • Email: ${userRecord.email}`);
      console.log(`  • Email Verified: ${userRecord.emailVerified}`);
      console.log(`  • Created: ${userRecord.metadata.creationTime}`);
      
      // Update the password
      await auth.updateUser(userId, {
        password: newPassword,
        emailVerified: true
      });
      
      console.log('✅ Successfully updated Firebase Auth password!');
      console.log(`🔑 New password set: ${newPassword}`);
      
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log('👤 User not found in Firebase Auth, creating new user...');
        
        // Create the user in Firebase Auth
        const newUser = await auth.createUser({
          uid: userId,
          email: email,
          password: newPassword,
          emailVerified: true,
          displayName: 'PlacementHero Administrator'
        });
        
        console.log('✅ Successfully created Firebase Auth user!');
        console.log(`  • UID: ${newUser.uid}`);
        console.log(`  • Email: ${newUser.email}`);
        console.log(`  • Password: ${newPassword}`);
      } else {
        throw authError;
      }
    }
    
    // Also update the Firestore document if it exists
    try {
      const firestoreDoc = await db.collection('users').doc(userId).get();
      
      if (firestoreDoc.exists) {
        await db.collection('users').doc(userId).update({
          email: email,
          name: 'PlacementHero Administrator',
          role: 'admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          permissions: {
            manageUsers: true,
            systemSettings: true,
            analytics: true,
            compliance: true,
            superAdmin: true,
            platformOwner: true,
            fullAccess: true
          },
          authUserId: userId,
          passwordUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Updated Firestore document as well');
      } else {
        // Create Firestore document
        await db.collection('users').doc(userId).set({
          email: email,
          name: 'PlacementHero Administrator',
          role: 'admin',
          phone: '+61 2 9876 5432',
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          permissions: {
            manageUsers: true,
            systemSettings: true,
            analytics: true,
            compliance: true,
            superAdmin: true,
            platformOwner: true,
            fullAccess: true
          },
          authUserId: userId
        });
        
        console.log('✅ Created Firestore document');
      }
    } catch (firestoreError) {
      console.log('⚠️ Firestore update failed, but Firebase Auth was successful');
      console.error(firestoreError);
    }
    
    console.log('\n🎉 Admin password successfully set!');
    console.log('📧 Email: admin@placementhero.com.au');
    console.log('🔐 Password: microlab631911');
    console.log('👑 Full admin access granted');
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  }
}

// Run the function
updateAdminPassword();