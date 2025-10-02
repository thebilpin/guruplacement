// Debug API to check user data in Firestore
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (email) {
      // Search for specific user by email
      console.log(`🔍 Searching for user with email: ${email}`);
      
      const userSnapshot = await collections.users()
        .where('email', '==', email)
        .get();
      
      if (userSnapshot.empty) {
        return NextResponse.json({
          found: false,
          message: `No user found with email: ${email}`,
          suggestion: 'User might not have been created in Firestore database'
        });
      }
      
      const userData = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({
        found: true,
        count: userData.length,
        users: userData,
        message: `Found ${userData.length} user(s) with email: ${email}`
      });
    }
    
    // Get all users for debugging
    console.log('🔍 Getting all users for debugging');
    const allUsersSnapshot = await collections.users().get();
    
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email || 'No email',
      role: doc.data().role || 'No role',
      verificationStatus: doc.data().verificationStatus || 'No status',
      name: doc.data().name || 'No name',
      createdAt: doc.data().createdAt || 'No date'
    }));
    
    return NextResponse.json({
      totalUsers: allUsers.length,
      users: allUsers,
      rtoUsers: allUsers.filter(u => u.email?.includes('rto@placementhero')),
      message: `Found ${allUsers.length} total users in database`
    });
    
  } catch (error: any) {
    console.error('Error debugging users:', error);
    return NextResponse.json(
      { error: 'Failed to debug users', details: error.message },
      { status: 500 }
    );
  }
}