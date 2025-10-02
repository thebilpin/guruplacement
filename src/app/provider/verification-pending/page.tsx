'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, XCircle, Pause } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface VerificationStatus {
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';
  notes?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export default function ProviderVerificationPendingPage() {
  const { userData } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setVerificationStatus({
        status: (userData as any).verificationStatus || 'pending',
        notes: (userData as any).verificationNotes,
        verifiedAt: (userData as any).verifiedAt,
        verifiedBy: (userData as any).verifiedBy,
      });
      setLoading(false);
    }
  }, [userData]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800',
          title: 'Verification Pending',
          description: 'Your Provider registration is awaiting admin review.',
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          color: 'bg-blue-100 text-blue-800',
          title: 'Under Review',
          description: 'An administrator is currently reviewing your Provider registration.',
        };
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'bg-green-100 text-green-800',
          title: 'Verified',
          description: 'Your Provider has been verified! You can now access your dashboard.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800',
          title: 'Verification Rejected',
          description: 'Your Provider registration was rejected. Please review the feedback below.',
        };
      case 'suspended':
        return {
          icon: Pause,
          color: 'bg-gray-100 text-gray-800',
          title: 'Account Suspended',
          description: 'Your Provider account has been temporarily suspended.',
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800',
          title: 'Unknown Status',
          description: 'Unable to determine verification status.',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (!verificationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Status</h2>
            <p className="text-gray-600 mb-4">
              We couldn't retrieve your verification status. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = getStatusConfig(verificationStatus.status);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${config.color.replace('text-', 'bg-').replace('-800', '-200')}`}>
                <StatusIcon className={`h-8 w-8 ${config.color.split(' ')[1]}`} />
              </div>
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <p className="text-gray-600">{config.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <Badge className={config.color}>
                {verificationStatus.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {verificationStatus.notes && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-2">Admin Notes:</h4>
                <p className="text-gray-700">{verificationStatus.notes}</p>
              </div>
            )}

            {verificationStatus.status === 'verified' && (
              <div className="text-center">
                <Button onClick={() => window.location.href = '/provider/dashboard'} size="lg">
                  Access Dashboard
                </Button>
              </div>
            )}

            {verificationStatus.status === 'rejected' && (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Please address the issues mentioned above and contact support for re-evaluation.
                </p>
                <div className="space-x-3">
                  <Button variant="outline" onClick={() => window.location.href = '/support'}>
                    Contact Support
                  </Button>
                  <Button onClick={() => window.location.href = '/provider/update-registration'}>
                    Update Registration
                  </Button>
                </div>
              </div>
            )}

            {(verificationStatus.status === 'pending' || verificationStatus.status === 'under_review') && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We'll notify you via email once the verification process is complete.
                  This typically takes 1-2 business days.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Admin Review</h4>
                  <p className="text-sm text-gray-600">
                    Our team reviews your Provider registration and business documentation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Verification Decision</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive an email notification with the verification result.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Dashboard Access</h4>
                  <p className="text-sm text-gray-600">
                    Once verified, you can access your Provider dashboard and start creating placement opportunities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about the verification process, our support team is here to help.
              </p>
              <div className="space-x-3">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/support'}>
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/help/verification'}>
                  Verification FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}