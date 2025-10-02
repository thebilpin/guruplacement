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

const db = admin.firestore();

async function updateAdminUser() {
  console.log('🔧 Updating admin user...');
  
  const userId = '6XTuk3cIXXPg6LdkWYDC5pFqPG72';
  const newEmail = 'admin@placementhero.com.au';
  
  try {
    // Check if user exists
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ User not found with ID:', userId);
      console.log('🔍 Let me search for existing admin users...');
      
      const adminUsersSnapshot = await db.collection('users')
        .where('role', '==', 'admin')
        .get();
      
      console.log(`📊 Found ${adminUsersSnapshot.size} admin users:`);
      adminUsersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  • ID: ${doc.id}, Email: ${data.email}, Name: ${data.name}`);
      });
      
      return;
    }
    
    const currentData = userDoc.data();
    console.log('📋 Current user data:');
    console.log(`  • Email: ${currentData?.email}`);
    console.log(`  • Name: ${currentData?.name}`);
    console.log(`  • Role: ${currentData?.role}`);
    
    // Update the user
    await db.collection('users').doc(userId).update({
      email: newEmail,
      role: 'admin',
      name: 'PlacementHero Administrator',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        manageUsers: true,
        systemSettings: true,
        analytics: true,
        compliance: true,
        superAdmin: true
      }
    });
    
    console.log('✅ Successfully updated admin user!');
    console.log(`📧 New email: ${newEmail}`);
    console.log('👑 Role: admin');
    console.log('🔐 Admin permissions granted');
    
    // Verify the update
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Verification - Updated user data:');
    console.log(`  • Email: ${updatedData?.email}`);
    console.log(`  • Name: ${updatedData?.name}`);
    console.log(`  • Role: ${updatedData?.role}`);
    console.log(`  • Permissions: ${JSON.stringify(updatedData?.permissions, null, 2)}`);
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  }
}

// Run the function
updateAdminUser();