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

async function claimAdminAccess() {
  console.log('👑 Claiming admin access for admin@placementhero.com.au...');
  
  const targetEmail = 'admin@placementhero.com.au';
  
  try {
    // First, find the current admin user
    const adminUsersSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();
    
    if (adminUsersSnapshot.empty) {
      console.log('❌ No admin users found in database');
      return;
    }
    
    // Get the first admin user (there should only be one)
    const adminDoc = adminUsersSnapshot.docs[0];
    const currentData = adminDoc.data();
    
    console.log('📋 Current admin user:');
    console.log(`  • ID: ${adminDoc.id}`);
    console.log(`  • Email: ${currentData.email}`);
    console.log(`  • Name: ${currentData.name}`);
    
    // Update the admin user with new email and enhanced permissions
    await db.collection('users').doc(adminDoc.id).update({
      email: targetEmail,
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
      claimedBy: 'admin@placementhero.com.au',
      claimedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Successfully claimed admin access!');
    console.log(`📧 Admin email updated to: ${targetEmail}`);
    console.log('👑 Full admin permissions granted');
    console.log('🔐 Platform owner access enabled');
    
    // Verify the update
    const updatedDoc = await db.collection('users').doc(adminDoc.id).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Verification - Updated admin profile:');
    console.log(`  • ID: ${adminDoc.id}`);
    console.log(`  • Email: ${updatedData?.email}`);
    console.log(`  • Name: ${updatedData?.name}`);
    console.log(`  • Role: ${updatedData?.role}`);
    console.log(`  • Claimed By: ${updatedData?.claimedBy}`);
    console.log(`  • Permissions: ${JSON.stringify(updatedData?.permissions, null, 2)}`);
    
    console.log('\n🎉 Admin access successfully claimed for admin@placementhero.com.au!');
    console.log('🔑 Login credentials: admin@placementhero.com.au / password123');
    
  } catch (error) {
    console.error('❌ Error claiming admin access:', error);
  }
}

// Run the function
claimAdminAccess();