'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building2 } from 'lucide-react';

export default function StudentNoRTOPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-orange-100">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">No RTO Assignment</CardTitle>
            <p className="text-gray-600">
              Your student account is not linked to any RTO. You need to be registered by an RTO to access your dashboard.
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">RTO Registration Required</span>
                </div>
                <p className="text-sm text-orange-700">
                  Students can only access the platform when registered by a verified RTO.
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">To resolve this issue:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Contact the RTO where you're enrolled</li>
                  <li>Ask them to register you on PlacementGuru</li>
                  <li>Ensure they use the correct email address</li>
                </ul>
              </div>
              
              <div className="pt-4 space-x-3">
                <Button variant="outline" onClick={() => window.location.href = '/support'}>
                  Contact Support
                </Button>
                <Button onClick={() => window.location.href = '/login'}>
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}