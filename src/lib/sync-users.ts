import { getAuth } from 'firebase-admin/auth';
import { collections } from './db';

export async function syncFirebaseUsersToDatabase() {
  try {
    console.log('Starting Firebase Auth to Database sync...');
    
    const auth = getAuth();
    const usersCollection = collections.users();
    
    // Get all Firebase Auth users
    let allUsers: any[] = [];
    let nextPageToken: string | undefined;
    
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`Found ${allUsers.length} Firebase Auth users`);
    
    // Sync each user to Firestore
    let syncedCount = 0;
    let updatedCount = 0;
    
    for (const firebaseUser of allUsers) {
      try {
        // Check if user already exists in Firestore
        const userDoc = await usersCollection.doc(firebaseUser.uid).get();
        
        const userData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: firebaseUser.customClaims?.role || 'student', // Default to student
          phone: firebaseUser.phoneNumber || '',
          active: !firebaseUser.disabled,
          emailVerified: firebaseUser.emailVerified,
          lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : null,
          createdAt: new Date(firebaseUser.metadata.creationTime),
          updatedAt: new Date(),
          // Firebase specific fields
          firebaseUid: firebaseUser.uid,
          provider: firebaseUser.providerData.map((p: any) => p.providerId).join(',') || 'email'
        };
        
        if (!userDoc.exists) {
          // Create new user document
          await usersCollection.doc(firebaseUser.uid).set(userData);
          syncedCount++;
          console.log(`Created user document for: ${firebaseUser.email}`);
        } else {
          // Update existing user document with Firebase data
          const existingData = userDoc.data();
          const updateData = {
            ...userData,
            // Preserve existing app-specific data
            role: existingData?.role || userData.role,
            organization: existingData?.organization,
            permissions: existingData?.permissions || {},
          };
          
          await usersCollection.doc(firebaseUser.uid).update(updateData);
          updatedCount++;
          console.log(`Updated user document for: ${firebaseUser.email}`);
        }
      } catch (error) {
        console.error(`Error syncing user ${firebaseUser.email}:`, error);
      }
    }
    
    console.log(`Sync completed: ${syncedCount} new users, ${updatedCount} updated users`);
    
    return {
      success: true,
      synced: syncedCount,
      updated: updatedCount,
      total: allUsers.length
    };
    
  } catch (error) {
    console.error('Error syncing Firebase users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function syncSingleUser(firebaseUid: string) {
  try {
    const auth = getAuth();
    const usersCollection = collections.users();
    
    // Get Firebase Auth user
    const firebaseUser = await auth.getUser(firebaseUid);
    
    // Check if user already exists in Firestore
    const userDoc = await usersCollection.doc(firebaseUid).get();
    
    const userData = {
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      role: firebaseUser.customClaims?.role || 'student',
      phone: firebaseUser.phoneNumber || '',
      active: !firebaseUser.disabled,
      emailVerified: firebaseUser.emailVerified,
      lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : null,
      createdAt: new Date(firebaseUser.metadata.creationTime),
      updatedAt: new Date(),
      firebaseUid: firebaseUser.uid,
      provider: firebaseUser.providerData.map((p: any) => p.providerId).join(',') || 'email'
    };
    
    if (!userDoc.exists) {
      // Create new user document
      await usersCollection.doc(firebaseUid).set(userData);
      console.log(`Created user document for: ${firebaseUser.email}`);
      return { success: true, action: 'created' };
    } else {
      // Update existing user document
      const existingData = userDoc.data();
      const updateData = {
        ...userData,
        role: existingData?.role || userData.role,
        organization: existingData?.organization,
        permissions: existingData?.permissions || {},
      };
      
      await usersCollection.doc(firebaseUid).update(updateData);
      console.log(`Updated user document for: ${firebaseUser.email}`);
      return { success: true, action: 'updated' };
    }
    
  } catch (error) {
    console.error(`Error syncing single user ${firebaseUid}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}