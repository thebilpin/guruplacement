import { NextRequest, NextResponse } from 'next/server'
import { db, collections } from '@/lib/db'

export async function GET() {
  try {
    // Check environment variables
    const hasFirebaseConfig = !!(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS)
    
    let dbStatus = 'not_configured'
    let dbData = null
    let dbError = null

    if (hasFirebaseConfig) {
      try {
        // Test Firestore connection by getting collection counts
        const [usersSnapshot, studentsSnapshot, placementsSnapshot] = await Promise.all([
          collections.users().count().get(),
          collections.students().count().get(),
          collections.placements().count().get()
        ])

        dbStatus = 'connected'
        dbData = {
          totalUsers: usersSnapshot.data().count,
          totalStudents: studentsSnapshot.data().count,
          totalPlacements: placementsSnapshot.data().count,
          database: 'firestore'
        }
      } catch (error) {
        dbStatus = 'error'
        dbError = error instanceof Error ? error.message : 'Unknown database error'
      }
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'PlacementGuru API is running',
      services: {
        api: 'running',
        database: dbStatus,
        firebase: hasFirebaseConfig ? 'configured' : 'not_configured',
        firestore: dbStatus
      },
      data: dbData,
      error: dbError,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}