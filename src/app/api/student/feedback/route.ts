import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

// Types
interface FeedbackItem {
  id: string;
  studentId: string;
  courseId?: string;
  placementId?: string;
  providerId?: string;
  supervisorId?: string;
  type: 'course' | 'placement' | 'supervisor' | 'peer' | 'self';
  category: 'technical' | 'communication' | 'teamwork' | 'professionalism' | 'overall';
  rating: number; // 1-5
  comment: string;
  status: 'draft' | 'submitted' | 'reviewed';
  isAnonymous: boolean;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerResponse?: string;
  tags: string[];
  metadata?: Record<string, any>;
}

interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  categoryBreakdown: Record<string, { rating: number; count: number }>;
  recentFeedback: FeedbackItem[];
  performanceData: Array<{ month: string; rating: number }>;
  skillData: Array<{ subject: string; score: number; fullMark: number }>;
}

// GET - Fetch student feedback data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type'); // 'course', 'placement', etc.
    const status = searchParams.get('status');
    
    console.log('📋 Fetching feedback data for student:', studentId);

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Fetch student data
    const studentDoc = await collections.students().doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Build query for feedback
    let feedbackQuery = collections.feedback()
      .where('studentId', '==', studentId)
      .orderBy('submittedAt', 'desc');

    if (type) {
      feedbackQuery = collections.feedback()
        .where('studentId', '==', studentId)
        .where('type', '==', type)
        .orderBy('submittedAt', 'desc');
    }

    if (status) {
      feedbackQuery = collections.feedback()
        .where('studentId', '==', studentId)
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc');
    }

    const feedbackSnapshot = await feedbackQuery.get();
    const allFeedback: FeedbackItem[] = feedbackSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeedbackItem));

    // Calculate statistics
    const totalFeedback = allFeedback.length;
    const submittedFeedback = allFeedback.filter(f => f.status === 'submitted');
    const averageRating = submittedFeedback.length > 0 
      ? submittedFeedback.reduce((sum, f) => sum + f.rating, 0) / submittedFeedback.length 
      : 0;

    // Rating distribution
    const ratingDistribution = submittedFeedback.reduce((acc, f) => {
      const rating = Math.floor(f.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category breakdown
    const categoryBreakdown = submittedFeedback.reduce((acc, f) => {
      if (!acc[f.category]) {
        acc[f.category] = { rating: 0, count: 0 };
      }
      acc[f.category].rating += f.rating;
      acc[f.category].count += 1;
      return acc;
    }, {} as Record<string, { rating: number; count: number }>);

    // Calculate average for each category
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].rating = 
        categoryBreakdown[category].rating / categoryBreakdown[category].count;
    });

    // Performance data (last 6 months)
    const performanceData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthFeedback = submittedFeedback.filter(f => {
        const feedbackDate = new Date(f.submittedAt);
        return feedbackDate >= monthStart && feedbackDate <= monthEnd;
      });

      const monthRating = monthFeedback.length > 0
        ? monthFeedback.reduce((sum, f) => sum + f.rating, 0) / monthFeedback.length
        : 0;

      performanceData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        rating: Math.round(monthRating * 10) / 10
      });
    }

    // Skill data based on category breakdown
    const skillData = [
      { subject: 'Technical', score: Math.round((categoryBreakdown.technical?.rating || 0) * 20), fullMark: 100 },
      { subject: 'Communication', score: Math.round((categoryBreakdown.communication?.rating || 0) * 20), fullMark: 100 },
      { subject: 'Teamwork', score: Math.round((categoryBreakdown.teamwork?.rating || 0) * 20), fullMark: 100 },
      { subject: 'Professionalism', score: Math.round((categoryBreakdown.professionalism?.rating || 0) * 20), fullMark: 100 },
      { subject: 'Overall', score: Math.round((categoryBreakdown.overall?.rating || averageRating) * 20), fullMark: 100 }
    ];

    // Recent feedback (last 5)
    const recentFeedback = submittedFeedback.slice(0, 5);

    // Fetch feedback providers (supervisors, peers, etc.)
    const enrichedFeedback = await Promise.all(
      recentFeedback.map(async (feedback) => {
        let authorName = 'Anonymous';
        let authorRole = 'Unknown';
        let avatar = '';

        if (!feedback.isAnonymous && feedback.reviewerId) {
          try {
            // Try to fetch from different collections based on type
            let authorDoc;
            if (feedback.type === 'supervisor') {
              // For now, use students collection until supervisors collection is defined
              authorDoc = await collections.students().doc(feedback.reviewerId).get();
              authorRole = 'Supervisor';
            } else if (feedback.type === 'peer') {
              authorDoc = await collections.students().doc(feedback.reviewerId).get();
              authorRole = 'Peer';
            } else if (feedback.type === 'course') {
              // For now, use students collection until instructors collection is defined
              authorDoc = await collections.students().doc(feedback.reviewerId).get();
              authorRole = 'Instructor';
            }

            if (authorDoc?.exists) {
              const authorData = authorDoc.data();
              if (authorData) {
                authorName = authorData.name || (authorData.firstName + ' ' + (authorData.lastName || '')) || 'Unknown';
                avatar = authorData.profileImageUrl || authorData.avatar || '';
              }
            }
          } catch (error) {
            console.warn('Could not fetch author data:', error);
          }
        }

        return {
          ...feedback,
          authorName,
          authorRole,
          avatar,
          date: new Date(feedback.submittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
      })
    );

    const summary: FeedbackSummary = {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      categoryBreakdown,
      recentFeedback: enrichedFeedback,
      performanceData,
      skillData
    };

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        student: {
          id: studentData?.id || studentId,
          name: studentData?.name || ((studentData?.firstName || '') + ' ' + (studentData?.lastName || '')) || 'Unknown',
          course: studentData?.course || studentData?.courseTitle || 'Unknown Course',
          email: studentData?.email || ''
        },
        filters: {
          type: type || 'all',
          status: status || 'all'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feedback data'
    }, { status: 500 });
  }
}

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      type,
      category,
      rating,
      comment,
      courseId,
      placementId,
      providerId,
      supervisorId,
      isAnonymous = false,
      tags = []
    } = body;

    console.log('📝 Submitting new feedback:', { studentId, type, category, rating });

    // Validation
    if (!studentId || !type || !category || !rating || !comment) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 });
    }

    // Create feedback item
    const feedbackData: Omit<FeedbackItem, 'id'> = {
      studentId,
      type,
      category,
      rating,
      comment,
      courseId,
      placementId,
      providerId,
      supervisorId,
      status: 'submitted',
      isAnonymous,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: Date.now()
      }
    };

    // Save to Firestore
    const docRef = await collections.feedback().add(feedbackData);

    console.log('✅ Feedback submitted successfully:', docRef.id);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        message: 'Feedback submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit feedback'
    }, { status: 500 });
  }
}

// PUT - Update feedback (draft status)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, studentId, ...updateData } = body;

    console.log('📝 Updating feedback:', feedbackId);

    if (!feedbackId || !studentId) {
      return NextResponse.json({
        success: false,
        error: 'Feedback ID and Student ID are required'
      }, { status: 400 });
    }

    // Verify ownership
    const feedbackDoc = await collections.feedback().doc(feedbackId).get();
    if (!feedbackDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 });
    }

    const feedbackData = feedbackDoc.data();
    if (feedbackData?.studentId !== studentId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to update this feedback'
      }, { status: 403 });
    }

    // Update feedback
    await collections.feedback().doc(feedbackId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Feedback updated successfully');

    return NextResponse.json({
      success: true,
      data: {
        message: 'Feedback updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update feedback'
    }, { status: 500 });
  }
}