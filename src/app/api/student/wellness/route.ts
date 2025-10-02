import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

// Types
interface MoodEntry {
  id: string;
  studentId: string;
  mood: number; // 1-5 scale (1=tough, 2=stressed, 3=okay, 4=good, 5=great)
  note?: string;
  date: string;
  timestamp: string;
  factors?: string[]; // stress factors or positive factors
}

interface WellnessResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'audio' | 'exercise' | 'contact';
  category: 'stress' | 'mental-health' | 'work-life-balance' | 'mindfulness' | 'support';
  description: string;
  url?: string;
  content?: string;
  duration?: string; // e.g., "5 min read", "10 min audio"
  isEmergency?: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
    hours?: string;
  };
}

interface WellnessGoal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: 'exercise' | 'sleep' | 'stress' | 'social' | 'study';
  target: number;
  current: number;
  unit: string; // e.g., "hours", "times per week", "minutes"
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  targetDate?: string;
}

interface WellnessData {
  student: {
    id: string;
    name: string;
    course: string;
  };
  currentMood?: MoodEntry;
  moodHistory: MoodEntry[];
  moodStats: {
    weeklyAverage: number;
    monthlyAverage: number;
    trending: 'up' | 'down' | 'stable';
  };
  resources: WellnessResource[];
  goals: WellnessGoal[];
  upcomingAppointments: Array<{
    id: string;
    type: 'counseling' | 'mentorship' | 'check-in';
    date: string;
    time: string;
    provider: string;
    status: 'scheduled' | 'confirmed';
  }>;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    available: string;
    type: 'crisis' | 'counseling' | 'medical';
  }>;
}

// GET - Fetch wellness data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    
    console.log('🌱 Fetching wellness data for student:', studentId);

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

    // Calculate date range
    const now = new Date();
    const daysBack = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Fetch mood entries
    const moodQuery = collections.wellness()
      .where('studentId', '==', studentId)
      .where('type', '==', 'mood')
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .orderBy('timestamp', 'desc');

    const moodSnapshot = await moodQuery.get();
    const moodHistory: MoodEntry[] = moodSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MoodEntry));

    // Get current mood (today's entry if exists)
    const today = new Date().toISOString().split('T')[0];
    const currentMood = moodHistory.find(entry => entry.date === today);

    // Calculate mood statistics
    const validMoods = moodHistory.filter(entry => entry.mood > 0);
    const weeklyMoods = validMoods.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    });

    const monthlyMoods = validMoods.filter(entry => {
      const entryDate = new Date(entry.date);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= monthAgo;
    });

    const weeklyAverage = weeklyMoods.length > 0 
      ? weeklyMoods.reduce((sum, entry) => sum + entry.mood, 0) / weeklyMoods.length 
      : 0;

    const monthlyAverage = monthlyMoods.length > 0 
      ? monthlyMoods.reduce((sum, entry) => sum + entry.mood, 0) / monthlyMoods.length 
      : 0;

    // Determine trend (compare last week to previous week)
    const lastWeekMoods = weeklyMoods.slice(0, Math.floor(weeklyMoods.length / 2));
    const prevWeekMoods = weeklyMoods.slice(Math.floor(weeklyMoods.length / 2));
    
    let trending: 'up' | 'down' | 'stable' = 'stable';
    if (lastWeekMoods.length > 0 && prevWeekMoods.length > 0) {
      const lastWeekAvg = lastWeekMoods.reduce((sum, entry) => sum + entry.mood, 0) / lastWeekMoods.length;
      const prevWeekAvg = prevWeekMoods.reduce((sum, entry) => sum + entry.mood, 0) / prevWeekMoods.length;
      
      if (lastWeekAvg > prevWeekAvg + 0.2) trending = 'up';
      else if (lastWeekAvg < prevWeekAvg - 0.2) trending = 'down';
    }

    // Fetch wellness goals
    const goalsQuery = collections.wellnessGoals()
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc');

    const goalsSnapshot = await goalsQuery.get();
    const goals: WellnessGoal[] = goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WellnessGoal));

    // Static wellness resources (in production, these could be from a database)
    const resources: WellnessResource[] = [
      {
        id: '1',
        title: 'Managing Placement Stress',
        type: 'article',
        category: 'stress',
        description: 'Practical strategies for handling workplace pressure during your placement.',
        duration: '5 min read',
        content: 'Learn effective techniques to manage stress and maintain well-being during your placement experience.'
      },
      {
        id: '2',
        title: '5-Minute Mindfulness Meditation',
        type: 'audio',
        category: 'mindfulness',
        description: 'Quick guided meditation to center yourself and reduce anxiety.',
        duration: '5 min audio',
        url: '#'
      },
      {
        id: '3',
        title: 'Work-Life Balance for Students',
        type: 'video',
        category: 'work-life-balance',
        description: 'Tips for maintaining balance between studies, placement, and personal life.',
        duration: '10 min video',
        url: '#'
      },
      {
        id: '4',
        title: 'Student Counseling Service',
        type: 'contact',
        category: 'support',
        description: 'Free confidential counseling support for students.',
        contactInfo: {
          phone: '1800-STUDENT',
          email: 'counseling@placementguru.edu.au',
          hours: 'Mon-Fri 9AM-5PM'
        }
      },
      {
        id: '5',
        title: 'Crisis Support',
        type: 'contact',
        category: 'support',
        description: '24/7 mental health crisis support line.',
        isEmergency: true,
        contactInfo: {
          phone: '13 11 14',
          hours: '24/7 Available'
        }
      }
    ];

    // Static emergency contacts
    const emergencyContacts = [
      {
        name: 'Lifeline Australia',
        phone: '13 11 14',
        available: '24/7',
        type: 'crisis' as const
      },
      {
        name: 'Beyond Blue',
        phone: '1300 22 4636',
        available: '24/7',
        type: 'crisis' as const
      },
      {
        name: 'Student Counseling',
        phone: '1800-STUDENT',
        available: 'Mon-Fri 9AM-5PM',
        type: 'counseling' as const
      }
    ];

    // Fetch upcoming appointments (if they exist)
    const appointmentsQuery = collections.appointments()
      .where('studentId', '==', studentId)
      .where('date', '>=', today)
      .orderBy('date', 'asc')
      .limit(5);

    let upcomingAppointments: any[] = [];
    try {
      const appointmentsSnapshot = await appointmentsQuery.get();
      upcomingAppointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.log('No appointments collection found, using empty array');
      upcomingAppointments = [];
    }

    const wellnessData: WellnessData = {
      student: {
        id: studentData?.id || studentId,
        name: studentData?.name || ((studentData?.firstName || '') + ' ' + (studentData?.lastName || '')) || 'Unknown',
        course: studentData?.course || studentData?.courseTitle || 'Unknown Course'
      },
      currentMood,
      moodHistory: moodHistory.slice(0, 30), // Last 30 entries
      moodStats: {
        weeklyAverage: Math.round(weeklyAverage * 10) / 10,
        monthlyAverage: Math.round(monthlyAverage * 10) / 10,
        trending
      },
      resources,
      goals,
      upcomingAppointments,
      emergencyContacts
    };

    return NextResponse.json({
      success: true,
      data: wellnessData
    });

  } catch (error) {
    console.error('Error fetching wellness data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch wellness data'
    }, { status: 500 });
  }
}

// POST - Submit mood entry or wellness goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, type, ...data } = body;

    console.log('🌱 Submitting wellness data:', { studentId, type });

    if (!studentId || !type) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and type are required'
      }, { status: 400 });
    }

    let docRef;
    const timestamp = new Date().toISOString();

    if (type === 'mood') {
      const { mood, note, factors } = data;
      
      if (!mood || mood < 1 || mood > 5) {
        return NextResponse.json({
          success: false,
          error: 'Valid mood rating (1-5) is required'
        }, { status: 400 });
      }

      const moodEntry: Omit<MoodEntry, 'id'> = {
        studentId,
        mood,
        note: note || '',
        factors: factors || [],
        date: new Date().toISOString().split('T')[0],
        timestamp
      };

      // Check if entry for today already exists
      const today = new Date().toISOString().split('T')[0];
      const existingQuery = collections.wellness()
        .where('studentId', '==', studentId)
        .where('type', '==', 'mood')
        .where('date', '==', today);

      const existingSnapshot = await existingQuery.get();

      if (!existingSnapshot.empty) {
        // Update existing entry
        const existingDoc = existingSnapshot.docs[0];
        await existingDoc.ref.update({
          mood,
          note: note || '',
          factors: factors || [],
          timestamp
        });
        
        return NextResponse.json({
          success: true,
          data: {
            id: existingDoc.id,
            message: 'Mood updated successfully'
          }
        });
      } else {
        // Create new entry
        docRef = await collections.wellness().add({
          ...moodEntry,
          type: 'mood'
        });
      }
    } else if (type === 'goal') {
      const { title, description, category, target, unit, targetDate } = data;
      
      if (!title || !category || !target) {
        return NextResponse.json({
          success: false,
          error: 'Title, category, and target are required for goals'
        }, { status: 400 });
      }

      const goalData: Omit<WellnessGoal, 'id'> = {
        studentId,
        title,
        description: description || '',
        category,
        target,
        current: 0,
        unit: unit || 'times',
        status: 'active',
        createdAt: timestamp,
        targetDate
      };

      docRef = await collections.wellnessGoals().add(goalData);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Must be "mood" or "goal"'
      }, { status: 400 });
    }

    console.log('✅ Wellness data submitted successfully:', docRef?.id);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef?.id,
        message: `${type} submitted successfully`
      }
    });

  } catch (error) {
    console.error('Error submitting wellness data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit wellness data'
    }, { status: 500 });
  }
}

// PUT - Update wellness goal progress
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, studentId, current, status } = body;

    console.log('🌱 Updating wellness goal:', goalId);

    if (!goalId || !studentId) {
      return NextResponse.json({
        success: false,
        error: 'Goal ID and Student ID are required'
      }, { status: 400 });
    }

    // Verify ownership
    const goalDoc = await collections.wellnessGoals().doc(goalId).get();
    if (!goalDoc.exists || goalDoc.data()?.studentId !== studentId) {
      return NextResponse.json({
        success: false,
        error: 'Goal not found or unauthorized'
      }, { status: 404 });
    }

    // Update goal
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (current !== undefined) updateData.current = current;
    if (status) updateData.status = status;

    await goalDoc.ref.update(updateData);

    console.log('✅ Wellness goal updated successfully');

    return NextResponse.json({
      success: true,
      data: {
        message: 'Goal updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating wellness goal:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update goal'
    }, { status: 500 });
  }
}