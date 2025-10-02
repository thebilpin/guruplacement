import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rtoId = searchParams.get('rtoId')
    const status = searchParams.get('status')
    const cohortId = searchParams.get('cohortId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = {}

    if (rtoId) where.rtoId = rtoId
    if (status) where.status = status
    if (cohortId) where.cohortId = cohortId
    
    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: {
          firstName: { contains: search, mode: 'insensitive' }
        }},
        { user: {
          lastName: { contains: search, mode: 'insensitive' }
        }},
        { user: {
          email: { contains: search, mode: 'insensitive' }
        }}
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
              status: true,
              lastLogin: true
            }
          },
          rto: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          cohort: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          },
          placements: {
            select: {
              id: true,
              status: true,
              startDate: true,
              endDate: true,
              totalHoursCompleted: true,
              totalHoursRequired: true,
              currentProgress: true,
              riskLevel: true
            },
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Students fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, rtoId, cohortId, studentId, enrollmentDate, ...studentData } = await request.json()

    // Validate required fields
    if (!userId || !rtoId || !cohortId || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student record already exists for this user
    const existingStudent = await prisma.student.findUnique({
      where: { userId }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student record already exists for this user' },
        { status: 409 }
      )
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        userId,
        rtoId,
        cohortId,
        studentId,
        enrollmentDate: new Date(enrollmentDate),
        ...studentData
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true
          }
        },
        rto: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        cohort: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Student created successfully',
      student
    }, { status: 201 })

  } catch (error) {
    console.error('Student creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}