'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, GraduationCap } from 'lucide-react';

export default function StudentInvitationPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Student Access Pending</CardTitle>
            <p className="text-gray-600">
              You need to be registered by an RTO and accept an invitation to access your student dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Waiting for RTO Registration</span>
                </div>
                <p className="text-sm text-blue-700">
                  An RTO administrator needs to register you as a student and send you an invitation.
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">If you believe you should have access:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Contact your RTO administrator</li>
                  <li>Check your email for invitation links</li>
                  <li>Ensure you're registered with the correct email address</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" onClick={() => window.location.href = '/support'}>
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}