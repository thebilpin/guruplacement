import { NextRequest, NextResponse } from 'next/server';
import { simpleUserSync } from '@/lib/simple-sync';

export async function POST(request: NextRequest) {
  try {
    console.log('Triggering simple user sync...');
    
    const result = await simpleUserSync();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Simple sync API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simple user sync - Use POST to create test users',
    endpoint: '/api/simple-sync'
  });
}