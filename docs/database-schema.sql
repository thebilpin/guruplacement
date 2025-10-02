-- PlacementGuru Database Schema
-- Comprehensive schema for student placement management system
-- Supports multi-role users: Students, RTOs, Providers, Supervisors, Assessors, Admins

-- ========================================
-- CORE USER MANAGEMENT
-- ========================================

-- User Types and Roles
CREATE TYPE user_role AS ENUM (
    'student',
    'rto_admin', 
    'provider_admin',
    'supervisor',
    'assessor',
    'platform_admin'
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Main Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role user_role NOT NULL,
    status user_status DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ORGANIZATION ENTITIES
-- ========================================

-- RTOs (Registered Training Organizations)
CREATE TABLE rtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "TAFE-NSW"
    description TEXT,
    logo_url TEXT,
    website TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postcode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Australia',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Placement Providers (Companies/Organizations offering placements)
CREATE TABLE placement_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100), -- Healthcare, Construction, Education, etc.
    description TEXT,
    logo_url TEXT,
    website TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postcode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'Australia',
    rating DECIMAL(3,2), -- Average rating from student feedback
    total_placements INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link RTOs to Providers (many-to-many relationship)
CREATE TABLE rto_provider_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rto_id UUID NOT NULL REFERENCES rtos(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES placement_providers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending
    partnership_start DATE,
    partnership_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rto_id, provider_id)
);

-- ========================================
-- USER ROLE ASSOCIATIONS
-- ========================================

-- Link users to RTOs
CREATE TABLE rto_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rto_id UUID NOT NULL REFERENCES rtos(id) ON DELETE CASCADE,
    position VARCHAR(100), -- "Administrator", "Coordinator", etc.
    permissions JSONB, -- Flexible permissions object
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, rto_id)
);

-- Link users to Placement Providers
CREATE TABLE provider_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES placement_providers(id) ON DELETE CASCADE,
    position VARCHAR(100), -- "HR Manager", "Supervisor", etc.
    permissions JSONB,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- ========================================
-- COURSES AND PROGRAMS
-- ========================================

CREATE TYPE course_type AS ENUM ('certificate_i', 'certificate_ii', 'certificate_iii', 'certificate_iv', 'diploma', 'advanced_diploma', 'bachelor', 'other');

-- Courses offered by RTOs
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rto_id UUID NOT NULL REFERENCES rtos(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., "CHC33015"
    name VARCHAR(255) NOT NULL, -- e.g., "Certificate III in Individual Support"
    type course_type NOT NULL,
    description TEXT,
    duration_weeks INTEGER,
    total_placement_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rto_id, code)
);

-- Units of Competency within courses
CREATE TABLE units_of_competency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., "CHCAGE001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_hours INTEGER,
    is_core BOOLEAN DEFAULT TRUE, -- core vs elective
    assessment_criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, code)
);

-- Course cohorts/intakes
CREATE TABLE cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "2024 Semester 1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, name)
);

-- ========================================
-- STUDENT INFORMATION
-- ========================================

CREATE TYPE student_status AS ENUM ('enrolled', 'in_placement', 'completed', 'withdrawn', 'suspended');

-- Student profiles
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "STU-12345"
    rto_id UUID NOT NULL REFERENCES rtos(id),
    cohort_id UUID NOT NULL REFERENCES cohorts(id),
    status student_status DEFAULT 'enrolled',
    enrollment_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    dietary_requirements TEXT,
    medical_conditions TEXT,
    accessibility_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Student progress tracking
CREATE TABLE student_unit_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units_of_competency(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, not_yet_competent
    hours_completed INTEGER DEFAULT 0,
    hours_required INTEGER NOT NULL,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, unit_id)
);

-- ========================================
-- PLACEMENT SYSTEM
-- ========================================

CREATE TYPE placement_status AS ENUM ('draft', 'published', 'applications_open', 'applications_closed', 'filled', 'cancelled');

-- Available placement opportunities
CREATE TABLE placement_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES placement_providers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    location_address VARCHAR(255),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_postcode VARCHAR(10),
    required_hours INTEGER NOT NULL,
    max_students INTEGER DEFAULT 1,
    application_deadline DATE,
    placement_start_date DATE,
    placement_end_date DATE,
    requirements TEXT, -- Skills, certifications, etc.
    benefits TEXT,
    hourly_rate DECIMAL(5,2), -- If paid
    is_paid BOOLEAN DEFAULT FALSE,
    status placement_status DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link placements to suitable courses
CREATE TABLE placement_course_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES placement_opportunities(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    match_percentage INTEGER, -- AI-calculated match score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(placement_id, course_id)
);

CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');

-- Student applications for placements
CREATE TABLE placement_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    placement_id UUID NOT NULL REFERENCES placement_opportunities(id) ON DELETE CASCADE,
    status application_status DEFAULT 'draft',
    cover_letter TEXT,
    resume_url TEXT,
    additional_documents JSONB, -- Array of document URLs
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, placement_id)
);

CREATE TYPE active_placement_status AS ENUM ('scheduled', 'in_progress', 'completed', 'terminated', 'on_hold');

-- Active student placements
CREATE TABLE student_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    placement_id UUID NOT NULL REFERENCES placement_opportunities(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES placement_applications(id),
    supervisor_id UUID REFERENCES users(id), -- On-site supervisor
    assessor_id UUID REFERENCES users(id), -- RTO assessor
    status active_placement_status DEFAULT 'scheduled',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours_required INTEGER NOT NULL,
    total_hours_completed INTEGER DEFAULT 0,
    current_progress INTEGER DEFAULT 0, -- Percentage
    risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high
    risk_factors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily/weekly hour logs
CREATE TABLE placement_hour_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES student_placements(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    hours_worked DECIMAL(4,2) NOT NULL,
    activities_performed TEXT,
    reflection_notes TEXT,
    supervisor_verified BOOLEAN DEFAULT FALSE,
    supervisor_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(placement_id, log_date)
);

-- ========================================
-- ASSESSMENT AND EVALUATION
-- ========================================

CREATE TYPE assessment_type AS ENUM ('formative', 'summative', 'competency', 'portfolio');
CREATE TYPE competency_result AS ENUM ('competent', 'not_yet_competent', 'not_assessed');

-- Assessment records
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units_of_competency(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES student_placements(id),
    assessor_id UUID NOT NULL REFERENCES users(id),
    assessment_type assessment_type NOT NULL,
    result competency_result DEFAULT 'not_assessed',
    feedback TEXT,
    assessment_date DATE,
    due_date DATE,
    evidence_documents JSONB, -- Array of document URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supervisor evaluations of students
CREATE TABLE supervisor_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES student_placements(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES users(id),
    evaluation_period VARCHAR(20), -- weekly, mid_placement, final
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    technical_skills_rating INTEGER CHECK (technical_skills_rating >= 1 AND technical_skills_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    initiative_rating INTEGER CHECK (initiative_rating >= 1 AND initiative_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    additional_comments TEXT,
    evaluation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student feedback on placements
CREATE TABLE placement_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES student_placements(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    supervisor_rating INTEGER CHECK (supervisor_rating >= 1 AND supervisor_rating <= 5),
    learning_opportunities_rating INTEGER CHECK (learning_opportunities_rating >= 1 AND learning_opportunities_rating <= 5),
    workplace_culture_rating INTEGER CHECK (workplace_culture_rating >= 1 AND workplace_culture_rating <= 5),
    support_rating INTEGER CHECK (support_rating >= 1 AND support_rating <= 5),
    would_recommend BOOLEAN,
    positive_aspects TEXT,
    improvement_suggestions TEXT,
    additional_comments TEXT,
    feedback_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DOCUMENT MANAGEMENT
-- ========================================

CREATE TYPE document_type AS ENUM (
    'resume', 'cover_letter', 'certificate', 'police_check', 'working_with_children',
    'first_aid', 'vaccination', 'insurance', 'assessment_evidence', 'timesheet', 'other'
);

CREATE TYPE document_status AS ENUM ('pending', 'verified', 'expired', 'rejected');

-- Document storage and verification
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    status document_status DEFAULT 'pending',
    expiry_date DATE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- COMMUNICATION SYSTEM
-- ========================================

CREATE TYPE message_type AS ENUM ('direct', 'group', 'announcement', 'system');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Messages between users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'direct',
    parent_message_id UUID REFERENCES messages(id), -- For replies
    placement_id UUID REFERENCES student_placements(id), -- Context
    status message_status DEFAULT 'sent',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group messaging (e.g., cohort announcements)
CREATE TABLE message_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    rto_id UUID REFERENCES rtos(id),
    cohort_id UUID REFERENCES cohorts(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES message_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ========================================
-- NOTIFICATIONS SYSTEM
-- ========================================

CREATE TYPE notification_type AS ENUM (
    'placement_application', 'placement_accepted', 'placement_rejected',
    'evaluation_due', 'document_expiring', 'hours_logged', 'announcement',
    'message_received', 'assessment_graded', 'compliance_reminder'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    related_id UUID, -- Related placement, assessment, etc.
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ANALYTICS AND REPORTING
-- ========================================

-- System-wide metrics tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL, -- login, placement_applied, document_uploaded, etc.
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Placement success metrics
CREATE TABLE placement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES student_placements(id) ON DELETE CASCADE,
    completion_rate DECIMAL(5,2), -- Percentage of hours completed
    satisfaction_score DECIMAL(3,2), -- From feedback
    competency_achievement_rate DECIMAL(5,2),
    time_to_completion_days INTEGER,
    risk_incidents INTEGER DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider performance tracking
CREATE TABLE provider_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES placement_providers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_placements INTEGER DEFAULT 0,
    successful_completions INTEGER DEFAULT 0,
    average_satisfaction_rating DECIMAL(3,2),
    response_time_hours DECIMAL(5,2), -- Average time to respond to applications
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SYSTEM CONFIGURATION
-- ========================================

-- Platform-wide settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be accessed by non-admin users
    updated_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail for important actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User authentication indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Student and placement indexes
CREATE INDEX idx_students_rto_id ON students(rto_id);
CREATE INDEX idx_students_cohort_id ON students(cohort_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_student_placements_student_id ON student_placements(student_id);
CREATE INDEX idx_student_placements_status ON student_placements(status);
CREATE INDEX idx_placement_opportunities_provider_id ON placement_opportunities(provider_id);
CREATE INDEX idx_placement_opportunities_status ON placement_opportunities(status);

-- Communication indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Document indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_student_id ON documents(student_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rtos_updated_at BEFORE UPDATE ON rtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placement_providers_updated_at BEFORE UPDATE ON placement_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placement_opportunities_updated_at BEFORE UPDATE ON placement_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placement_applications_updated_at BEFORE UPDATE ON placement_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_placements_updated_at BEFORE UPDATE ON student_placements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placement_hour_logs_updated_at BEFORE UPDATE ON placement_hour_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_unit_progress_updated_at BEFORE UPDATE ON student_unit_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA FUNCTIONS
-- ========================================

-- Function to calculate placement progress
CREATE OR REPLACE FUNCTION calculate_placement_progress(placement_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_hours INTEGER;
    completed_hours INTEGER;
    progress INTEGER;
BEGIN
    SELECT 
        sp.total_hours_required,
        COALESCE(SUM(phl.hours_worked), 0)
    INTO total_hours, completed_hours
    FROM student_placements sp
    LEFT JOIN placement_hour_logs phl ON sp.id = phl.placement_id
    WHERE sp.id = placement_id
    GROUP BY sp.total_hours_required;
    
    IF total_hours > 0 THEN
        progress := ROUND((completed_hours::DECIMAL / total_hours::DECIMAL) * 100);
        
        -- Update the placement record
        UPDATE student_placements 
        SET 
            total_hours_completed = completed_hours,
            current_progress = progress,
            updated_at = NOW()
        WHERE id = placement_id;
        
        RETURN progress;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update placement progress when hours are logged
CREATE OR REPLACE FUNCTION update_placement_progress()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_placement_progress(NEW.placement_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_placement_progress 
    AFTER INSERT OR UPDATE ON placement_hour_logs 
    FOR EACH ROW EXECUTE FUNCTION update_placement_progress();

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Student dashboard view
CREATE VIEW student_dashboard_view AS
SELECT 
    s.id as student_id,
    u.first_name,
    u.last_name,
    u.email,
    u.avatar_url,
    s.student_id as student_number,
    r.name as rto_name,
    c.name as course_name,
    ch.name as cohort_name,
    s.status as student_status,
    COALESCE(sp.current_progress, 0) as current_placement_progress,
    sp.status as placement_status,
    pp.name as current_provider,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT CASE WHEN d.status = 'verified' THEN d.id END) as verified_documents
FROM students s
JOIN users u ON s.user_id = u.id
JOIN rtos r ON s.rto_id = r.id
JOIN cohorts ch ON s.cohort_id = ch.id
JOIN courses c ON ch.course_id = c.id
LEFT JOIN student_placements sp ON s.id = sp.student_id AND sp.status = 'in_progress'
LEFT JOIN placement_opportunities po ON sp.placement_id = po.id
LEFT JOIN placement_providers pp ON po.provider_id = pp.id
LEFT JOIN documents d ON s.id = d.student_id
GROUP BY s.id, u.first_name, u.last_name, u.email, u.avatar_url, s.student_id, 
         r.name, c.name, ch.name, s.status, sp.current_progress, sp.status, pp.name;

-- RTO dashboard view
CREATE VIEW rto_dashboard_view AS
SELECT 
    r.id as rto_id,
    r.name as rto_name,
    COUNT(DISTINCT s.id) as total_students,
    COUNT(DISTINCT CASE WHEN s.status = 'in_placement' THEN s.id END) as students_in_placement,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as students_completed,
    COUNT(DISTINCT sp.id) as active_placements,
    COUNT(DISTINCT pp.id) as partner_providers,
    AVG(pf.overall_rating) as average_placement_rating
FROM rtos r
LEFT JOIN students s ON r.id = s.rto_id
LEFT JOIN student_placements sp ON s.id = sp.student_id AND sp.status = 'in_progress'
LEFT JOIN placement_opportunities po ON sp.placement_id = po.id
LEFT JOIN placement_providers pp ON po.provider_id = pp.id
LEFT JOIN placement_feedback pf ON sp.id = pf.placement_id
GROUP BY r.id, r.name;

-- Provider performance view
CREATE VIEW provider_performance_view AS
SELECT 
    pp.id as provider_id,
    pp.name as provider_name,
    pp.industry,
    COUNT(DISTINCT sp.id) as total_placements,
    COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.id END) as completed_placements,
    AVG(pf.overall_rating) as average_rating,
    AVG(se.overall_rating) as supervisor_rating,
    COUNT(DISTINCT po.id) as active_opportunities
FROM placement_providers pp
LEFT JOIN placement_opportunities po ON pp.id = po.provider_id
LEFT JOIN student_placements sp ON po.id = sp.placement_id
LEFT JOIN placement_feedback pf ON sp.id = pf.placement_id
LEFT JOIN supervisor_evaluations se ON sp.id = se.placement_id
GROUP BY pp.id, pp.name, pp.industry;