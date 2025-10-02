import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    if (!userData.name || !userData.email || !userData.role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await collections.users()
      .where('email', '==', userData.email)
      .get()

    if (!existingUser.empty) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 12)

    // Create comprehensive user document
    const newUser = {
      // Personal Information
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth || '',
      
      // Role & Organization
      role: userData.role,
      status: userData.status || 'active',
      active: (userData.status || 'active') === 'active',
      organization: userData.organization || '',
      position: userData.position || '',
      
      // Address Information
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      postcode: userData.postcode || '',
      
      // Additional Information
      bio: userData.bio || '',
      emergencyContact: userData.emergencyContact || '',
      preferredLanguage: userData.preferredLanguage || 'en',
      
      // System fields
      passwordHash: hashedPassword,
      tempPassword: tempPassword, // Store temporarily for admin to share
      createdAt: new Date(),
      updatedAt: new Date(),
      mustChangePassword: true,
      
      // Profile completion tracking
      profileComplete: !!(userData.name && userData.email && userData.role),
      lastLogin: null
    }

    const docRef = await collections.users().add(newUser)
    
    // Return the created user without sensitive data
    const { passwordHash, ...userResponse } = newUser
    
    return NextResponse.json({
      id: docRef.id,
      ...userResponse,
      message: `User created successfully. Temporary password: ${tempPassword}`
    })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all users for admin management
    const snapshot = await collections.users().orderBy('createdAt', 'desc').get()
    
    const users = snapshot.docs.map(doc => {
      const userData = doc.data()
      const { passwordHash, ...safeUserData } = userData as any
      return {
        id: doc.id,
        ...safeUserData
      }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}