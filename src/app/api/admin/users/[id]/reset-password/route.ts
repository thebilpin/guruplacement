import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get user document
    const userDoc = await collections.users().doc(id).get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 12)

    // Update user with new password
    await collections.users().doc(id).update({
      passwordHash: hashedPassword,
      tempPassword: tempPassword,
      mustChangePassword: true,
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: 'Password reset successfully',
      tempPassword: tempPassword
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}