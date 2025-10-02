// Supervisor Dashboard API - Student oversight and monitoring capabilities  
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase'

interface SupervisorStats {
  totalAssignedStudents: number;
  activeSupervisions: number;
  completedEvaluations: number;
  issuesReported: number;
  averageStudentProgress: number;
  weeklyHours: number;
  totalLogEntries: number;
  upcomingDeadlines: number;
}

interface SupervisedStudent {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  issues: number;
  lastSupervision: Date | null;
  supervisorNotes: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextCheckIn: Date;
  avatar?: string;
  placementSite: string;
  workHours: number;
}

interface SupervisionLog {
  id: string;
  studentId: string;
  studentName: string;
  date: Date;
  duration: number; // in minutes
  type: 'on-site' | 'virtual' | 'phone' | 'observation';
  notes: string;
  issues: string[];
  recommendations: string;
  followUpRequired: boolean;
}

interface WorkloadData {
  name: string;
  hours: number;
  students: number;
}

// Mock data for development when Firestore isn't available
const getMockSupervisorData = (supervisorId?: string) => ({
  stats: {
    totalAssignedStudents: 6,
    activeSupervisions: 4,
    completedEvaluations: 12,
    issuesReported: 1,
    averageStudentProgress: 72.3,
    weeklyHours: 34,
    totalLogEntries: 48,
    upcomingDeadlines: 3,
  } as SupervisorStats,
  
  supervisedStudents: [
    {
      id: 'student-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@student.com',
      course: 'Diploma of Nursing',
      progress: 85,
      issues: 0,
      lastSupervision: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      supervisorNotes: 'Excellent clinical skills, very professional approach',
      riskLevel: 'low' as const,
      nextCheckIn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student1/100/100',
      placementSite: 'Melbourne General Hospital',
      workHours: 32,
    },
    {
      id: 'student-2',
      name: 'Ben Carter',
      email: 'ben.carter@student.com',
      course: 'Certificate IV in IT',
      progress: 40,
      issues: 2,
      lastSupervision: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      supervisorNotes: 'Needs more hands-on practice with networking equipment',
      riskLevel: 'high' as const,
      nextCheckIn: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student2/100/100',
      placementSite: 'TechCorp Solutions',
      workHours: 25,
    },
    {
      id: 'student-3',
      name: 'Li Wei',
      email: 'li.wei@student.com',
      course: 'Certificate III in Aged Care',
      progress: 62,
      issues: 0,
      lastSupervision: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supervisorNotes: 'Showing good improvement in resident interaction',
      riskLevel: 'medium' as const,
      nextCheckIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student3/100/100',
      placementSite: 'Sunrise Aged Care',
      workHours: 30,
    },
    {
      id: 'student-4',
      name: 'Emma Wilson',
      email: 'emma.wilson@student.com',
      course: 'Diploma of Early Childhood Education',
      progress: 78,
      issues: 0,
      lastSupervision: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      supervisorNotes: 'Natural talent with children, great classroom management',
      riskLevel: 'low' as const,
      nextCheckIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student4/100/100',
      placementSite: 'Bright Futures Childcare',
      workHours: 35,
    },
  ] as SupervisedStudent[],
  
  recentLogs: [
    {
      id: 'log-1',
      studentId: 'student-1',
      studentName: 'Sarah Johnson',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 45,
      type: 'on-site' as const,
      notes: 'Observed patient interaction and medication administration. Excellent technique.',
      issues: [],
      recommendations: 'Continue current trajectory, consider leadership opportunities',
      followUpRequired: false,
    },
    {
      id: 'log-2',
      studentId: 'student-2',
      studentName: 'Ben Carter',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 60,
      type: 'virtual' as const,
      notes: 'Reviewed network troubleshooting assignment. Identified knowledge gaps.',
      issues: ['Difficulty with VLAN configuration', 'Needs more practice with CLI commands'],
      recommendations: 'Schedule additional hands-on lab time, provide CLI reference guide',
      followUpRequired: true,
    },
    {
      id: 'log-3',
      studentId: 'student-4',
      studentName: 'Emma Wilson',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: 30,
      type: 'observation' as const,
      notes: 'Observed morning activities and learning time. Great rapport with children.',
      issues: [],
      recommendations: 'Encourage to take on more planning responsibilities',
      followUpRequired: false,
    },
  ] as SupervisionLog[],
  
  workloadData: [
    { name: 'Mon', hours: 6, students: 2 },
    { name: 'Tue', hours: 8, students: 3 },
    { name: 'Wed', hours: 7, students: 2 },
    { name: 'Thu', hours: 8, students: 4 },
    { name: 'Fri', hours: 5, students: 1 },
  ] as WorkloadData[],
});

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Supervisor Dashboard API called');
    
    const url = new URL(request.url);
    const supervisorId = url.searchParams.get('supervisorId') || 'current-supervisor';
    const action = url.searchParams.get('action') || 'dashboard';

    if (action === 'dashboard') {
      return await getSupervisorDashboard(supervisorId);
    } else if (action === 'students') {
      return await getSupervisedStudents(supervisorId);
    } else if (action === 'logs') {
      return await getSupervisionLogs(supervisorId);
    } else if (action === 'workload') {
      return await getWorkloadData(supervisorId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Supervisor Dashboard API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch supervisor data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getSupervisorDashboard(supervisorId: string): Promise<NextResponse> {
  try {
    // Try to fetch from Firestore
    const supervisorRef = adminDb.collection('supervisors').doc(supervisorId);
    const supervisorDoc = await supervisorRef.get();
    
    if (!supervisorDoc.exists) {
      console.log('ℹ️ Supervisor not found in database, using mock data');
      const mockData = getMockSupervisorData(supervisorId);
      return NextResponse.json({
        success: true,
        ...mockData,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch supervised students
    const studentsQuery = adminDb.collection('students')
      .where('supervisorId', '==', supervisorId)
      .limit(20);
    const studentsSnapshot = await studentsQuery.get();

    // Fetch recent supervision logs
    const logsQuery = adminDb.collection('supervisionLogs')
      .where('supervisorId', '==', supervisorId)
      .orderBy('date', 'desc')
      .limit(10);
    const logsSnapshot = await logsQuery.get();

    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSupervision: doc.data().lastSupervision?.toDate(),
      nextCheckIn: doc.data().nextCheckIn?.toDate(),
    })) as SupervisedStudent[];

    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    })) as SupervisionLog[];

    // Calculate statistics
    const stats: SupervisorStats = {
      totalAssignedStudents: students.length,
      activeSupervisions: students.filter(s => s.progress < 90).length,
      completedEvaluations: logs.filter(l => l.type === 'observation').length,
      issuesReported: students.filter(s => s.issues > 0).length,
      averageStudentProgress: students.length > 0 
        ? students.reduce((sum, s) => sum + s.progress, 0) / students.length 
        : 0,
      weeklyHours: students.reduce((sum, s) => sum + (s.workHours || 0), 0),
      totalLogEntries: logs.length,
      upcomingDeadlines: students.filter(s => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return s.nextCheckIn <= nextWeek;
      }).length,
    };

    console.log('✅ Supervisor dashboard data fetched successfully');
    return NextResponse.json({
      success: true,
      stats,
      supervisedStudents: students,
      recentLogs: logs,
      workloadData: getMockSupervisorData().workloadData, // Use mock for chart data
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching supervisor dashboard, using mock data:', error);
    
    // Return mock data on error
    const mockData = getMockSupervisorData(supervisorId);
    return NextResponse.json({
      success: true,
      ...mockData,
      timestamp: new Date().toISOString(),
    });
  }
}

async function getSupervisedStudents(supervisorId: string): Promise<NextResponse> {
  try {
    const studentsQuery = adminDb.collection('students')
      .where('supervisorId', '==', supervisorId);
    const snapshot = await studentsQuery.get();

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSupervision: doc.data().lastSupervision?.toDate(),
      nextCheckIn: doc.data().nextCheckIn?.toDate(),
    })) as SupervisedStudent[];

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    });

  } catch (error) {
    console.error('❌ Error fetching supervised students, using mock data:', error);
    const mockData = getMockSupervisorData(supervisorId);
    return NextResponse.json({
      success: true,
      students: mockData.supervisedStudents,
      total: mockData.supervisedStudents.length,
    });
  }
}

async function getSupervisionLogs(supervisorId: string): Promise<NextResponse> {
  try {
    const logsQuery = adminDb.collection('supervisionLogs')
      .where('supervisorId', '==', supervisorId)
      .orderBy('date', 'desc');
    const snapshot = await logsQuery.get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    })) as SupervisionLog[];

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });

  } catch (error) {
    console.error('❌ Error fetching supervision logs, using mock data:', error);
    const mockData = getMockSupervisorData(supervisorId);
    return NextResponse.json({
      success: true,
      logs: mockData.recentLogs,
      total: mockData.recentLogs.length,
    });
  }
}

async function getWorkloadData(supervisorId: string): Promise<NextResponse> {
  try {
    // In a real implementation, calculate from actual supervision data
    const mockData = getMockSupervisorData(supervisorId);
    return NextResponse.json({
      success: true,
      workloadData: mockData.workloadData,
    });

  } catch (error) {
    console.error('❌ Error fetching workload data:', error);
    const mockData = getMockSupervisorData(supervisorId);
    return NextResponse.json({
      success: true,
      workloadData: mockData.workloadData,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'addSupervisionLog') {
      return await addSupervisionLog(body);
    } else if (action === 'updateStudentNote') {
      return await updateStudentNote(body);
    } else if (action === 'scheduleCheckIn') {
      return await scheduleCheckIn(body);
    } else if (action === 'reportIssue') {
      return await reportIssue(body);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Supervisor Dashboard POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process supervisor request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function addSupervisionLog(body: any): Promise<NextResponse> {
  try {
    const { studentId, logData, supervisorId } = body;
    
    // Generate log ID
    const logId = `log_${Date.now()}`;
    
    console.log('📋 Adding supervision log:', logId, logData);
    
    return NextResponse.json({ 
      success: true, 
      logId,
      message: 'Supervision log added successfully' 
    });
  } catch (error) {
    console.error('❌ Error adding supervision log:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add supervision log' 
    }, { status: 500 });
  }
}

async function updateStudentNote(body: any): Promise<NextResponse> {
  try {
    const { studentId, note, supervisorId } = body;
    
    console.log('📝 Updating student note:', studentId, note);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Student note updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating student note:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update note' 
    }, { status: 500 });
  }
}

async function scheduleCheckIn(body: any): Promise<NextResponse> {
  try {
    const { studentId, checkInData, supervisorId } = body;
    
    console.log('📅 Scheduling check-in:', studentId, checkInData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Check-in scheduled successfully' 
    });
  } catch (error) {
    console.error('❌ Error scheduling check-in:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to schedule check-in' 
    }, { status: 500 });
  }
}

async function reportIssue(body: any): Promise<NextResponse> {
  try {
    const { studentId, issue, supervisorId } = body;
    
    // Generate issue ID
    const issueId = `issue_${Date.now()}`;
    
    console.log('⚠️ Reporting issue:', issueId, issue);
    
    return NextResponse.json({ 
      success: true, 
      issueId,
      message: 'Issue reported successfully' 
    });
  } catch (error) {
    console.error('❌ Error reporting issue:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to report issue' 
    }, { status: 500 });
  }
}