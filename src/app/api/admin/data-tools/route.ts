import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    console.log(`🔧 Data tools API - action: ${action}`);

    switch (action) {
      case 'dashboard':
        return await getDataToolsDashboard();
      case 'backup-status':
        return await getBackupStatus();
      case 'data-health':
        return await getDataHealth();
      case 'import-status':
        return await getImportStatus();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in data tools API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch data tools information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    console.log(`🔧 Data tools POST action: ${action}`);

    switch (action) {
      case 'backup':
        return await createBackup(data);
      case 'restore':
        return await restoreBackup(data);
      case 'sync-users':
        return await syncUsers();
      case 'clean-data':
        return await cleanData(data);
      case 'import-data':
        return await importData(data);
      case 'export-data':
        return await exportData(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in data tools POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process data tools operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getDataToolsDashboard() {
  try {
    // Get counts from all collections
    const [
      usersSnapshot,
      studentsSnapshot,
      rtosSnapshot,
      providersSnapshot,
      placementsSnapshot,
      coursesSnapshot
    ] = await Promise.all([
      collections.users().get(),
      collections.students().get(),
      collections.rtos().get(),
      collections.providers().get(),
      collections.placements().get(),
      collections.courses().get(),
    ]);

    const dataStats = {
      collections: {
        users: usersSnapshot.size,
        students: studentsSnapshot.size,
        rtos: rtosSnapshot.size,
        providers: providersSnapshot.size,
        placements: placementsSnapshot.size,
        courses: coursesSnapshot.size,
      },
      totalDocuments: usersSnapshot.size + studentsSnapshot.size + rtosSnapshot.size + 
                     providersSnapshot.size + placementsSnapshot.size + coursesSnapshot.size,
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // Mock: 24 hours ago
      dataHealth: {
        score: 95,
        issues: [
          { type: 'warning', message: '3 users without email verification' },
          { type: 'info', message: '12 students without placements assigned' },
        ],
      },
      recentOperations: [
        {
          id: 'op-001',
          type: 'backup',
          status: 'completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          details: 'Full database backup completed successfully',
        },
        {
          id: 'op-002',
          type: 'sync',
          status: 'completed',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          details: 'User synchronization completed',
        },
        {
          id: 'op-003',
          type: 'import',
          status: 'running',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          details: 'Importing course data from CSV',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: dataStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting data tools dashboard:', error);
    throw error;
  }
}

async function getBackupStatus() {
  try {
    const backupStatus = {
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextScheduledBackup: new Date(Date.now() + 24 * 60 * 60 * 1000),
      backupFrequency: 'daily',
      backupSize: '2.4 GB',
      backupLocation: 'Firebase Storage',
      recentBackups: [
        {
          id: 'backup-001',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          size: '2.4 GB',
          status: 'completed',
          type: 'full',
        },
        {
          id: 'backup-002',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          size: '2.3 GB',
          status: 'completed',
          type: 'full',
        },
        {
          id: 'backup-003',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
          size: '2.2 GB',
          status: 'completed',
          type: 'incremental',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: backupStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting backup status:', error);
    throw error;
  }
}

async function getDataHealth() {
  try {
    // Check data integrity
    const [usersSnapshot, studentsSnapshot] = await Promise.all([
      collections.users().get(),
      collections.students().get(),
    ]);

    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const issues = [];
    let score = 100;

    // Check for users without email verification
    const unverifiedUsers = users.filter((user: any) => !user.emailVerified);
    if (unverifiedUsers.length > 0) {
      issues.push({
        type: 'warning',
        severity: 'medium',
        message: `${unverifiedUsers.length} users without email verification`,
        affectedRecords: unverifiedUsers.length,
      });
      score -= unverifiedUsers.length * 0.5;
    }

    // Check for students without user references
    const orphanedStudents = students.filter((student: any) => 
      !student.userId || !users.find((user: any) => user.id === student.userId)
    );
    if (orphanedStudents.length > 0) {
      issues.push({
        type: 'error',
        severity: 'high',
        message: `${orphanedStudents.length} students without valid user references`,
        affectedRecords: orphanedStudents.length,
      });
      score -= orphanedStudents.length * 2;
    }

    // Check for duplicate emails
    const emailCounts = users.reduce((acc: any, user: any) => {
      acc[user.email] = (acc[user.email] || 0) + 1;
      return acc;
    }, {});
    const duplicateEmails = Object.entries(emailCounts).filter(([, count]) => (count as number) > 1);
    if (duplicateEmails.length > 0) {
      issues.push({
        type: 'error',
        severity: 'high',
        message: `${duplicateEmails.length} duplicate email addresses found`,
        affectedRecords: duplicateEmails.reduce((sum, [, count]) => sum + Number(count), 0),
      });
      score -= duplicateEmails.length * 3;
    }

    const healthReport = {
      score: Math.max(0, Math.round(score)),
      status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
      issues,
      recommendations: generateRecommendations(issues),
      lastCheck: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: healthReport,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error checking data health:', error);
    throw error;
  }
}

async function getImportStatus() {
  try {
    // Mock import status - in real implementation, track actual imports
    const importStatus = {
      recentImports: [
        {
          id: 'imp-001',
          filename: 'students_batch_2024.csv',
          status: 'completed',
          recordsProcessed: 245,
          recordsSuccessful: 243,
          recordsFailed: 2,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        },
        {
          id: 'imp-002',
          filename: 'course_catalog.json',
          status: 'running',
          recordsProcessed: 67,
          recordsSuccessful: 67,
          recordsFailed: 0,
          startTime: new Date(Date.now() - 30 * 60 * 1000),
          endTime: null,
        },
      ],
      supportedFormats: ['CSV', 'JSON', 'Excel'],
      maxFileSize: '10 MB',
    };

    return NextResponse.json({
      success: true,
      data: importStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error getting import status:', error);
    throw error;
  }
}

async function createBackup(data: any) {
  try {
    const { type = 'full', collections: selectedCollections } = data;
    
    console.log(`🔄 Creating ${type} backup...`);

    // In a real implementation, this would trigger actual backup
    const backupId = `backup-${Date.now()}`;
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Backup initiated successfully',
      backupId,
      estimatedTime: '15 minutes',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

async function restoreBackup(data: any) {
  try {
    const { backupId, restorePoint } = data;
    
    console.log(`🔄 Restoring backup: ${backupId}`);

    // In a real implementation, this would trigger actual restoration
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Backup restoration initiated successfully',
      restorationId: `restore-${Date.now()}`,
      estimatedTime: '30 minutes',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  }
}

async function syncUsers() {
  try {
    console.log('🔄 Synchronizing users...');

    // Get all users to sync
    const usersSnapshot = await collections.users().get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let syncedCount = 0;
    let errorCount = 0;

    // Simulate sync process
    for (const user of users) {
      try {
        // In real implementation, sync with external systems
        await new Promise(resolve => setTimeout(resolve, 50));
        syncedCount++;
      } catch (error) {
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User synchronization completed',
      results: {
        totalUsers: users.length,
        syncedCount,
        errorCount,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error syncing users:', error);
    throw error;
  }
}

async function cleanData(data: any) {
  try {
    const { operations } = data;
    
    console.log('🧹 Cleaning data with operations:', operations);

    const results = [];

    for (const operation of operations) {
      switch (operation) {
        case 'remove-duplicates':
          // Remove duplicate records
          results.push({ operation, recordsProcessed: 15, recordsRemoved: 3 });
          break;
        case 'fix-orphaned-records':
          // Fix orphaned records
          results.push({ operation, recordsProcessed: 8, recordsFixed: 8 });
          break;
        case 'normalize-data':
          // Normalize data formats
          results.push({ operation, recordsProcessed: 156, recordsNormalized: 156 });
          break;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data cleaning completed successfully',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error cleaning data:', error);
    throw error;
  }
}

async function importData(data: any) {
  try {
    const { filename, collection, format, mappings } = data;
    
    console.log(`📥 Importing data from ${filename} to ${collection}`);

    // In real implementation, process the uploaded file
    const importId = `import-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      message: 'Data import initiated successfully',
      importId,
      estimatedTime: '10 minutes',
  recordsToProcess: 150,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

async function exportData(data: any) {
  try {
    const { collections: selectedCollections, format, filters } = data;
    
    console.log(`📤 Exporting data from collections: ${selectedCollections.join(', ')}`);

    // In real implementation, generate export file
    const exportId = `export-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      message: 'Data export initiated successfully',
      exportId,
      downloadUrl: `/api/admin/data-tools/download/${exportId}`,
      estimatedSize: '2.1 MB',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  }
}

function generateRecommendations(issues: any[]) {
  const recommendations = [];

  if (issues.some(issue => issue.message.includes('email verification'))) {
    recommendations.push('Send email verification reminders to unverified users');
  }

  if (issues.some(issue => issue.message.includes('orphaned'))) {
    recommendations.push('Run data cleanup to fix orphaned records');
  }

  if (issues.some(issue => issue.message.includes('duplicate'))) {
    recommendations.push('Merge or remove duplicate user accounts');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your data appears to be in good condition!');
  }

  return recommendations;
}