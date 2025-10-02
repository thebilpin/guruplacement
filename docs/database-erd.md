# PlacementGuru Database Entity Relationship Diagram

## Overview

This document describes the database schema relationships for the PlacementGuru student placement management system.

## Key Entity Relationships

### Core User System
```
Users (1) ←→ (0..1) Students
Users (1) ←→ (0..*) RtoUsers ←→ (1) RTOs
Users (1) ←→ (0..*) ProviderUsers ←→ (1) PlacementProviders
Users (1) ←→ (0..*) UserSessions
```

### Educational Structure
```
RTOs (1) ←→ (0..*) Courses
Courses (1) ←→ (0..*) UnitsOfCompetency
Courses (1) ←→ (0..*) Cohorts
Cohorts (1) ←→ (0..*) Students
Students (1) ←→ (0..*) StudentUnitProgress ←→ (1) UnitsOfCompetency
```

### Placement System
```
PlacementProviders (1) ←→ (0..*) PlacementOpportunities
PlacementOpportunities (1) ←→ (0..*) PlacementCourseMatches ←→ (1) Courses
PlacementOpportunities (1) ←→ (0..*) PlacementApplications ←→ (1) Students
PlacementApplications (1) ←→ (0..1) StudentPlacements
StudentPlacements (1) ←→ (0..*) PlacementHourLogs
```

### Assessment & Evaluation
```
Students (1) ←→ (0..*) Assessments ←→ (1) UnitsOfCompetency
StudentPlacements (1) ←→ (0..*) SupervisorEvaluations
StudentPlacements (1) ←→ (0..1) PlacementFeedback
```

### Communication & Documents
```
Users (1) ←→ (0..*) Messages [as sender]
Users (1) ←→ (0..*) Messages [as recipient]
Users (1) ←→ (0..*) Documents
Students (1) ←→ (0..*) Documents
Users (1) ←→ (0..*) Notifications
```

## Entity Descriptions

### Core Entities

#### Users
- **Purpose**: Central user management for all system roles
- **Key Fields**: email, role (enum), status, authentication data
- **Relationships**: Connected to all role-specific tables

#### RTOs (Registered Training Organizations)
- **Purpose**: Educational institutions offering courses
- **Key Fields**: name, code, subscription plan, contact details
- **Relationships**: Has courses, students, partnerships with providers

#### PlacementProviders
- **Purpose**: Organizations offering placement opportunities
- **Key Fields**: name, industry, rating, approval status
- **Relationships**: Has placement opportunities, partnerships with RTOs

#### Students
- **Purpose**: Student-specific information and progress tracking
- **Key Fields**: student_id, enrollment details, emergency contacts
- **Relationships**: Belongs to RTO/cohort, has placements and assessments

### Educational Structure

#### Courses
- **Purpose**: Academic programs offered by RTOs
- **Key Fields**: code, name, type (certificate/diploma), duration
- **Relationships**: Contains units, has cohorts, matches with placements

#### UnitsOfCompetency
- **Purpose**: Individual learning modules within courses
- **Key Fields**: code, name, required hours, assessment criteria
- **Relationships**: Part of course, tracked in student progress

#### Cohorts
- **Purpose**: Student groups enrolled in same course period
- **Key Fields**: name, start/end dates, student capacity
- **Relationships**: Contains students, part of course

### Placement System

#### PlacementOpportunities
- **Purpose**: Available placement positions
- **Key Fields**: title, requirements, hours, dates, location
- **Relationships**: Offered by provider, receives applications

#### PlacementApplications
- **Purpose**: Student applications for placements
- **Key Fields**: cover letter, documents, application status
- **Relationships**: Links student to opportunity, becomes active placement

#### StudentPlacements
- **Purpose**: Active placement assignments
- **Key Fields**: dates, hours tracking, progress, risk level
- **Relationships**: Has hour logs, evaluations, assessments

### Assessment & Progress

#### Assessments
- **Purpose**: Competency evaluations for units
- **Key Fields**: type, result, feedback, evidence
- **Relationships**: Links student, unit, assessor, optional placement

#### SupervisorEvaluations
- **Purpose**: Workplace supervisor feedback on student performance
- **Key Fields**: ratings (1-5), strengths, improvement areas
- **Relationships**: Linked to placement and supervisor

#### PlacementFeedback
- **Purpose**: Student feedback on placement experience
- **Key Fields**: ratings, recommendations, comments
- **Relationships**: One per completed placement

### Communication & Documentation

#### Messages
- **Purpose**: Internal messaging system
- **Key Fields**: content, type, status, threading support
- **Relationships**: Between users, can relate to placements

#### Documents
- **Purpose**: File storage and verification tracking
- **Key Fields**: type, status, expiry, verification details
- **Relationships**: Belongs to user/student, verified by staff

#### Notifications
- **Purpose**: System notifications and alerts
- **Key Fields**: type, content, read status, expiry
- **Relationships**: Delivered to users

## Data Flow Examples

### Student Placement Journey
1. **Student** applies to **PlacementOpportunity**
2. **PlacementApplication** created with status 'submitted'
3. **Provider** or **RTO** reviews application
4. If accepted, **StudentPlacement** record created
5. Student logs hours via **PlacementHourLogs**
6. **Supervisor** creates **SupervisorEvaluations**
7. **Assessor** records **Assessments** for competencies
8. Student provides **PlacementFeedback** on completion

### Progress Tracking
1. **Student** enrolls in **Course** via **Cohort**
2. **StudentUnitProgress** records created for each **UnitOfCompetency**
3. As **Assessments** are completed, progress updates
4. **PlacementHourLogs** contribute to competency hours
5. System calculates overall completion percentage

### Communication Flow
1. **User** sends **Message** to another user
2. **Notification** created for recipient
3. **AuditLog** records the action
4. **AnalyticsEvent** tracks engagement metrics

## Key Constraints & Business Rules

### Data Integrity
- Students must belong to exactly one RTO and cohort
- Placements must have valid start/end dates
- Hour logs cannot exceed 24 hours per day
- Assessment results must be valid enum values

### Business Logic
- Students can only apply to placements matching their course
- Supervisors can only evaluate students at their provider
- Documents have expiry tracking for compliance
- Placement progress auto-calculates from hour logs

### Security & Privacy
- Users can only access data within their role permissions
- Audit logs track all significant data changes
- Personal information (emergency contacts, medical) restricted
- Document verification requires appropriate staff role

## Performance Considerations

### Indexing Strategy
- Primary keys: Clustered indexes on UUID columns
- Foreign keys: Indexes on all relationship columns
- Query optimization: Indexes on frequently filtered columns
- Composite indexes: For complex multi-column queries

### Scalability
- Partitioning: Large tables (logs, events) by date
- Archiving: Historical data moved to separate tables
- Caching: Frequently accessed reference data
- Read replicas: For reporting and analytics queries

## Migration Strategy

### Version Control
- Schema changes tracked via migration files
- Rollback procedures for each migration
- Data transformation scripts for complex changes
- Environment-specific configuration management

### Deployment Process
1. Test migrations on development database
2. Backup production database
3. Apply migrations during maintenance window
4. Verify data integrity post-migration
5. Monitor application performance

This schema provides a robust foundation for the PlacementGuru platform while maintaining flexibility for future enhancements and scalability requirements.