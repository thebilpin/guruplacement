// User Verification and Activation System Schema
// This extends the base user schema with verification and invitation logic

import { z } from 'zod';

// Verification status for RTOs and Providers
export type VerificationStatus = 
  | 'pending'      // Newly registered, awaiting admin review
  | 'under_review' // Admin is reviewing documentation
  | 'verified'     // Admin has approved
  | 'rejected'     // Admin has rejected with feedback
  | 'suspended';   // Temporarily suspended

// Invitation status for Students, Supervisors, and Assessors
export type InvitationStatus =
  | 'invited'      // Invitation sent, awaiting acceptance
  | 'accepted'     // User has accepted invitation
  | 'declined'     // User has declined invitation
  | 'expired';     // Invitation has expired

// MoU/Contract status between RTOs and Providers
export type ContractStatus =
  | 'draft'        // Contract being prepared
  | 'pending'      // Sent for approval
  | 'active'       // Signed and active
  | 'expired'      // Contract has expired
  | 'terminated';  // Contract terminated early

// Enhanced user interface with verification fields
export interface VerificationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  
  // Verification fields
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
  verifiedBy?: string; // Admin user ID who verified
  verifiedAt?: Date;
  
  // Invitation fields (for students, supervisors, assessors)
  invitationStatus?: InvitationStatus;
  invitedBy?: string; // RTO/Provider user ID who invited
  invitedAt?: Date;
  acceptedAt?: Date;
  invitationToken?: string;
  
  // Organization linkage
  rtoId?: string;     // For students and assessors
  providerId?: string; // For supervisors
  
  // Activation tracking
  canAccessDashboard: boolean;
  dashboardActivatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Validation schemas
export const verificationSchema = z.object({
  verificationStatus: z.enum(['pending', 'under_review', 'verified', 'rejected', 'suspended']),
  verificationNotes: z.string().optional(),
  verifiedBy: z.string().optional(),
});

export const invitationSchema = z.object({
  invitationStatus: z.enum(['invited', 'accepted', 'declined', 'expired']),
  invitedBy: z.string(),
  invitationToken: z.string(),
});

// MoU/Contract between RTO and Provider
export interface Contract {
  id: string;
  rtoId: string;
  providerId: string;
  
  // Contract details
  title: string;
  description?: string;
  contractType: 'mou' | 'placement_agreement' | 'service_agreement';
  status: ContractStatus;
  
  // Terms
  startDate: Date;
  endDate: Date;
  maxStudents?: number;
  placementDuration?: number; // in weeks
  
  // Signatures
  rtoSignedBy?: string;
  rtoSignedAt?: Date;
  providerSignedBy?: string;
  providerSignedAt?: Date;
  
  // Document
  documentUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard access rules
export interface DashboardAccess {
  userId: string;
  role: string;
  canAccess: boolean;
  reason?: string;
  
  // Role-specific requirements
  requiresVerification?: boolean;
  requiresInvitation?: boolean;
  requiresContract?: boolean;
  
  // Blocking conditions
  pendingVerification?: boolean;
  pendingInvitation?: boolean;
  noActiveContracts?: boolean;
}

// Activation helper functions
export const canAccessDashboard = (user: VerificationUser): DashboardAccess => {
  const access: DashboardAccess = {
    userId: user.id,
    role: user.role,
    canAccess: false,
  };

  switch (user.role) {
    case 'platform_admin':
      // Admin always has access
      access.canAccess = true;
      break;
      
    case 'rto_admin':
      // RTO needs admin verification
      access.requiresVerification = true;
      access.pendingVerification = user.verificationStatus !== 'verified';
      access.canAccess = user.verificationStatus === 'verified';
      if (!access.canAccess) {
        access.reason = 'RTO requires admin verification to access dashboard';
      }
      break;
      
    case 'provider_admin':
      // Provider needs admin verification (can access but limited functionality without contracts)
      access.requiresVerification = true;
      access.pendingVerification = user.verificationStatus !== 'verified';
      access.canAccess = user.verificationStatus === 'verified';
      if (!access.canAccess) {
        access.reason = 'Provider requires admin verification to access dashboard';
      }
      break;
      
    case 'student':
      // Student needs RTO registration + invitation acceptance
      access.requiresInvitation = true;
      access.pendingInvitation = user.invitationStatus !== 'accepted';
      access.canAccess = user.invitationStatus === 'accepted' && !!user.rtoId;
      if (!access.canAccess) {
        access.reason = 'Student must be registered by RTO and accept invitation';
      }
      break;
      
    case 'supervisor':
      // Supervisor needs provider assignment + invitation acceptance
      access.requiresInvitation = true;
      access.pendingInvitation = user.invitationStatus !== 'accepted';
      access.canAccess = user.invitationStatus === 'accepted' && !!user.providerId;
      if (!access.canAccess) {
        access.reason = 'Supervisor must be assigned by provider and accept invitation';
      }
      break;
      
    case 'assessor':
      // Assessor needs RTO assignment + invitation acceptance
      access.requiresInvitation = true;
      access.pendingInvitation = user.invitationStatus !== 'accepted';
      access.canAccess = user.invitationStatus === 'accepted' && !!user.rtoId;
      if (!access.canAccess) {
        access.reason = 'Assessor must be assigned by RTO and accept invitation';
      }
      break;
      
    default:
      access.reason = 'Invalid user role';
  }

  return access;
};

// Invitation token generation
export const generateInvitationToken = (): string => {
  return Buffer.from(
    `${Date.now()}-${Math.random().toString(36).substring(2)}`
  ).toString('base64url');
};

// Check if invitation is expired (7 days default)
export const isInvitationExpired = (invitedAt: Date, expiryDays = 7): boolean => {
  const expiryDate = new Date(invitedAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return new Date() > expiryDate;
};