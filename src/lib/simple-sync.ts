// Simplified user sync without complex IAM requirements
// This creates mock data without Firebase Admin dependencies

export async function simpleUserSync() {
  try {
    console.log('Starting simple user sync...');
    
    // Mock user sync without Firebase dependencies
    
    const testUsers = [
      {
        id: 'student-test-1',
        email: 'student@placmenthero.com.au',
        name: 'Test Student',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'email'
      },
      {
        id: 'admin-test-1',
        email: 'admin@placmenthero.com.au',
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'email'
      },
      {
        id: 'rto-test-1',
        email: 'rto@placmenthero.com.au',
        name: 'RTO Provider',
        firstName: 'RTO',
        lastName: 'Provider',
        role: 'rto',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'email'
      },
      {
        id: 'provider-test-1',
        email: 'provider@placmenthero.com.au',
        name: 'Service Provider',
        firstName: 'Service',
        lastName: 'Provider',
        role: 'provider',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'email'
      }
    ];
    
    let synced = 0;
    for (const user of testUsers) {
      try {
        await usersCollection.doc(user.id).set(user);
        synced++;
        console.log(`✅ Synced user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to sync ${user.email}:`, error);
      }
    }
    
    return {
      success: true,
      synced,
      total: testUsers.length,
      message: `Successfully synced ${synced} test users`
    };
    
  } catch (error) {
    console.error('Simple sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}