import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { getCareerAdvice } from '@/ai/flows/ai-career-advisor';

// Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'career-advice' | 'resume-help' | 'interview-prep' | 'general';
}

interface ConversationHistory {
  id: string;
  studentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  category: 'career' | 'resume' | 'interview' | 'general';
}

interface AIAssistantData {
  student: {
    id: string;
    name: string;
    course: string;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
  };
  conversations: ConversationHistory[];
  recentMessages: ChatMessage[];
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    category: 'career' | 'resume' | 'interview';
    prompt: string;
  }>;
  statistics: {
    totalConversations: number;
    totalMessages: number;
    lastActivity: string;
  };
}

// GET - Fetch AI assistant data and conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const conversationId = searchParams.get('conversationId');
    
    console.log('🤖 Fetching AI assistant data for student:', studentId);

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Fetch student data
    const studentDoc = await collections.students().doc(studentId).get();
    let studentData: any;
    
    if (!studentDoc.exists) {
      console.log('🔄 Student not found in database, using mock data for development');
      // Use mock data for development/testing
      studentData = {
        name: 'Alex Johnson',
        course: 'Computer Science',
        courseTitle: 'Bachelor of Computer Science',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        interests: ['Web Development', 'AI/ML', 'Mobile Apps'],
        careerGoals: 'Become a full-stack developer and work on innovative tech projects'
      };
    } else {
      studentData = studentDoc.data();
    }

    // If specific conversation requested
    if (conversationId) {
      const conversationDoc = await collections.aiConversations().doc(conversationId).get();
      if (!conversationDoc.exists || conversationDoc.data()?.studentId !== studentId) {
        return NextResponse.json({
          success: false,
          error: 'Conversation not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: conversationDoc.id,
          ...conversationDoc.data()
        }
      });
    }

    // Fetch all conversations for student
    let conversations: ConversationHistory[] = [];
    
    try {
      const conversationsQuery = collections.aiConversations()
        .where('studentId', '==', studentId)
        .orderBy('updatedAt', 'desc')
        .limit(20);

      const conversationsSnapshot = await conversationsQuery.get();
      conversations = conversationsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as ConversationHistory));
    } catch (error) {
      console.log('🔄 Firestore query failed (likely missing index), using mock conversations for development');
      // Provide mock conversations for development/testing
      conversations = [
        {
          id: 'conv_1',
          studentId,
          title: 'Career Guidance Discussion',
          messages: [
            {
              id: 'msg_1',
              role: 'user',
              content: 'I need career advice for my field. What should I focus on?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: 'career-advice'
            },
            {
              id: 'msg_2',
              role: 'assistant',
              content: 'Based on your background in Computer Science, I recommend focusing on developing both technical and soft skills. Consider learning popular frameworks like React or Angular, practice coding regularly, and build a strong portfolio. Also, work on communication skills and consider contributing to open-source projects.',
              timestamp: new Date(Date.now() - 3500000).toISOString(),
              type: 'career-advice'
            }
          ],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3500000).toISOString(),
          category: 'career'
        }
      ];
    }

    // Get recent messages across all conversations
    const recentMessages: ChatMessage[] = [];
    conversations.forEach(conv => {
      recentMessages.push(...conv.messages.slice(-2)); // Last 2 messages per conversation
    });
    recentMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Statistics
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const lastActivity = conversations.length > 0 ? conversations[0].updatedAt : '';

    // Quick action prompts
    const quickActions = [
      {
        id: 'career-guidance',
        title: 'Career Guidance',
        description: 'Get personalized advice about your career path',
        category: 'career' as const,
        prompt: 'I need guidance about my career path and future opportunities.'
      },
      {
        id: 'resume-review',
        title: 'Resume Review',
        description: 'Get feedback on your resume and CV',
        category: 'resume' as const,
        prompt: 'Can you help me improve my resume and make it more attractive to employers?'
      },
      {
        id: 'interview-prep',
        title: 'Interview Preparation',
        description: 'Practice common interview questions',
        category: 'interview' as const,
        prompt: 'I have an upcoming interview. Can you help me prepare with common questions?'
      },
      {
        id: 'skill-development',
        title: 'Skill Development',
        description: 'Learn what skills to focus on',
        category: 'career' as const,
        prompt: 'What skills should I develop to advance in my career field?'
      },
      {
        id: 'networking-tips',
        title: 'Networking Advice',
        description: 'Learn how to build professional networks',
        category: 'career' as const,
        prompt: 'How can I build a strong professional network in my industry?'
      },
      {
        id: 'job-search',
        title: 'Job Search Strategy',
        description: 'Get tips for finding the right opportunities',
        category: 'career' as const,
        prompt: 'What strategies should I use to find job opportunities in my field?'
      }
    ];

    const assistantData: AIAssistantData = {
      student: {
        id: studentData?.id || studentId,
        name: studentData?.name || ((studentData?.firstName || '') + ' ' + (studentData?.lastName || '')) || 'Unknown',
        course: studentData?.course || studentData?.courseTitle || 'Unknown Course',
        skills: studentData?.skills || [],
        interests: studentData?.interests || [],
        careerGoals: studentData?.careerGoals || ''
      },
      conversations,
      recentMessages: recentMessages.slice(0, 10),
      quickActions,
      statistics: {
        totalConversations: conversations.length,
        totalMessages,
        lastActivity
      }
    };

    return NextResponse.json({
      success: true,
      data: assistantData
    });

  } catch (error) {
    console.error('Error fetching AI assistant data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch AI assistant data'
    }, { status: 500 });
  }
}

// POST - Send message to AI assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, message, conversationId, category = 'general' } = body;

    console.log('🤖 Processing AI assistant message:', { studentId, category });

    if (!studentId || !message?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and message are required'
      }, { status: 400 });
    }

    // Fetch student data for context
    const studentDoc = await collections.students().doc(studentId).get();
    let studentData: any;
    
    if (!studentDoc.exists) {
      console.log('🔄 Student not found in database, using mock data for development');
      // Use mock data for development/testing
      studentData = {
        name: 'Alex Johnson',
        course: 'Computer Science',
        courseTitle: 'Bachelor of Computer Science',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        interests: ['Web Development', 'AI/ML', 'Mobile Apps'],
        careerGoals: 'Become a full-stack developer and work on innovative tech projects'
      };
    } else {
      studentData = studentDoc.data();
    }
    const timestamp = new Date().toISOString();

    // Create user message
    const userMessage: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content: message.trim(),
      timestamp,
      type: category
    };

    let conversation: ConversationHistory;
    
    if (conversationId) {
      // Add to existing conversation
      const conversationDoc = await collections.aiConversations().doc(conversationId).get();
      if (!conversationDoc.exists || conversationDoc.data()?.studentId !== studentId) {
        return NextResponse.json({
          success: false,
          error: 'Conversation not found'
        }, { status: 404 });
      }
      
      conversation = {
        id: conversationDoc.id,
        ...conversationDoc.data()
      } as ConversationHistory;
    } else {
      // Create new conversation
      const conversationTitle = message.length > 50 
        ? message.substring(0, 47) + '...' 
        : message;

      conversation = {
        id: '', // Will be set after creation
        studentId,
        title: conversationTitle,
        messages: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        category: category as 'career' | 'resume' | 'interview' | 'general'
      };
    }

    // Add user message to conversation
    conversation.messages.push({
      id: `msg_${Date.now()}_user`,
      ...userMessage
    });

    // Prepare AI context
    const studentProfile = `
Name: ${studentData?.name || 'Student'}
Course: ${studentData?.course || studentData?.courseTitle || 'Unknown'}
Skills: ${(studentData?.skills || []).join(', ') || 'Not specified'}
Interests: ${(studentData?.interests || []).join(', ') || 'Not specified'}
Career Goals: ${studentData?.careerGoals || 'Not specified'}
    `.trim();

    let aiResponse: string;

    try {
      // Use AI career advisor for career-related queries
      if (category === 'career' || message.toLowerCase().includes('career')) {
        const careerAdvice = await getCareerAdvice({
          studentProfile,
          careerGoals: message
        });

        aiResponse = `## Career Guidance

**Personalized Guidance:**
${careerAdvice.personalizedGuidance}

**Skill Suggestions:**
${careerAdvice.skillSuggestions}

**Success Advice:**
${careerAdvice.successAdvice}`;
      } else {
        // For non-career queries, provide structured responses
        aiResponse = await generateContextualResponse(message, category, studentProfile, conversation.messages);
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      aiResponse = generateFallbackResponse(message, category);
    }

    // Create AI response message
    const aiMessage: Omit<ChatMessage, 'id'> = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      type: category
    };

    conversation.messages.push({
      id: `msg_${Date.now()}_ai`,
      ...aiMessage
    });

    conversation.updatedAt = new Date().toISOString();

    // Save conversation
    let savedConversationId: string;
    if (conversationId) {
      await collections.aiConversations().doc(conversationId).update({
        messages: conversation.messages,
        updatedAt: conversation.updatedAt
      });
      savedConversationId = conversationId;
    } else {
      const docRef = await collections.aiConversations().add({
        studentId: conversation.studentId,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        category: conversation.category
      });
      savedConversationId = docRef.id;
    }

    console.log('✅ AI conversation processed successfully');

    return NextResponse.json({
      success: true,
      data: {
        conversationId: savedConversationId,
        message: aiMessage,
        timestamp: aiMessage.timestamp
      }
    });

  } catch (error) {
    console.error('Error processing AI message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process message'
    }, { status: 500 });
  }
}

// Helper function to generate contextual responses
async function generateContextualResponse(
  message: string, 
  category: string, 
  studentProfile: string, 
  conversationHistory: ChatMessage[]
): Promise<string> {
  
  const context = conversationHistory.slice(-4).map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  if (category === 'resume') {
    return `## Resume Assistance

Based on your profile and question about: "${message}"

**Key Recommendations:**
• Highlight your technical skills and course-specific knowledge
• Include relevant projects and practical experience from your studies
• Use action verbs and quantify achievements where possible
• Tailor your resume to match job requirements
• Keep formatting clean and professional

**Next Steps:**
1. Review your current resume against industry standards
2. Add specific examples of your coursework and projects
3. Include any certifications or additional training
4. Get feedback from career services or mentors

Would you like me to help you with a specific section of your resume?`;
  }

  if (category === 'interview') {
    return `## Interview Preparation

For your question: "${message}"

**Common Interview Areas to Prepare:**
• Tell me about yourself
• Why are you interested in this role/company?
• What are your strengths and weaknesses?
• Describe a challenging situation and how you handled it
• Where do you see yourself in 5 years?

**Preparation Tips:**
1. Research the company and role thoroughly
2. Prepare specific examples using the STAR method (Situation, Task, Action, Result)
3. Practice your answers out loud
4. Prepare thoughtful questions to ask the interviewer
5. Plan your outfit and route in advance

**Technical Questions:**
Be ready to discuss your coursework, projects, and any practical experience relevant to the role.

What specific aspect of interview preparation would you like to focus on?`;
  }

  return `## General Assistance

Thank you for your question: "${message}"

I'm here to help you with career guidance, resume building, and interview preparation. Based on your profile:

**Your Background:**
${studentProfile}

**How I Can Help:**
• Career planning and goal setting
• Resume review and improvement
• Interview preparation and practice
• Skill development recommendations
• Job search strategies
• Professional networking advice

Could you be more specific about what you'd like help with? I can provide more targeted advice based on your needs.`;
}

// Fallback response when AI fails
function generateFallbackResponse(message: string, category: string): string {
  const responses = {
    career: `I understand you're looking for career guidance. While I'm currently experiencing some technical difficulties, here are some general tips:

• Focus on developing both technical and soft skills
• Network with professionals in your field
• Stay updated with industry trends
• Consider internships and practical experience
• Build a strong professional online presence

Please try asking your question again, or contact your career counselor for personalized advice.`,

    resume: `I'd love to help with your resume, but I'm having some technical issues right now. Here are some quick tips:

• Keep it concise (1-2 pages)
• Use clear, professional formatting
• Include relevant coursework and projects
• Highlight achievements with specific examples
• Proofread carefully for errors

Please try again or consider scheduling a session with career services.`,

    interview: `I'm here to help with interview prep, though I'm experiencing some technical difficulties. Here are key reminders:

• Research the company thoroughly
• Practice common interview questions
• Prepare specific examples of your experience
• Plan thoughtful questions to ask
• Dress professionally and arrive early

Please try your question again or reach out to your career advisor.`
  };

  return responses[category as keyof typeof responses] || responses.career;
}