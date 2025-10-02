import { NextRequest, NextResponse } from 'next/server'
import { collections, addTimestamps } from '@/lib/db'
import bcrypt from 'bcryptjs'

// User roles enum
export const UserRole = {
  student: 'student',
  rto_admin: 'rto_admin',
  provider_admin: 'provider_admin',
  supervisor: 'supervisor',
  assessor: 'assessor',
  platform_admin: 'platform_admin'
} as const

// User status enum  
export const UserStatus = {
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  pending: 'pending'
} as const

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role = 'student' } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsersQuery = await collections.users().where('email', '==', email).get()
    
    if (!existingUsersQuery.empty) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user document
    const userData = addTimestamps({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phone: null,
      avatarUrl: null,
      role,
      status: UserStatus.pending,
      emailVerified: false,
      lastLogin: null
    })

    // Add user to Firestore
    const userRef = await collections.users().add(userData)
    const userId = userRef.id

    // Return user data (excluding password hash)
    const { passwordHash, ...userResponse } = userData
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        ...userResponse
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}