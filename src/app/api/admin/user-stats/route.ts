import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching user statistics...');

    // Get all users
    const usersSnapshot = await collections.users().get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Count by role
    const userCounts = {
      admin: users.filter((u: any) => u.role === 'admin' || u.role === 'platform_admin').length,
      student: users.filter((u: any) => u.role === 'student').length,
      rto: users.filter((u: any) => u.role === 'rto_admin').length,
      provider: users.filter((u: any) => u.role === 'provider_admin').length,
      supervisor: users.filter((u: any) => u.role === 'supervisor').length,
      assessor: users.filter((u: any) => u.role === 'assessor').length,
      total: users.length,
    };

    // Get RTOs and Providers count
    const [rtosSnapshot, providersSnapshot] = await Promise.all([
      collections.rtos().get(),
      collections.providers().get(),
    ]);

    const rtosCount = rtosSnapshot.size;
    const providersCount = providersSnapshot.size;

    // Generate summary
    const summary = {
      message: `System has ${userCounts.total} total users across ${rtosCount} RTOs and ${providersCount} providers`,
      breakdown: `Students: ${userCounts.student}, RTOs: ${userCounts.rto}, Providers: ${userCounts.provider}`,
      requirements: `${userCounts.student} students need placements, ${userCounts.rto + userCounts.provider} organizations need coordination`,
    };

    const response = {
      success: true,
      userCounts,
      rtosCount,
      providersCount,
      summary,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ User stats generated:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}