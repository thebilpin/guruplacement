import { NextRequest, NextResponse } from 'next/server'
import { collections, timestampToDate } from '@/lib/db'
import { syncFirebaseUsersToDatabase } from '@/lib/sync-users'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // Build Firestore query
    let query = collections.users().orderBy('createdAt', 'desc')

    // Apply filters
    if (role) {
      query = query.where('role', '==', role)
    }
    if (status) {
      query = query.where('status', '==', status)
    }

    // Get all matching documents (Firestore doesn't support complex text search natively)
    const snapshot = await query.get()
    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]

    // If no users found, try to sync from Firebase Auth
    if (users.length === 0) {
      console.log('No users found in database, attempting sync from Firebase Auth...')
      const syncResult = await syncFirebaseUsersToDatabase()
      if (syncResult.success && syncResult.synced && syncResult.synced > 0) {
        console.log(`Synced ${syncResult.synced} users from Firebase Auth`)
        // Re-fetch users after sync
        const newSnapshot = await query.get()
        users = newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[]
      }
    }

    // Apply search filter in memory (for simple implementation)
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter((user: any) => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate pagination
    const total = users.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    // Process users to exclude password and convert timestamps
    const processedUsers = paginatedUsers.map((user: any) => {
      const { passwordHash, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        status: user.active ? 'active' : 'inactive', // Map active boolean to status string
        createdAt: timestampToDate(user.createdAt),
        updatedAt: timestampToDate(user.updatedAt),
        lastLogin: timestampToDate(user.lastLogin)
      }
    })

    return NextResponse.json({
      users: processedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // This would handle creating new users - could integrate with registration logic
    // For now, redirect to the auth/register endpoint
    return NextResponse.json(
      { error: 'Use /api/auth/register for user creation' },
      { status: 400 }
    )

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}