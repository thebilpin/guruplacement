import { NextRequest, NextResponse } from 'next/server'
import { collections, timestampToDate } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const usersQuery = await collections.users().where('email', '==', email).get()
    
    if (usersQuery.empty) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const userDoc = usersQuery.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (userData.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Update last login
    await collections.users().doc(userId).update({
      lastLogin: new Date(),
      updatedAt: new Date()
    })

    // Return user data (excluding password hash)
    const { passwordHash, ...userResponse } = userData
    
    // Convert Firestore timestamps to regular dates
    const processedUser = {
      id: userId,
      ...userResponse,
      createdAt: timestampToDate(userResponse.createdAt),
      updatedAt: timestampToDate(userResponse.updatedAt),
      lastLogin: new Date()
    }

    return NextResponse.json({
      message: 'Login successful',
      user: processedUser
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}