import { NextRequest, NextResponse } from 'next/server';
import { syncFirebaseUsersToDatabase } from '@/lib/sync-users';

export async function POST(request: NextRequest) {
  try {
    console.log('Triggering Firebase Auth to Database sync...');
    
    const result = await syncFirebaseUsersToDatabase();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Sync completed successfully. ${result.synced} new users, ${result.updated} updated users out of ${result.total} total.`,
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger user sync',
    endpoint: '/api/sync-users'
  });
}