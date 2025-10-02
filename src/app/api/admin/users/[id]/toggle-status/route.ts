import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { action } = await request.json()

    // Get user document
    const userDoc = await collections.users().doc(id).get()
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const newStatus = action === 'suspend' ? 'inactive' : 'active'
    const newActive = action === 'reactivate'

    // Update user status
    await collections.users().doc(id).update({
      status: newStatus,
      active: newActive,
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: `User ${action}d successfully`,
      status: newStatus
    })

  } catch (error) {
    console.error('Toggle status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}