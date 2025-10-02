# PlacementGuru Integration Guide

## Overview

This guide explains how to integrate the database, API, and Firebase services in your PlacementGuru application.

## Current Implementation Status

### ✅ Completed
- **Prisma ORM Setup**: Database schema defined with 35+ tables
- **API Routes**: Core endpoints for users, students, and placements
- **Database Connection**: Prisma client configured
- **Environment Configuration**: Environment variables set up
- **Health Monitoring**: API health check endpoint

### 🔄 In Progress  
- **Database Testing**: API endpoints ready, pending database setup
- **Sample Data**: Seed script created, needs database

### ⏳ Pending
- **Firebase Auth Integration**: Connect Firebase with database users
- **Authentication Middleware**: JWT/session management
- **Frontend Integration**: Connect UI components to API

## Quick Start

### 1. Database Setup (Required)

Choose one of these options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb placementguru
createuser placementguru_user --password
psql -c "GRANT ALL PRIVILEGES ON DATABASE placementguru TO placementguru_user;"
```

**Option B: Docker**
```bash
docker run --name placementguru-postgres \
  -e POSTGRES_DB=placementguru \
  -e POSTGRES_USER=placementguru_user \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 -d postgres:14
```

**Option C: Cloud Provider**
- Get connection string from Neon, Supabase, or Railway
- Update `DATABASE_URL` in `.env.local`

### 2. Initialize Database
```bash
# Apply schema to database
npx prisma db push

# Add sample data
npx prisma db seed

# Verify setup
curl http://localhost:9002/api/health
```

### 3. Test API Endpoints
```bash
# Check health
curl http://localhost:9002/api/health

# Register a user
curl -X POST http://localhost:9002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get users
curl http://localhost:9002/api/users
```

## Integration Patterns

### Frontend to API Integration

#### 1. Using Fetch API
```typescript
// utils/api.ts
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:9002/api' 
  : '/api'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// Example usage in components
export async function getStudents(params?: {
  page?: number
  rtoId?: string
  status?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.rtoId) searchParams.set('rtoId', params.rtoId)
  if (params?.status) searchParams.set('status', params.status)
  
  return apiCall(`/students?${searchParams}`)
}
```

#### 2. React Hook Integration
```typescript
// hooks/useStudents.ts
import { useState, useEffect } from 'react'
import { getStudents } from '@/utils/api'

export function useStudents(params?: Parameters<typeof getStudents>[0]) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        const data = await getStudents(params)
        setStudents(data.students)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [params])

  return { students, loading, error }
}
```

### Firebase Auth + Database Integration

#### 1. User Creation Flow
```typescript
// lib/auth-integration.ts
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { apiCall } from '@/utils/api'

export async function registerUserWithDB(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}) {
  // 1. Create Firebase Auth user
  const auth = getAuth()
  const firebaseUser = await createUserWithEmailAndPassword(
    auth, 
    userData.email, 
    userData.password
  )
  
  try {
    // 2. Create database user record
    const dbUser = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'student',
        firebaseUid: firebaseUser.user.uid
      })
    })
    
    return { firebaseUser, dbUser }
  } catch (error) {
    // Rollback Firebase user if DB creation fails
    await firebaseUser.user.delete()
    throw error
  }
}
```

#### 2. Authentication Middleware
```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { prisma } from '@/lib/db'

export async function authenticateRequest(request: NextRequest) {
  const authorization = request.headers.get('Authorization')
  
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const token = authorization.split('Bearer ')[1]
  
  try {
    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    })
    
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 403 })
    }
    
    return { user, firebaseUser: decodedToken }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

## Component Integration Examples

### Student Dashboard Component
```typescript
// components/StudentDashboard.tsx
import { useStudents } from '@/hooks/useStudents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StudentDashboard({ rtoId }: { rtoId?: string }) {
  const { students, loading, error } = useStudents({ 
    rtoId, 
    status: 'enrolled',
    limit: 5 
  })

  if (loading) return <div>Loading students...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.map((student) => (
            <div key={student.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{student.user.firstName} {student.user.lastName}</p>
                <p className="text-sm text-gray-500">{student.studentId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{student.rto.name}</p>
                <p className="text-xs text-gray-500">{student.status}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Placement Management Component
```typescript
// components/PlacementManager.tsx
import { useState, useEffect } from 'react'
import { apiCall } from '@/utils/api'

export function PlacementManager() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlacements() {
      try {
        const data = await apiCall('/placements?status=active')
        setPlacements(data.placements)
      } catch (error) {
        console.error('Error fetching placements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlacements()
  }, [])

  const updatePlacementStatus = async (placementId: string, status: string) => {
    try {
      await apiCall(`/placements/${placementId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      
      // Refresh data
      setPlacements(prev => 
        prev.map(p => p.id === placementId ? {...p, status} : p)
      )
    } catch (error) {
      console.error('Error updating placement:', error)
    }
  }

  // Component rendering logic...
}
```

## Environment Configuration

### Development (.env.local)
```env
# Database
DATABASE_URL="postgresql://placementguru_user:password123@localhost:5432/placementguru"

# Firebase (already configured)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# App Settings
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:9002"
APP_ENV="development"
```

### Production (.env.production)
```env
# Database (use production connection string)
DATABASE_URL="your-production-database-url"

# Firebase (production service account)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# App Settings
NEXTAUTH_SECRET="secure-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
APP_ENV="production"
```

## Deployment Checklist

### Database
- [ ] Production PostgreSQL database created
- [ ] Connection string configured
- [ ] Schema applied: `npx prisma db push`
- [ ] Production data seeded (if needed)

### API
- [ ] Environment variables set
- [ ] Firebase service account configured
- [ ] API endpoints tested
- [ ] Authentication middleware implemented

### Frontend
- [ ] API integration tested
- [ ] Firebase Auth configured
- [ ] Error handling implemented
- [ ] Loading states added

### Security
- [ ] Authentication required for protected routes
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS configured properly

## Monitoring & Debugging

### Health Check Monitoring
```typescript
// Monitor API health
setInterval(async () => {
  try {
    const health = await fetch('/api/health')
    const data = await health.json()
    console.log('API Health:', data.services)
  } catch (error) {
    console.error('Health check failed:', error)
  }
}, 30000) // Check every 30 seconds
```

### Database Monitoring
```bash
# Check database status
npx prisma studio

# View logs
tail -f logs/database.log

# Check connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'placementguru';
```

## Next Steps

1. **Set up your database** using the setup guide
2. **Test API endpoints** with the provided examples
3. **Integrate Firebase Auth** with the database
4. **Connect frontend components** to the API
5. **Add authentication middleware** for protected routes
6. **Deploy to production** following the checklist

## Support

- Check the health endpoint: `/api/health`
- Review API documentation: `docs/api-documentation.md`
- Database setup guide: `docs/database-setup-guide.md`
- Prisma studio for data inspection: `npx prisma studio`