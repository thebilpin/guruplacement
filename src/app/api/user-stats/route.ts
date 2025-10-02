import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export async function GET() {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    // Count users by role
    const roleCounts = {
      admin: 0,
      student: 0,
      rto: 0,
      provider: 0,
      supervisor: 0,
      assessor: 0,
      total: 0
    };

    usersSnapshot.forEach((doc: any) => {
      const userData = doc.data();
      const role = userData.role?.toLowerCase();
      
      if (role in roleCounts) {
        roleCounts[role as keyof typeof roleCounts]++;
      }
      roleCounts.total++;
    });

    // Get RTOs count
    const rtosSnapshot = await db.collection('rtos').get();
    const rtosCount = rtosSnapshot.size;

    // Get Providers count
    const providersSnapshot = await db.collection('providers').get();
    const providersCount = providersSnapshot.size;

    return NextResponse.json({
      success: true,
      userCounts: roleCounts,
      rtosCount,
      providersCount,
      summary: {
        message: `Found ${roleCounts.total} users total`,
        breakdown: `Admin: ${roleCounts.admin}, Students: ${roleCounts.student}, RTOs: ${roleCounts.rto}, Providers: ${roleCounts.provider}, Supervisors: ${roleCounts.supervisor}, Assessors: ${roleCounts.assessor}`,
        requirements: "Need: 1 admin, 1 student, 8 RTOs, 8 providers, 1 supervisor, 1 assessor"
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}