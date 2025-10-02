// Data Validation Utilities for PlacementGuru
// Comprehensive validation functions for all API endpoints and form data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ========================================
// USER VALIDATION
// ========================================

export const validateUser = (userData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!userData.firstName || userData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (!userData.lastName || userData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  if (!userData.role || !['student', 'rto_admin', 'provider_admin', 'supervisor', 'assessor', 'platform_admin'].includes(userData.role)) {
    errors.push('Valid user role is required');
  }

  // Optional field validations
  if (userData.phone && !isValidPhone(userData.phone)) {
    warnings.push('Phone number format may be invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// RTO VALIDATION
// ========================================

export const validateRTO = (rtoData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!rtoData.name || rtoData.name.trim().length < 3) {
    errors.push('RTO name must be at least 3 characters long');
  }
  
  if (!rtoData.code || rtoData.code.trim().length < 3) {
    errors.push('RTO code is required and must be at least 3 characters');
  }
  
  if (!rtoData.email || !isValidEmail(rtoData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!rtoData.country) {
    errors.push('Country is required');
  }

  // Business validations
  if (rtoData.abn && !isValidABN(rtoData.abn)) {
    warnings.push('ABN format may be invalid');
  }
  
  if (rtoData.phone && !isValidPhone(rtoData.phone)) {
    warnings.push('Phone number format may be invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// PROVIDER VALIDATION
// ========================================

export const validateProvider = (providerData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!providerData.name || providerData.name.trim().length < 3) {
    errors.push('Provider name must be at least 3 characters long');
  }
  
  if (!providerData.email || !isValidEmail(providerData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!providerData.industry || providerData.industry.trim().length < 2) {
    errors.push('Industry is required');
  }
  
  if (!providerData.country) {
    errors.push('Country is required');
  }

  // Business validations
  if (providerData.abn && !isValidABN(providerData.abn)) {
    warnings.push('ABN format may be invalid');
  }
  
  if (providerData.phone && !isValidPhone(providerData.phone)) {
    warnings.push('Phone number format may be invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// CONTRACT VALIDATION
// ========================================

export const validateContract = (contractData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!contractData.title || contractData.title.trim().length < 5) {
    errors.push('Contract title must be at least 5 characters long');
  }
  
  if (!contractData.rtoId) {
    errors.push('RTO ID is required');
  }
  
  if (!contractData.providerId) {
    errors.push('Provider ID is required');
  }
  
  if (!contractData.startDate) {
    errors.push('Start date is required');
  }
  
  if (!contractData.endDate) {
    errors.push('End date is required');
  }
  
  if (!contractData.contractType || !['placement_agreement', 'assessment_agreement', 'full_partnership', 'mou'].includes(contractData.contractType)) {
    errors.push('Valid contract type is required');
  }

  // Date validations
  if (contractData.startDate && contractData.endDate) {
    const startDate = new Date(contractData.startDate);
    const endDate = new Date(contractData.endDate);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
    
    if (startDate < new Date()) {
      warnings.push('Start date is in the past');
    }
  }

  // Capacity validations
  if (contractData.maxStudents && (contractData.maxStudents < 1 || contractData.maxStudents > 1000)) {
    errors.push('Maximum students must be between 1 and 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// INVITATION VALIDATION
// ========================================

export const validateInvitation = (invitationData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!invitationData.email || !isValidEmail(invitationData.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!invitationData.firstName || invitationData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (!invitationData.lastName || invitationData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  if (!invitationData.role || !['student', 'supervisor', 'assessor'].includes(invitationData.role)) {
    errors.push('Valid role is required for invitation');
  }
  
  if (!invitationData.organizationId) {
    errors.push('Organization ID is required');
  }
  
  if (!invitationData.organizationType || !['rto', 'provider'].includes(invitationData.organizationType)) {
    errors.push('Valid organization type is required');
  }
  
  if (!invitationData.invitedBy) {
    errors.push('Inviter ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// STUDENT VALIDATION
// ========================================

export const validateStudent = (studentData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!studentData.userId) {
    errors.push('User ID is required');
  }
  
  if (!studentData.rtoId) {
    errors.push('RTO ID is required');
  }
  
  if (!studentData.studentId || studentData.studentId.trim().length < 3) {
    errors.push('Student ID must be at least 3 characters long');
  }

  // Optional field validations
  if (studentData.totalHoursRequired && (studentData.totalHoursRequired < 1 || studentData.totalHoursRequired > 2000)) {
    errors.push('Total hours required must be between 1 and 2000');
  }
  
  if (studentData.totalHoursCompleted && studentData.totalHoursCompleted < 0) {
    errors.push('Total hours completed cannot be negative');
  }
  
  if (studentData.totalHoursCompleted > studentData.totalHoursRequired) {
    warnings.push('Hours completed exceeds hours required');
  }

  // Status validation
  if (studentData.status && !['enrolled', 'in_placement', 'completed', 'withdrawn', 'suspended', 'deferred'].includes(studentData.status)) {
    errors.push('Invalid student status');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// PLACEMENT VALIDATION
// ========================================

export const validatePlacement = (placementData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!placementData.title || placementData.title.trim().length < 5) {
    errors.push('Placement title must be at least 5 characters long');
  }
  
  if (!placementData.providerId) {
    errors.push('Provider ID is required');
  }
  
  if (!placementData.startDate) {
    errors.push('Start date is required');
  }
  
  if (!placementData.endDate) {
    errors.push('End date is required');
  }
  
  if (!placementData.maxStudents || placementData.maxStudents < 1) {
    errors.push('Maximum students must be at least 1');
  }

  // Date validations
  if (placementData.startDate && placementData.endDate) {
    const startDate = new Date(placementData.startDate);
    const endDate = new Date(placementData.endDate);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }

  // Hours validation
  if (placementData.totalHours && (placementData.totalHours < 1 || placementData.totalHours > 2000)) {
    errors.push('Total hours must be between 1 and 2000');
  }
  
  if (placementData.hoursPerWeek && (placementData.hoursPerWeek < 1 || placementData.hoursPerWeek > 60)) {
    errors.push('Hours per week must be between 1 and 60');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ========================================
// HELPER FUNCTIONS
// ========================================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - adjust regex based on requirements
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const isValidABN = (abn: string): boolean => {
  // Basic ABN format validation - implement proper ABN validation algorithm
  const abnRegex = /^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/;
  return abnRegex.test(abn.replace(/\s/g, ''));
};

// ========================================
// API RESPONSE HELPERS
// ========================================

export const createSuccessResponse = (data: any, message?: string) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date()
  };
};

export const createErrorResponse = (error: string, statusCode: number = 400, details?: any) => {
  return {
    success: false,
    error,
    details,
    timestamp: new Date(),
    statusCode
  };
};

export const createValidationErrorResponse = (validationResult: ValidationResult) => {
  return createErrorResponse(
    'Validation failed',
    400,
    {
      errors: validationResult.errors,
      warnings: validationResult.warnings
    }
  );
};

// ========================================
// DATABASE QUERY HELPERS
// ========================================

export const validatePaginationParams = (params: any) => {
  const page = parseInt(params.page) || 1;
  const limit = Math.min(parseInt(params.limit) || 20, 100); // Max 100 per page
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    offset: (Math.max(1, page) - 1) * Math.max(1, limit)
  };
};

export const validateSortParams = (params: any, allowedFields: string[]) => {
  const sortBy = params.sortBy && allowedFields.includes(params.sortBy) 
    ? params.sortBy 
    : allowedFields[0] || 'createdAt';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';
  
  return { sortBy, sortOrder };
};

// ========================================
// SANITIZATION HELPERS
// ========================================

export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: any, allowedFields: string[]): any => {
  const sanitized: any = {};
  
  for (const field of allowedFields) {
    if (obj.hasOwnProperty(field)) {
      if (typeof obj[field] === 'string') {
        sanitized[field] = sanitizeString(obj[field]);
      } else {
        sanitized[field] = obj[field];
      }
    }
  }
  
  return sanitized;
};