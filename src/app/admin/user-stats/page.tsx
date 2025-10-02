'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserStats {
  userCounts: {
    admin: number;
    student: number;
    rto: number;
    provider: number;
    supervisor: number;
    assessor: number;
    total: number;
  };
  rtosCount: number;
  providersCount: number;
  summary: {
    message: string;
    breakdown: string;
    requirements: string;
  };
}

export default function UserStatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user-stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data);
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading User Statistics...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || 'No data available'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { userCounts, rtosCount, providersCount, summary } = stats;
  
  // Check if current counts match requirements
  const requirements = {
    admin: 1,
    student: 1,
    rto: 8,
    provider: 8,
    supervisor: 1,
    assessor: 1
  };

  const isMatch = (current: number, required: number) => current === required;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">PlacementGuru User Statistics</h1>
        <p className="text-muted-foreground">{summary.message}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Role Counts */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>User Roles Distribution</CardTitle>
            <CardDescription>Current vs Required User Counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(requirements).map(([role, required]) => {
                const current = userCounts[role as keyof typeof userCounts];
                const matches = isMatch(current, required);
                
                return (
                  <div key={role} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {current}
                      <span className="text-sm text-muted-foreground">/{required}</span>
                    </div>
                    <div className="text-sm font-medium capitalize mb-2">{role}</div>
                    <Badge variant={matches ? "default" : "secondary"}>
                      {matches ? "✓ Match" : "⚠ Need " + (required - current)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Organization Counts */}
        <Card>
          <CardHeader>
            <CardTitle>RTOs</CardTitle>
            <CardDescription>Training Organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rtosCount}</div>
            <Badge variant={rtosCount >= 8 ? "default" : "secondary"}>
              {rtosCount >= 8 ? "✓ Sufficient" : `Need ${8 - rtosCount} more`}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Providers</CardTitle>
            <CardDescription>Industry Partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{providersCount}</div>
            <Badge variant={providersCount >= 8 ? "default" : "secondary"}>
              {providersCount >= 8 ? "✓ Sufficient" : `Need ${8 - providersCount} more`}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All Platform Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCounts.total}</div>
            <Badge variant="outline">Total Active</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Current:</strong> {summary.breakdown}</p>
            <p><strong>Required:</strong> {summary.requirements}</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Status:</strong> The database needs to be updated to match the exact requirements.
                We need to create additional RTOs and Providers to reach the target of 8 each.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}