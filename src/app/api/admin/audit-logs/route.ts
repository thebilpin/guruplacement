import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'logs';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');

    console.log(`📋 Fetching audit logs - action: ${action}`);

    switch (action) {
      case 'logs':
        return await getAuditLogs({ page, limit, category, severity });
      case 'stats':
        return await getAuditStats();
      case 'export':
        return await exportAuditLogs();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in audit logs API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch audit logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    console.log(`📋 Audit logs POST action: ${action}`);

    switch (action) {
      case 'create':
        return await createAuditLog(data);
      case 'bulk-action':
        return await handleBulkAction(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in audit logs POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process audit log operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getAuditLogs({ page, limit, category, severity }: any) {
  try {
    let query = collections.auditLogs().orderBy('timestamp', 'desc');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (severity) {
      query = query.where('severity', '==', severity);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await collections.auditLogs()
        .orderBy('timestamp', 'desc')
        .limit(offset)
        .get();
      
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();
    
    if (snapshot.empty) {
      // Generate sample data if no real audit logs exist
      const sampleLogs = generateSampleAuditLogs();
      return NextResponse.json({
        success: true,
        data: {
          logs: sampleLogs.slice(offset, offset + limit),
          totalCount: sampleLogs.length,
          page,
          limit,
          totalPages: Math.ceil(sampleLogs.length / limit),
        },
        message: 'Using sample data - no audit logs in database',
        timestamp: new Date().toISOString(),
      });
    }

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const totalSnapshot = await collections.auditLogs().get();
    const totalCount = totalSnapshot.size;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    throw error;
  }
}

async function getAuditStats() {
  try {
    const snapshot = await collections.auditLogs().get();
    
    if (snapshot.empty) {
      // Return sample stats if no data
      return NextResponse.json({
        success: true,
        data: {
          totalLogs: 1247,
          todayLogs: 89,
          severityBreakdown: {
            LOW: 623,
            MEDIUM: 412,
            HIGH: 189,
            CRITICAL: 23,
          },
          categoryBreakdown: {
            AUTHENTICATION: 298,
            DATA_CHANGE: 445,
            SYSTEM: 156,
            COMPLIANCE: 89,
            SECURITY: 134,
            USER_MANAGEMENT: 125,
          },
          topUsers: [
            { name: 'System Admin', actions: 234 },
            { name: 'RTO Admin', actions: 167 },
            { name: 'Provider Admin', actions: 145 },
          ],
        },
        message: 'Using sample data - no audit logs in database',
        timestamp: new Date().toISOString(),
      });
    }

    const logs = snapshot.docs.map(doc => doc.data());
    
    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter((log: any) => {
      const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      return logDate >= today;
    }).length;

    const severityBreakdown = logs.reduce((acc: any, log: any) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = logs.reduce((acc: any, log: any) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        totalLogs: logs.length,
        todayLogs,
        severityBreakdown,
        categoryBreakdown,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting audit stats:', error);
    throw error;
  }
}

async function exportAuditLogs() {
  try {
    const snapshot = await collections.auditLogs().orderBy('timestamp', 'desc').get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Audit logs ready for export',
      data: { logs },
      exportFormat: 'json',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error exporting audit logs:', error);
    throw error;
  }
}

async function createAuditLog(data: any) {
  try {
    const auditLog = {
      ...data,
      timestamp: new Date(),
      id: `AL-${Date.now()}`,
    };

    const docRef = await collections.auditLogs().add(auditLog);

    return NextResponse.json({
      success: true,
      message: 'Audit log created successfully',
      logId: docRef.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    throw error;
  }
}

async function handleBulkAction(data: any) {
  try {
    const { action, logIds } = data;
    
    console.log(`🔄 Performing bulk action: ${action} on ${logIds.length} logs`);

    // Perform bulk action (archive, delete, etc.)
    const batch = collections.auditLogs().firestore.batch();
    
    for (const logId of logIds) {
      const docRef = collections.auditLogs().doc(logId);
      
      if (action === 'archive') {
        batch.update(docRef, { archived: true, archivedAt: new Date() });
      } else if (action === 'delete') {
        batch.delete(docRef);
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${logIds.length} audit logs`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error performing bulk action:', error);
    throw error;
  }
}

function generateSampleAuditLogs() {
  const actionTypes = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT'];
  const categories = ['AUTHENTICATION', 'DATA_CHANGE', 'SYSTEM', 'COMPLIANCE', 'SECURITY', 'USER_MANAGEMENT', 'DOCUMENT', 'PLACEMENT'];
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const results = ['SUCCESS', 'FAILURE', 'PARTIAL'];
  
  const logs = [];
  
  for (let i = 0; i < 100; i++) {
    logs.push({
      id: `AL-${1000 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      userId: `user-${Math.floor(Math.random() * 50) + 1}`,
      userEmail: `user${Math.floor(Math.random() * 50) + 1}@example.com`,
      userName: `User ${Math.floor(Math.random() * 50) + 1}`,
      actionType: actionTypes[Math.floor(Math.random() * actionTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      result: results[Math.floor(Math.random() * results.length)],
      description: `Sample audit log entry ${i + 1}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Sample Browser)',
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}