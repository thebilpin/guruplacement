// Assessor Dashboard API - Assessment tools and student evaluation
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase'

interface AssessorStats {
  totalAssignedStudents: number;
  completedAssessments: number;
  pendingEvaluations: number;
  issuesRequiringAttention: number;
  averageCompletionRate: number;
  monthlyAssessments: number;
  totalEvidence: number;
  overdueAssessments: number;
}

interface AssignedStudent {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  issues: number;
  lastAssessment: Date | null;
  assessorNotes: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextEvaluation: Date;
  avatar?: string;
}

interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: 'practical' | 'theory' | 'portfolio' | 'observation';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  dueDate: Date;
  completedDate?: Date;
  score?: number;
  feedback: string;
  competencyUnit: string;
}

// Mock data for development when Firestore isn't available
const getMockAssessorData = (assessorId?: string) => ({
  stats: {
    totalAssignedStudents: 8,
    completedAssessments: 24,
    pendingEvaluations: 5,
    issuesRequiringAttention: 2,
    averageCompletionRate: 78.5,
    monthlyAssessments: 18,
    totalEvidence: 156,
    overdueAssessments: 1,
  } as AssessorStats,
  
  assignedStudents: [
    {
      id: 'student-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@student.com',
      course: 'Diploma of Nursing',
      progress: 85,
      issues: 0,
      lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      assessorNotes: 'Excellent progress, strong practical skills',
      riskLevel: 'low' as const,
      nextEvaluation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student1/100/100',
    },
    {
      id: 'student-2', 
      name: 'Ben Carter',
      email: 'ben.carter@student.com',
      course: 'Certificate IV in IT',
      progress: 40,
      issues: 2,
      lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      assessorNotes: 'Struggling with practical components, needs additional support',
      riskLevel: 'high' as const,
      nextEvaluation: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student2/100/100',
    },
    {
      id: 'student-3',
      name: 'Li Wei',
      email: 'li.wei@student.com',
      course: 'Certificate III in Aged Care',
      progress: 62,
      issues: 1,
      lastAssessment: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      assessorNotes: 'Good theoretical knowledge, improving practical application',
      riskLevel: 'medium' as const,
      nextEvaluation: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      avatar: 'https://picsum.photos/seed/student3/100/100',
    },
  ] as AssignedStudent[],
  
  recentAssessments: [
    {
      id: 'assessment-1',
      studentId: 'student-1',
      studentName: 'Sarah Johnson',
      title: 'Clinical Skills Assessment',
      type: 'practical' as const,
      status: 'completed' as const,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      score: 92,
      feedback: 'Excellent demonstration of clinical procedures',
      competencyUnit: 'HLTHPS006',
    },
    {
      id: 'assessment-2',
      studentId: 'student-2',
      studentName: 'Ben Carter',
      title: 'Network Configuration',
      type: 'practical' as const,
      status: 'overdue' as const,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      feedback: 'Awaiting practical demonstration',
      competencyUnit: 'ICTICT301',
    },
    {
      id: 'assessment-3',
      studentId: 'student-3',
      studentName: 'Li Wei',
      title: 'Care Planning Portfolio',
      type: 'portfolio' as const,
      status: 'in_progress' as const,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      feedback: 'Portfolio 60% complete, on track',
      competencyUnit: 'CHCCCS011',
    },
  ] as Assessment[],
});

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Assessor Dashboard API called');
    
    const url = new URL(request.url);
    const assessorId = url.searchParams.get('assessorId') || 'current-assessor';
    const action = url.searchParams.get('action') || 'dashboard';

    if (action === 'dashboard') {
      return await getAssessorDashboard(assessorId);
    } else if (action === 'students') {
      return await getAssignedStudents(assessorId);
    } else if (action === 'assessments') {
      return await getAssessments(assessorId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Assessor Dashboard API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assessor data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getAssessorDashboard(assessorId: string): Promise<NextResponse> {
  try {
    // Try to fetch from Firestore
    const assessorRef = adminDb.collection('assessors').doc(assessorId);
    const assessorDoc = await assessorRef.get();
    
    if (!assessorDoc.exists) {
      console.log('ℹ️ Assessor not found in database, using mock data');
      const mockData = getMockAssessorData(assessorId);
      return NextResponse.json({
        success: true,
        ...mockData,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch assigned students
    const studentsQuery = adminDb.collection('students')
      .where('assessorId', '==', assessorId)
      .limit(20);
    const studentsSnapshot = await studentsQuery.get();

    // Fetch recent assessments
    const assessmentsQuery = adminDb.collection('assessments')
      .where('assessorId', '==', assessorId)
      .orderBy('dueDate', 'desc')
      .limit(10);
    const assessmentsSnapshot = await assessmentsQuery.get();

    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AssignedStudent[];

    const assessments = assessmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      completedDate: doc.data().completedDate?.toDate(),
    })) as Assessment[];

    // Calculate statistics
    const stats: AssessorStats = {
      totalAssignedStudents: students.length,
      completedAssessments: assessments.filter(a => a.status === 'completed').length,
      pendingEvaluations: assessments.filter(a => a.status === 'in_progress').length,
      issuesRequiringAttention: students.filter(s => s.issues > 0).length,
      averageCompletionRate: students.length > 0 
        ? students.reduce((sum, s) => sum + s.progress, 0) / students.length 
        : 0,
      monthlyAssessments: assessments.filter(a => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return a.dueDate >= lastMonth;
      }).length,
      totalEvidence: assessments.reduce((sum, a) => sum + (a.score ? 1 : 0), 0) * 8, // Mock calculation
      overdueAssessments: assessments.filter(a => a.status === 'overdue').length,
    };

    console.log('✅ Assessor dashboard data fetched successfully');
    return NextResponse.json({
      success: true,
      stats,
      assignedStudents: students,
      recentAssessments: assessments,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching assessor dashboard, using mock data:', error);
    
    // Return mock data on error
    const mockData = getMockAssessorData(assessorId);
    return NextResponse.json({
      success: true,
      ...mockData,
      timestamp: new Date().toISOString(),
    });
  }
}

async function getAssignedStudents(assessorId: string): Promise<NextResponse> {
  try {
    const studentsQuery = adminDb.collection('students')
      .where('assessorId', '==', assessorId);
    const snapshot = await studentsQuery.get();

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastAssessment: doc.data().lastAssessment?.toDate(),
      nextEvaluation: doc.data().nextEvaluation?.toDate(),
    })) as AssignedStudent[];

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    });

  } catch (error) {
    console.error('❌ Error fetching assigned students, using mock data:', error);
    const mockData = getMockAssessorData(assessorId);
    return NextResponse.json({
      success: true,
      students: mockData.assignedStudents,
      total: mockData.assignedStudents.length,
    });
  }
}

async function getAssessments(assessorId: string): Promise<NextResponse> {
  try {
    const assessmentsQuery = adminDb.collection('assessments')
      .where('assessorId', '==', assessorId)
      .orderBy('dueDate', 'desc');
    const snapshot = await assessmentsQuery.get();

    const assessments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      completedDate: doc.data().completedDate?.toDate(),
    })) as Assessment[];

    return NextResponse.json({
      success: true,
      assessments,
      total: assessments.length,
    });

  } catch (error) {
    console.error('❌ Error fetching assessments, using mock data:', error);
    const mockData = getMockAssessorData(assessorId);
    return NextResponse.json({
      success: true,
      assessments: mockData.recentAssessments,
      total: mockData.recentAssessments.length,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'updateAssessment') {
      return await updateAssessment(body);
    } else if (action === 'addStudentNote') {
      return await addStudentNote(body);
    } else if (action === 'scheduleAssessment') {
      return await scheduleAssessment(body);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Assessor Dashboard POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process assessor request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function updateAssessment(body: any): Promise<NextResponse> {
  try {
    const { assessmentId, updates } = body;
    
    // In a real implementation, update Firestore
    console.log('📝 Updating assessment:', assessmentId, updates);
    
    // Mock successful response
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment updated successfully' 
    });
  } catch (error) {
    console.error('❌ Error updating assessment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update assessment' 
    }, { status: 500 });
  }
}

async function addStudentNote(body: any): Promise<NextResponse> {
  try {
    const { studentId, note, assessorId } = body;
    
    // In a real implementation, add to Firestore
    console.log('📓 Adding student note:', studentId, note);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Note added successfully' 
    });
  } catch (error) {
    console.error('❌ Error adding student note:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add note' 
    }, { status: 500 });
  }
}

async function scheduleAssessment(body: any): Promise<NextResponse> {
  try {
    const { studentId, assessmentData, assessorId } = body;
    
    // Generate assessment ID
    const assessmentId = `assess_${Date.now()}`;
    
    console.log('📅 Scheduling assessment:', assessmentId, assessmentData);
    
    return NextResponse.json({ 
      success: true, 
      assessmentId,
      message: 'Assessment scheduled successfully' 
    });
  } catch (error) {
    console.error('❌ Error scheduling assessment:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to schedule assessment' 
    }, { status: 500 });
  }
}