import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding student user manually...');
    
    const usersCollection = collections.users();
    
    // Create the student user that you registered: student@placmenehero.com.au
    const studentUser = {
      email: 'student@placmenehero.com.au',
      name: 'Student User',
      role: 'student',
      phone: '',
      active: true,
      emailVerified: true,
      organization: '',
      permissions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      // Use a consistent ID based on email
      firebaseUid: 'student-placmenehero-001'
    };
    
    // Check if user already exists
    const existingUserQuery = await usersCollection.where('email', '==', studentUser.email).get();
    
    if (existingUserQuery.empty) {
      // Add the student user
      const docRef = await usersCollection.add(studentUser);
      console.log(`Created student user with ID: ${docRef.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Student user added successfully',
        userId: docRef.id
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Student user already exists',
        userId: existingUserQuery.docs[0].id
      });
    }
    
  } catch (error) {
    console.error('Error adding student user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to add student user',
    endpoint: '/api/add-student-user'
  });
}