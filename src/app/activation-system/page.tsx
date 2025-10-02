'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Shield, 
  Users, 
  FileText, 
  UserPlus,
  Building,
  GraduationCap,
  ClipboardCheck,
  UserCheck,
  Settings
} from 'lucide-react';

export default function ActivationSystemPage() {
  const activationRules = [
    {
      id: 1,
      userType: 'Admin',
      icon: <Shield className="h-6 w-6 text-red-600" />,
      rule: 'Always active immediately upon account creation',
      status: 'completed',
      features: ['Full system access', 'User verification controls', 'System administration']
    },
    {
      id: 2,
      userType: 'RTO',
      icon: <Building className="h-6 w-6 text-purple-600" />,
      rule: 'Requires admin verification before accessing dashboard',
      status: 'completed',
      features: ['Admin verification system', 'Verification status pages', 'Invite students & assessors']
    },
    {
      id: 3,
      userType: 'Provider',
      icon: <Building className="h-6 w-6 text-green-600" />,
      rule: 'Requires admin verification + active MoU contracts for transactions',
      status: 'completed',
      features: ['Admin verification system', 'Contract management', 'Invite supervisors']
    },
    {
      id: 4,
      userType: 'Student',
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      rule: 'Must be registered with RTO + accept invitation to access dashboard',
      status: 'completed',
      features: ['RTO registration system', 'Invitation acceptance', 'Status tracking']
    },
    {
      id: 5,
      userType: 'Supervisor',
      icon: <UserCheck className="h-6 w-6 text-orange-600" />,
      rule: 'Must be assigned to Provider + accept invitation to access dashboard',
      status: 'completed',
      features: ['Provider assignment', 'Invitation system', 'Status management']
    },
    {
      id: 6,
      userType: 'Assessor',
      icon: <ClipboardCheck className="h-6 w-6 text-teal-600" />,
      rule: 'Must be assigned to RTO + accept invitation to access dashboard',
      status: 'completed',
      features: ['RTO assignment', 'Invitation workflow', 'Access controls']
    }
  ];

  const implementedFeatures = [
    {
      category: 'Verification System',
      icon: <Shield className="h-5 w-5" />,
      features: [
        'Admin verification interface for RTOs and Providers',
        'Verification status tracking and management',
        'Professional status pages for pending/rejected states',
        'Automated access control based on verification status'
      ]
    },
    {
      category: 'Invitation System',
      icon: <UserPlus className="h-5 w-5" />,
      features: [
        'Token-based invitation system for Students/Supervisors/Assessors',
        'Secure invitation acceptance workflow with password setup',
        'Organization linking during invitation acceptance',
        'Invitation status tracking and management'
      ]
    },
    {
      category: 'Contract Management',
      icon: <FileText className="h-5 w-5" />,
      features: [
        'MoU contract creation and management for RTO-Provider partnerships',
        'Digital signature tracking for both parties',
        'Contract status management (draft, pending, active, expired)',
        'Contract-based access control for Provider transactions'
      ]
    },
    {
      category: 'Access Control',
      icon: <Settings className="h-5 w-5" />,
      features: [
        'Layout-level access control for all user types',
        'Proper redirect logic based on verification/invitation status',
        'Professional user experience during pending states',
        'Comprehensive activation rule enforcement'
      ]
    },
    {
      category: 'User Management',
      icon: <Users className="h-5 w-5" />,
      features: [
        'RTO invitation interface for students and assessors',
        'Provider invitation interface for supervisors',
        'Invitation history and status tracking',
        'User onboarding workflow management'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PlacementGuru Activation System</h1>
        <p className="text-xl text-gray-600 mb-6">
          Complete implementation of user activation rules and access control
        </p>
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-lg px-4 py-2">
            <CheckCircle className="h-5 w-5 mr-2" />
            📋 5. Activation Rules Implemented ✅
          </Badge>
        </div>
      </div>

      {/* Activation Rules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            User Activation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activationRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {rule.icon}
                    <h3 className="text-lg font-semibold ml-3">{rule.userType}</h3>
                  </div>
                  {getStatusBadge(rule.status)}
                </div>
                <p className="text-gray-700 mb-3">{rule.rule}</p>
                <div className="flex flex-wrap gap-2">
                  {rule.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implemented Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            Implemented Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {implementedFeatures.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {category.icon}
                  <h3 className="text-lg font-semibold ml-2">{category.category}</h3>
                </div>
                <ul className="space-y-2">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-6 w-6 mr-2 text-gray-600" />
            API Endpoints & Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Verification APIs</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>/api/admin/verification</code> - Admin verification interface</li>
                <li>• <code>/api/invitations</code> - Invitation management</li>
                <li>• <code>/api/invitations/accept</code> - Invitation acceptance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contract APIs</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>/api/contracts</code> - Contract CRUD operations</li>
                <li>• <code>/api/contracts/[id]</code> - Contract details & signing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">UI Components</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Invitation management interfaces</li>
                <li>• Contract management dashboards</li>
                <li>• Status pages for all user states</li>
                <li>• Access control middleware</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Database Collections</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>users</code> - User data with verification status</li>
                <li>• <code>invitations</code> - Invitation tracking</li>
                <li>• <code>contracts</code> - MoU contract management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button variant="outline" className="justify-start">
              <Building className="h-4 w-4 mr-2" />
              RTO Portal
            </Button>
            <Button variant="outline" className="justify-start">
              <Building className="h-4 w-4 mr-2" />
              Provider Portal
            </Button>
            <Button variant="outline" className="justify-start">
              <GraduationCap className="h-4 w-4 mr-2" />
              Student Portal
            </Button>
            <Button variant="outline" className="justify-start">
              <UserCheck className="h-4 w-4 mr-2" />
              Supervisor Portal
            </Button>
            <Button variant="outline" className="justify-start">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Assessor Portal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          ✅ Activation System Complete!
        </h2>
        <p className="text-green-700 mb-4">
          All user activation rules have been successfully implemented with comprehensive access controls,
          professional user interfaces, and robust API infrastructure.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">6 User Types</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">Multi-layer Verification</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">Invitation System</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">Contract Management</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">Professional UI</Badge>
        </div>
      </div>
    </div>
  );
}