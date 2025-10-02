# Database Setup Guide for PlacementGuru

This guide covers setting up the database for the PlacementGuru application using either raw PostgreSQL or Prisma ORM.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ for Prisma (if using)
- Access to create databases and users

## Option 1: Raw PostgreSQL Setup

### 1. Create Database and User

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE placementguru;
CREATE USER placementguru_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE placementguru TO placementguru_user;

-- Grant additional permissions
\c placementguru
GRANT CREATE ON SCHEMA public TO placementguru_user;
GRANT USAGE ON SCHEMA public TO placementguru_user;
```

### 2. Run Schema Creation

```bash
# Execute the schema file
psql -U placementguru_user -d placementguru -f docs/database-schema.sql
```

### 3. Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://placementguru_user:your_secure_password@localhost:5432/placementguru"
```

### 4. Verify Installation

```sql
-- Check tables were created
\dt

-- Check some key tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rtos;
SELECT COUNT(*) FROM placement_providers;
```

## Option 2: Prisma Setup (Recommended)

### 1. Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma

```bash
npx prisma init
```

### 3. Configure Environment

Update `.env` file:

```env
DATABASE_URL="postgresql://placementguru_user:your_secure_password@localhost:5432/placementguru"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:9002"
```

### 4. Generate and Apply Migrations

```bash
# Generate the Prisma client
npx prisma generate

# Create and apply the first migration
npx prisma migrate dev --name init

# Or push schema without migrations (for development)
npx prisma db push
```

### 5. View Database in Prisma Studio

```bash
npx prisma studio
```

## Database Seeding

### Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create platform admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@placementguru.com',
      passwordHash: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'platform_admin',
      status: 'active',
      emailVerified: true,
    },
  })

  // Create sample RTO
  const rto = await prisma.rTO.create({
    data: {
      name: 'TAFE NSW',
      code: 'TAFE-NSW',
      description: 'Technical and Further Education NSW',
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      subscriptionPlan: 'premium',
    },
  })

  // Create RTO admin
  const rtoAdminPassword = await bcrypt.hash('rto123', 12)
  const rtoAdmin = await prisma.user.create({
    data: {
      email: 'admin@tafe.nsw.edu.au',
      passwordHash: rtoAdminPassword,
      firstName: 'RTO',
      lastName: 'Administrator',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      rtoUsers: {
        create: {
          rtoId: rto.id,
          position: 'Administrator',
          isPrimary: true,
        },
      },
    },
  })

  // Create sample course
  const course = await prisma.course.create({
    data: {
      rtoId: rto.id,
      code: 'CHC33015',
      name: 'Certificate III in Individual Support',
      type: 'certificate_iii',
      description: 'Qualification for aged care and disability support workers',
      durationWeeks: 52,
      totalPlacementHours: 120,
    },
  })

  // Create cohort
  const cohort = await prisma.cohort.create({
    data: {
      courseId: course.id,
      name: '2024 Semester 1',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-15'),
      maxStudents: 30,
    },
  })

  // Create units of competency
  await prisma.unitOfCompetency.createMany({
    data: [
      {
        courseId: course.id,
        code: 'CHCAGE001',
        name: 'Facilitate the empowerment of older people',
        requiredHours: 20,
        isCore: true,
      },
      {
        courseId: course.id,
        code: 'CHCAGE005',
        name: 'Provide support to people living with dementia',
        requiredHours: 25,
        isCore: true,
      },
      {
        courseId: course.id,
        code: 'CHCCCS011',
        name: 'Meet personal support needs',
        requiredHours: 30,
        isCore: true,
      },
    ],
  })

  // Create placement provider
  const provider = await prisma.placementProvider.create({
    data: {
      name: "St. Vincent's Hospital",
      industry: 'Healthcare',
      description: 'Leading healthcare provider offering quality clinical placements',
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      isApproved: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  })

  // Create provider partnership
  await prisma.rtoProviderPartnership.create({
    data: {
      rtoId: rto.id,
      providerId: provider.id,
      status: 'active',
      partnershipStart: new Date('2024-01-01'),
    },
  })

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 12)
  const studentUser = await prisma.user.create({
    data: {
      email: 'sarah.johnson@student.edu.au',
      passwordHash: studentPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'student',
      status: 'active',
      emailVerified: true,
    },
  })

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      studentId: 'STU-001',
      rtoId: rto.id,
      cohortId: cohort.id,
      status: 'enrolled',
      enrollmentDate: new Date('2024-02-01'),
      expectedCompletionDate: new Date('2024-12-15'),
      emergencyContactName: 'John Johnson',
      emergencyContactPhone: '0412345678',
      emergencyContactRelationship: 'Father',
    },
  })

  // Create supervisor
  const supervisorPassword = await bcrypt.hash('supervisor123', 12)
  const supervisor = await prisma.user.create({
    data: {
      email: 'john.smith@svha.org.au',
      passwordHash: supervisorPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'supervisor',
      status: 'active',
      emailVerified: true,
      providerUsers: {
        create: {
          providerId: provider.id,
          position: 'Senior Nurse',
          isPrimary: false,
        },
      },
    },
  })

  // Create placement opportunity
  const placement = await prisma.placementOpportunity.create({
    data: {
      providerId: provider.id,
      title: 'Aged Care Support Worker',
      description: 'Hands-on experience in aged care facility',
      industry: 'Healthcare',
      locationCity: 'Sydney',
      locationState: 'NSW',
      requiredHours: 120,
      maxStudents: 2,
      placementStartDate: new Date('2024-06-01'),
      placementEndDate: new Date('2024-08-30'),
      requirements: 'Police check, First Aid certificate, Vaccination records',
      benefits: 'Mentorship, structured learning, potential employment',
      status: 'applications_open',
      createdBy: supervisor.id,
    },
  })

  console.log('Seed data created successfully!')
  console.log('Login credentials:')
  console.log('Platform Admin: admin@placementguru.com / admin123')
  console.log('RTO Admin: admin@tafe.nsw.edu.au / rto123')
  console.log('Student: sarah.johnson@student.edu.au / student123')
  console.log('Supervisor: john.smith@svha.org.au / supervisor123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Run Seeding

```bash
# Add to package.json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}

# Install dependencies
npm install bcryptjs
npm install -D tsx @types/bcryptjs

# Run seed
npx prisma db seed
```

## Database Maintenance

### Backup

```bash
# Create backup
pg_dump -U placementguru_user -d placementguru > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U placementguru_user -d placementguru < backup_file.sql
```

### Migrations (Prisma)

```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Performance Optimization

Key indexes are included in the schema. Monitor query performance and add additional indexes as needed:

```sql
-- Example: Add index for frequent queries
CREATE INDEX idx_placement_opportunities_location ON placement_opportunities(location_city, location_state);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);
```

## Monitoring

### Health Checks

```sql
-- Check database connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'placementguru';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Query Performance

```sql
-- Enable query logging (postgresql.conf)
log_statement = 'all'
log_min_duration_statement = 1000

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Security Considerations

1. **Use strong passwords** for database users
2. **Limit database permissions** - only grant necessary privileges
3. **Enable SSL** for database connections in production
4. **Regular backups** with encryption
5. **Monitor access logs** for suspicious activity
6. **Keep PostgreSQL updated** to latest secure version

## Production Deployment

For production deployment, consider:

- **Connection pooling** (e.g., PgBouncer)
- **Read replicas** for reporting queries
- **Database monitoring** (e.g., PostgreSQL extensions)
- **Automated backups** to cloud storage
- **SSL/TLS encryption** in transit and at rest

## Troubleshooting

### Common Issues

1. **Connection errors**: Check DATABASE_URL and PostgreSQL service
2. **Permission denied**: Verify user permissions and database ownership
3. **Migration failures**: Check for data conflicts and manual intervention
4. **Performance issues**: Analyze query plans and add indexes

### Useful Commands

```bash
# Check Prisma status
npx prisma status

# View current schema
npx prisma db pull

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```