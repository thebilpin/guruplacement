import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const providerId = searchParams.get('providerId')
    const status = searchParams.get('status')
    const riskLevel = searchParams.get('riskLevel')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = {}

    if (studentId) where.studentId = studentId
    if (status) where.status = status
    if (riskLevel) where.riskLevel = riskLevel
    
    if (providerId) {
      where.opportunity = {
        providerId: providerId
      }
    }

    if (search) {
      where.OR = [
        { student: {
          user: {
            firstName: { contains: search, mode: 'insensitive' }
          }
        }},
        { student: {
          user: {
            lastName: { contains: search, mode: 'insensitive' }
          }
        }},
        { student: {
          studentId: { contains: search, mode: 'insensitive' }
        }},
        { opportunity: {
          title: { contains: search, mode: 'insensitive' }
        }}
      ]
    }

    const [placements, total] = await Promise.all([
      prisma.studentPlacement.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatarUrl: true
                }
              },
              rto: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          },
          opportunity: {
            include: {
              provider: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  addressLine1: true,
                  city: true,
                  state: true,
                  postcode: true
                }
              }
            }
          },
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          assessor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          hourLogs: {
            select: {
              id: true,
              logDate: true,
              hoursWorked: true,
              supervisorVerified: true,
              verifiedAt: true
            },
            orderBy: { logDate: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.studentPlacement.count({ where })
    ])

    return NextResponse.json({
      placements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Placements fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const placementData = await request.json()

    // Validate required fields
    const { studentId, placementId, applicationId, startDate, endDate, totalHoursRequired } = placementData

    if (!studentId || !placementId || !applicationId || !startDate || !endDate || !totalHoursRequired) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create placement
    const placement = await prisma.studentPlacement.create({
      data: {
        ...placementData,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        opportunity: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Placement created successfully',
      placement
    }, { status: 201 })

  } catch (error) {
    console.error('Placement creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}