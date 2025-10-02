# PlacementGuru API Documentation

## Base URL
```
http://localhost:9002/api
```

## Health Check

### GET /api/health
Check the status of the API and connected services.

**Response:**
```json
{
  "status": "healthy",
  "message": "PlacementGuru API is running",
  "services": {
    "api": "running",
    "database": "connected|error|not_configured",
    "firebase": "configured|not_configured"
  },
  "data": {
    "totalUsers": 0,
    "totalStudents": 0,
    "totalPlacements": 0
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Authentication

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student" // Optional: student|rto_admin|provider_admin|supervisor|assessor|platform_admin
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "status": "pending",
    "emailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/auth/login
Authenticate a user and get their profile.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "status": "active",
    "emailVerified": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

## User Management

### GET /api/users
Get a paginated list of users with filtering options.

**Query Parameters:**
- `role` - Filter by user role
- `status` - Filter by user status
- `search` - Search in name and email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "status": "active",
      "emailVerified": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### GET /api/users/[id]
Get detailed information about a specific user.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+61412345678",
    "role": "student",
    "status": "active",
    "student": {
      "studentId": "STU001",
      "rto": {
        "name": "Sample Training Institute",
        "code": "SAMPLE001"
      },
      "cohort": {
        "name": "Certificate III - January 2024",
        "startDate": "2024-01-15",
        "endDate": "2024-12-15"
      }
    }
  }
}
```

### PATCH /api/users/[id]
Update user information.

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "phone": "+61412345678",
  "status": "active"
}
```

### DELETE /api/users/[id]
Delete a user account.

## Student Management

### GET /api/students
Get a paginated list of students with filtering options.

**Query Parameters:**
- `rtoId` - Filter by RTO
- `status` - Filter by student status
- `cohortId` - Filter by cohort
- `search` - Search in student details
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "students": [
    {
      "id": "student_id",
      "studentId": "STU001",
      "status": "enrolled",
      "enrollmentDate": "2024-01-15",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "rto": {
        "name": "Sample Training Institute",
        "code": "SAMPLE001"
      },
      "cohort": {
        "name": "Certificate III - January 2024"
      },
      "placements": [
        {
          "id": "placement_id",
          "status": "active",
          "totalHoursCompleted": 40,
          "totalHoursRequired": 160
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### POST /api/students
Create a new student record.

**Request Body:**
```json
{
  "userId": "user_id",
  "rtoId": "rto_id",
  "cohortId": "cohort_id",
  "studentId": "STU001",
  "enrollmentDate": "2024-01-15",
  "expectedCompletionDate": "2024-12-15",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+61423456789",
  "emergencyContactRelationship": "Mother"
}
```

## Placement Management

### GET /api/placements
Get a list of student placements with detailed information.

**Query Parameters:**
- `studentId` - Filter by student
- `providerId` - Filter by placement provider
- `status` - Filter by placement status
- `riskLevel` - Filter by risk level
- `search` - Search in placement details
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "placements": [
    {
      "id": "placement_id",
      "status": "active",
      "startDate": "2024-03-01",
      "endDate": "2024-04-26",
      "totalHoursRequired": 160,
      "totalHoursCompleted": 40,
      "currentProgress": 25,
      "riskLevel": "low",
      "student": {
        "studentId": "STU001",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "rto": {
          "name": "Sample Training Institute"
        }
      },
      "opportunity": {
        "title": "Personal Care Assistant",
        "provider": {
          "name": "Sunny Meadows Aged Care",
          "email": "contact@sunnymeadows.com.au"
        }
      },
      "supervisor": {
        "firstName": "Emily",
        "lastName": "Davis",
        "email": "supervisor@provider.com"
      },
      "hourLogs": [
        {
          "logDate": "2024-03-15",
          "hoursWorked": 8.0,
          "supervisorVerified": true
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### POST /api/placements
Create a new student placement.

**Request Body:**
```json
{
  "studentId": "student_id",
  "placementId": "placement_opportunity_id",
  "applicationId": "application_id",
  "startDate": "2024-03-01",
  "endDate": "2024-04-26",
  "totalHoursRequired": 160,
  "supervisorId": "supervisor_user_id",
  "assessorId": "assessor_user_id"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Account is not active"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Database Status

The API will return different database statuses in the health check:

- `connected` - Database is accessible and responding
- `error` - Database connection failed (check logs for details)
- `not_configured` - DATABASE_URL not set in environment

## Authentication Notes

- All endpoints currently use basic email/password authentication
- Firebase Auth integration is planned for enhanced security
- JWT tokens or session-based auth should be implemented for production
- User roles determine access levels to different endpoints

## Development

To test these endpoints:

1. Ensure the development server is running: `npm run dev`
2. Set up the database following the setup guide
3. Use tools like Postman, curl, or the browser for testing
4. Check `/api/health` first to verify all services are running

## Production Considerations

- Add proper authentication middleware
- Implement rate limiting
- Add request validation schemas
- Set up proper error logging
- Add API versioning
- Implement CORS policies
- Add request/response compression