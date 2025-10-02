
'use client';

import { useEffect, useState } from 'react';
import {
    CircleDot,
    ListTodo,
    PieChart,
    Sparkles,
    Building,
    CheckCircle,
    Clock,
    UserCheck,
    Shield,
  } from 'lucide-react';
  
import { QuickActions } from './components/quick-actions';
import { PlacementJourney } from './components/placement-journey';
import { AlertsPanel } from './components/alerts-panel';
import { WeeklyProgressChart } from './components/weekly-progress-chart';
import { AiInsightsBox } from './components/ai-insights-box';
import { CurrentPlacement } from './components/current-placement';
import { NotificationsFeed } from './components/notifications-feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface StudentStats {
  hoursLogged: number;
  totalHoursRequired: number;
  pendingTasks: number;
  overdueTasks: number;
  currentStage: string;
  rtoName: string;
  invitationStatus: string;
  accountStatus: string;
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats>({
    hoursLogged: 0,
    totalHoursRequired: 480,
    pendingTasks: 0,
    overdueTasks: 0,
    currentStage: 'Enrolled',
    rtoName: 'Unknown RTO',
    invitationStatus: 'Pending',
    accountStatus: 'Pending'
  });
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get Student ID from user context or auth (for now using mock data)
        const studentId = 'student-001'; // In real app, get from auth context
        const response = await fetch(`/api/student/dashboard?studentId=${studentId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              hoursLogged: data.stats.hoursLogged,
              totalHoursRequired: data.stats.totalHoursRequired,
              pendingTasks: data.stats.pendingTasks,
              overdueTasks: data.stats.overdueTasks,
              currentStage: data.stats.currentStage,
              rtoName: data.rto.name,
              invitationStatus: data.rto.status === 'active' ? 'Accepted & Active' : 'Pending',
              accountStatus: data.student.status === 'enrolled' ? 'Fully Activated' : 'Pending Activation'
            });
            setStudentName(data.studentName || 'Student');
          } else {
            console.error('API returned error:', data.error);
            // Set fallback data
            setFallbackData();
          }
        } else {
          console.error('Failed to fetch Student data:', response.status);
          setFallbackData();
        }
      } catch (error) {
        console.error('Error fetching Student data:', error);
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const setFallbackData = () => {
      setStats({
        hoursLogged: 320,
        totalHoursRequired: 480,
        pendingTasks: 3,
        overdueTasks: 1,
        currentStage: 'Active',
        rtoName: 'Tech Skills Australia',
        invitationStatus: 'Accepted & Active',
        accountStatus: 'Fully Activated'
      });
      setStudentName('Sarah');
    };

    fetchStudentData();
  }, []);
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="mb-8 flex items-center gap-4">
             <Image
                src="https://picsum.photos/seed/student/100/100"
                alt="Profile"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
              />
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                Welcome back, {loading ? 'Student' : studentName}! 👋
                </h1>
                <p className="text-slate-600 mt-1">You've logged hours 5 days in a row. Keep up the great work!</p>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover bg-blue-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Hours Logged</CardTitle>
                        <PieChart className="w-6 h-6 text-blue-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">
                      {loading ? "..." : `${stats.hoursLogged}/${stats.totalHoursRequired}`}
                    </p>
                    <p className="text-sm text-blue-700">
                      {loading ? "..." : `${Math.round((stats.hoursLogged / stats.totalHoursRequired) * 100)}% complete`}
                    </p>
                </CardContent>
            </Card>
             <Card className="card-hover bg-yellow-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Pending Tasks</CardTitle>
                        <ListTodo className="w-6 h-6 text-yellow-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">
                      {loading ? "..." : stats.pendingTasks}
                    </p>
                    <p className="text-sm text-yellow-700">
                      {loading ? "..." : `${stats.overdueTasks} overdue`}
                    </p>
                </CardContent>
            </Card>
             <Card className="card-hover bg-green-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Current Stage</CardTitle>
                        <CircleDot className="w-6 h-6 text-green-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">
                      {loading ? "..." : stats.currentStage}
                    </p>
                    <p className="text-sm text-green-700">Placement</p>
                </CardContent>
            </Card>
            <Card className="card-hover bg-fuchsia-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
                        <Sparkles className="w-6 h-6 text-fuchsia-500"/>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Ready</p>
                    <p className="text-sm text-fuchsia-700">Get career advice</p>
                </CardContent>
            </Card>
        </div>

        {/* RTO Registration & Invitation Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <CardTitle>RTO Registration Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Registered RTO</p>
                  <p className="text-sm text-gray-600">
                    {loading ? "..." : stats.rtoName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Invitation Status</p>
                  <p className="text-sm text-green-600">
                    {loading ? "..." : stats.invitationStatus}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-purple-600">
                    {loading ? "..." : stats.accountStatus}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">Your account is fully activated!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You have successfully accepted your RTO invitation and can access all student features.
              </p>
            </div>
          </CardContent>
        </Card>

        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <PlacementJourney />
                <WeeklyProgressChart />
            </div>
            <div className="space-y-6">
                <AlertsPanel />
                <AiInsightsBox />
            </div>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CurrentPlacement />
            <NotificationsFeed />
        </div>
    </div>
  );
}
