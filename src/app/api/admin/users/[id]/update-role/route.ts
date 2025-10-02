import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { role } = await request.json()

    // Validate role
    const validRoles = ['admin', 'student', 'rto', 'provider', 'supervisor', 'assessor']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Get user document
    const userDoc = await collections.users().doc(id).get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    await collections.users().doc(id).update({
      role: role,
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      role: role
    })

  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}