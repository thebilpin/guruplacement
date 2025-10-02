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

async function updateAdminToPlacementHero() {
  console.log('🔧 Updating admin to PlacementHero admin...');
  
  const adminId = 'aWApVd15y4FC4LrL1KaQ';
  const newEmail = 'admin@placementhero.com.au';
  
  try {
    // Update the admin user
    await db.collection('users').doc(adminId).update({
      email: newEmail,
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
    
    console.log('✅ Successfully updated admin user!');
    console.log(`📧 Email changed from admin@placementguru.com to ${newEmail}`);
    console.log('👑 Enhanced admin permissions applied');
    
    // Verify the update
    const updatedDoc = await db.collection('users').doc(adminId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Updated admin profile:');
    console.log(`  • ID: ${adminId}`);
    console.log(`  • Email: ${updatedData?.email}`);
    console.log(`  • Name: ${updatedData?.name}`);
    console.log(`  • Role: ${updatedData?.role}`);
    console.log(`  • Permissions: ${JSON.stringify(updatedData?.permissions, null, 2)}`);
    
    console.log('\n🎉 Admin successfully updated to PlacementHero admin!');
    console.log('🔑 Login: admin@placementhero.com.au / password123');
    
  } catch (error) {
    console.error('❌ Error updating admin:', error);
  }
}

// Run the function
updateAdminToPlacementHero();