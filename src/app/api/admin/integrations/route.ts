import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    console.log(`🔌 Integrations API - action: ${action}`);

    switch (action) {
      case 'dashboard':
        return await getIntegrationsDashboard();
      case 'available':
        return await getAvailableIntegrations();
      case 'webhooks':
        return await getWebhooks();
      case 'api-keys':
        return await getApiKeys();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in integrations API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch integrations data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    console.log(`🔌 Integrations POST action: ${action}`);

    switch (action) {
      case 'enable-integration':
        return await enableIntegration(data);
      case 'disable-integration':
        return await disableIntegration(data);
      case 'configure-integration':
        return await configureIntegration(data);
      case 'test-connection':
        return await testConnection(data);
      case 'create-webhook':
        return await createWebhook(data);
      case 'create-api-key':
        return await createApiKey(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in integrations POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process integration operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getIntegrationsDashboard() {
  try {
    // Check for existing integrations in systemSettings
    const settingsSnapshot = await collections.systemSettings().where('type', '==', 'integrations').get();
    let activeIntegrations = [];
    
    if (!settingsSnapshot.empty) {
      const integrationsDoc = settingsSnapshot.docs[0].data();
      activeIntegrations = integrationsDoc.active || [];
    }

    const integrationStats = {
      activeIntegrations: activeIntegrations.length,
      totalRequests: 12547, // Mock data
      successRate: 98.5,
      lastSyncTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      apiCalls: {
        today: 1245,
        thisWeek: 8967,
        thisMonth: 38542,
      },
      topIntegrations: [
        {
          name: 'Student Information System',
          type: 'sis',
          status: 'active',
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          requests: 3456,
          errors: 12,
        },
        {
          name: 'Learning Management System',
          type: 'lms',
          status: 'active',
          lastSync: new Date(Date.now() - 10 * 60 * 1000),
          requests: 2890,
          errors: 5,
        },
        {
          name: 'External Assessment Platform',
          type: 'assessment',
          status: 'inactive',
          lastSync: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          requests: 567,
          errors: 23,
        },
      ],
      recentActivity: [
        {
          id: 'activity-001',
          integration: 'Student Information System',
          action: 'Data Sync',
          status: 'success',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          details: 'Synchronized 45 student records',
        },
        {
          id: 'activity-002',
          integration: 'Learning Management System',
          action: 'Course Update',
          status: 'success',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          details: 'Updated 12 course enrollments',
        },
        {
          id: 'activity-003',
          integration: 'Email Service',
          action: 'Notification Send',
          status: 'failed',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          details: 'Failed to send 3 notification emails',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: integrationStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting integrations dashboard:', error);
    throw error;
  }
}

async function getAvailableIntegrations() {
  try {
    const availableIntegrations = [
      {
        id: 'sis-powerschool',
        name: 'PowerSchool SIS',
        category: 'Student Information System',
        description: 'Sync student data, grades, and enrollment information with PowerSchool',
        provider: 'PowerSchool',
        status: 'available',
        features: ['Student Sync', 'Grade Sync', 'Enrollment Management'],
        setupComplexity: 'medium',
        documentation: '/docs/integrations/powerschool',
        pricing: 'Contact for pricing',
      },
      {
        id: 'lms-moodle',
        name: 'Moodle LMS',
        category: 'Learning Management System',
        description: 'Connect with Moodle for course management and student progress tracking',
        provider: 'Moodle',
        status: 'available',
        features: ['Course Sync', 'Progress Tracking', 'Assignment Integration'],
        setupComplexity: 'easy',
        documentation: '/docs/integrations/moodle',
        pricing: 'Free',
      },
      {
        id: 'assessment-turnitin',
        name: 'Turnitin',
        category: 'Assessment Platform',
        description: 'Plagiarism detection and assessment feedback integration',
        provider: 'Turnitin',
        status: 'available',
        features: ['Plagiarism Detection', 'Feedback Tools', 'Originality Reports'],
        setupComplexity: 'hard',
        documentation: '/docs/integrations/turnitin',
        pricing: 'Premium feature',
      },
      {
        id: 'email-sendgrid',
        name: 'SendGrid Email',
        category: 'Communication',
        description: 'Reliable email delivery for notifications and communications',
        provider: 'SendGrid',
        status: 'active',
        features: ['Email Delivery', 'Template Management', 'Analytics'],
        setupComplexity: 'easy',
        documentation: '/docs/integrations/sendgrid',
        pricing: 'Usage-based',
      },
      {
        id: 'calendar-outlook',
        name: 'Microsoft Outlook',
        category: 'Calendar',
        description: 'Sync placement schedules and important dates with Outlook Calendar',
        provider: 'Microsoft',
        status: 'beta',
        features: ['Calendar Sync', 'Meeting Scheduling', 'Reminder Notifications'],
        setupComplexity: 'medium',
        documentation: '/docs/integrations/outlook',
        pricing: 'Free with Office 365',
      },
      {
        id: 'storage-dropbox',
        name: 'Dropbox',
        category: 'File Storage',
        description: 'Store and share placement documents and student portfolios',
        provider: 'Dropbox',
        status: 'available',
        features: ['Document Storage', 'File Sharing', 'Version Control'],
        setupComplexity: 'easy',
        documentation: '/docs/integrations/dropbox',
        pricing: 'Storage-based',
      },
    ];

    return NextResponse.json({
      success: true,
      data: { integrations: availableIntegrations },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting available integrations:', error);
    throw error;
  }
}

async function getWebhooks() {
  try {
    // Get webhooks from database or return mock data
    const webhooks = [
      {
        id: 'webhook-001',
        name: 'Student Placement Updates',
        url: 'https://api.rtosystem.com/webhooks/placement-updates',
        events: ['placement.created', 'placement.updated', 'placement.completed'],
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalCalls: 234,
        successRate: 98.7,
      },
      {
        id: 'webhook-002',
        name: 'Assessment Notifications',
        url: 'https://lms.provider.edu/api/notifications',
        events: ['assessment.submitted', 'assessment.graded'],
        status: 'active',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
        totalCalls: 567,
        successRate: 99.1,
      },
      {
        id: 'webhook-003',
        name: 'User Management Sync',
        url: 'https://directory.organization.com/sync',
        events: ['user.created', 'user.updated', 'user.deactivated'],
        status: 'inactive',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastTriggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalCalls: 89,
        successRate: 94.4,
      },
    ];

    return NextResponse.json({
      success: true,
      data: { webhooks },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting webhooks:', error);
    throw error;
  }
}

async function getApiKeys() {
  try {
    // Get API keys from database (masked for security)
    const apiKeys = [
      {
        id: 'key-001',
        name: 'RTO System Integration',
        keyPreview: 'pg_live_123456...abcdef',
        permissions: ['read:students', 'write:placements', 'read:assessments'],
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        requestCount: 15247,
        rateLimit: '1000/hour',
      },
      {
        id: 'key-002',
        name: 'Mobile App API',
        keyPreview: 'pg_live_789012...ghijkl',
        permissions: ['read:profile', 'write:logbook', 'read:notifications'],
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 5 * 60 * 1000),
        requestCount: 8934,
        rateLimit: '500/hour',
      },
      {
        id: 'key-003',
        name: 'Analytics Dashboard',
        keyPreview: 'pg_live_345678...mnopqr',
        permissions: ['read:analytics', 'read:reports'],
        status: 'inactive',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        requestCount: 2456,
        rateLimit: '200/hour',
      },
    ];

    return NextResponse.json({
      success: true,
      data: { apiKeys },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting API keys:', error);
    throw error;
  }
}

async function enableIntegration(data: any) {
  try {
    const { integrationId, config } = data;
    
    console.log(`🔌 Enabling integration: ${integrationId}`);

    // Save integration configuration
    const integrationDoc = {
      integrationId,
      status: 'active',
      config,
      enabledAt: new Date(),
      enabledBy: 'admin', // Would come from auth context
    };

    await collections.systemSettings().add({
      type: 'integration',
      ...integrationDoc,
    });

    return NextResponse.json({
      success: true,
      message: 'Integration enabled successfully',
      integrationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error enabling integration:', error);
    throw error;
  }
}

async function disableIntegration(data: any) {
  try {
    const { integrationId } = data;
    
    console.log(`🔌 Disabling integration: ${integrationId}`);

    // Update integration status
    const integrationQuery = await collections.systemSettings()
      .where('type', '==', 'integration')
      .where('integrationId', '==', integrationId)
      .get();

    if (!integrationQuery.empty) {
      const docRef = integrationQuery.docs[0].ref;
      await docRef.update({
        status: 'inactive',
        disabledAt: new Date(),
        disabledBy: 'admin', // Would come from auth context
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Integration disabled successfully',
      integrationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error disabling integration:', error);
    throw error;
  }
}

async function configureIntegration(data: any) {
  try {
    const { integrationId, configuration } = data;
    
    console.log(`⚙️ Configuring integration: ${integrationId}`);

    // Update integration configuration
    const integrationQuery = await collections.systemSettings()
      .where('type', '==', 'integration')
      .where('integrationId', '==', integrationId)
      .get();

    if (!integrationQuery.empty) {
      const docRef = integrationQuery.docs[0].ref;
      await docRef.update({
        config: configuration,
        updatedAt: new Date(),
        updatedBy: 'admin', // Would come from auth context
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Integration configuration updated successfully',
      integrationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error configuring integration:', error);
    throw error;
  }
}

async function testConnection(data: any) {
  try {
    const { integrationId, config } = data;
    
    console.log(`🧪 Testing connection for integration: ${integrationId}`);

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));

    const testResult = {
      success: Math.random() > 0.2, // 80% success rate for demo
      responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      timestamp: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: testResult.success ? 'Connection test successful' : 'Connection test failed',
      testResult,
      integrationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error testing connection:', error);
    throw error;
  }
}

async function createWebhook(data: any) {
  try {
    const { name, url, events, description } = data;
    
    console.log(`🪝 Creating webhook: ${name}`);

    const webhook = {
      name,
      url,
      events,
      description,
      status: 'active',
      createdAt: new Date(),
      createdBy: 'admin', // Would come from auth context
      secret: generateWebhookSecret(),
    };

    const docRef = await collections.systemSettings().add({
      type: 'webhook',
      ...webhook,
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook created successfully',
      webhookId: docRef.id,
      secret: webhook.secret,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error creating webhook:', error);
    throw error;
  }
}

async function createApiKey(data: any) {
  try {
    const { name, permissions, description, rateLimit } = data;
    
    console.log(`🔑 Creating API key: ${name}`);

    const apiKey = {
      name,
      permissions,
      description,
      rateLimit: rateLimit || '1000/hour',
      status: 'active',
      createdAt: new Date(),
      createdBy: 'admin', // Would come from auth context
      key: generateApiKey(),
    };

    const docRef = await collections.systemSettings().add({
      type: 'api-key',
      ...apiKey,
    });

    return NextResponse.json({
      success: true,
      message: 'API key created successfully',
      keyId: docRef.id,
      key: apiKey.key,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error creating API key:', error);
    throw error;
  }
}

function generateWebhookSecret() {
  return 'whsec_' + Math.random().toString(36).substr(2, 32);
}

function generateApiKey() {
  return 'pg_live_' + Math.random().toString(36).substr(2, 32);
}