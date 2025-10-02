import { NextRequest, NextResponse } from 'next/server';
import { auditScheduler, DashboardType, AlertSeverity, AlertStatus, AlertCategory } from '@/lib/audit-scheduler';

export async function GET(request: NextRequest) {
  console.log('🎯 Audit scheduler API called');
  
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';
  const dashboardType = searchParams.get('dashboardType') as DashboardType;
  const entityId = searchParams.get('entityId');
  const severity = searchParams.get('severity') as AlertSeverity;
  const status = searchParams.get('status') as AlertStatus;
  const category = searchParams.get('category') as AlertCategory;

  try {
    // Initialize the scheduler if not already done
    auditScheduler.initialize();

    switch (action) {
      case 'dashboard':
        // Get dashboard statistics for specific dashboard type or all
        if (dashboardType) {
          const stats = auditScheduler.getDashboardStats(dashboardType);
          const alerts = auditScheduler.generateDashboardAlerts(dashboardType);
          const tasks = auditScheduler.getScheduledTasks({ dashboardType });
          return NextResponse.json({
            stats,
            alerts: alerts.slice(0, 10), // Latest 10 alerts
            tasks: tasks.slice(0, 10), // Next 10 tasks
            dashboardType
          });
        } else {
          // Admin view - all dashboards
          const allStats = {
            student: auditScheduler.getDashboardStats('STUDENT'),
            trainer: auditScheduler.getDashboardStats('TRAINER'),
            provider: auditScheduler.getDashboardStats('PROVIDER'),
            rto: auditScheduler.getDashboardStats('RTO'),
            admin: auditScheduler.getDashboardStats('ADMIN'),
          };
          const allAlerts = auditScheduler.getAlerts();
          return NextResponse.json({
            stats: allStats,
            alerts: allAlerts.slice(0, 20),
            summary: {
              totalAlerts: allAlerts.length,
              criticalAlerts: allAlerts.filter(a => a.severity === 'CRITICAL').length,
              activeAlerts: allAlerts.filter(a => a.status === 'ACTIVE').length,
              escalatedAlerts: allAlerts.filter(a => a.status === 'ESCALATED').length,
            }
          });
        }

      case 'alerts':
        const alertFilters: any = {};
        if (dashboardType) alertFilters.dashboardType = dashboardType;
        if (entityId) alertFilters.entityId = entityId;
        if (severity) alertFilters.severity = severity;
        if (status) alertFilters.status = status;
        if (category) alertFilters.category = category;

        const alerts = auditScheduler.getAlerts(alertFilters);
        return NextResponse.json({
          alerts,
          total: alerts.length,
          filters: alertFilters
        });

      case 'tasks':
        const taskFilters: any = {};
        if (dashboardType) taskFilters.dashboardType = dashboardType;
        if (entityId) taskFilters.entityId = entityId;
        
        const dueWithinDays = searchParams.get('dueWithinDays');
        if (dueWithinDays) taskFilters.dueWithinDays = parseInt(dueWithinDays);

        const tasks = auditScheduler.getScheduledTasks(taskFilters);
        return NextResponse.json({
          tasks,
          total: tasks.length,
          filters: taskFilters
        });

      case 'audit-logs':
        const logFilters: any = {};
        if (entityId) logFilters.entityId = entityId;
        
        const userId = searchParams.get('userId');
        const actionFilter = searchParams.get('actionFilter');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');

        if (userId) logFilters.userId = userId;
        if (actionFilter) logFilters.action = actionFilter;
        if (fromDate) logFilters.fromDate = new Date(fromDate);
        if (toDate) logFilters.toDate = new Date(toDate);

        const logs = auditScheduler.getAuditLogs(logFilters);
        return NextResponse.json({
          logs,
          total: logs.length,
          filters: logFilters
        });

      case 'generate-alerts':
        // Generate new alerts based on current data
        auditScheduler.generateExpiryAlerts();
        const newAlerts = auditScheduler.getAlerts({ status: 'ACTIVE' });
        return NextResponse.json({
          message: 'Alerts generated successfully',
          generatedAlerts: newAlerts.length,
          alerts: newAlerts.slice(0, 10)
        });

      case 'process-escalations':
        // Process alert escalations
        auditScheduler.processEscalations();
        const escalatedAlerts = auditScheduler.getAlerts({ status: 'ESCALATED' });
        return NextResponse.json({
          message: 'Escalations processed successfully',
          escalatedAlerts: escalatedAlerts.length,
          alerts: escalatedAlerts
        });

      case 'traffic-light':
        // Global compliance traffic light status
        const trafficLight = {
          student: {
            status: auditScheduler.getDashboardStats('STUDENT').criticalAlerts === 0 ? 'GREEN' : 
                   auditScheduler.getDashboardStats('STUDENT').criticalAlerts <= 2 ? 'YELLOW' : 'RED',
            critical: auditScheduler.getDashboardStats('STUDENT').criticalAlerts,
            active: auditScheduler.getDashboardStats('STUDENT').activeAlerts
          },
          trainer: {
            status: auditScheduler.getDashboardStats('TRAINER').criticalAlerts === 0 ? 'GREEN' : 
                   auditScheduler.getDashboardStats('TRAINER').criticalAlerts <= 2 ? 'YELLOW' : 'RED',
            critical: auditScheduler.getDashboardStats('TRAINER').criticalAlerts,
            active: auditScheduler.getDashboardStats('TRAINER').activeAlerts
          },
          provider: {
            status: auditScheduler.getDashboardStats('PROVIDER').criticalAlerts === 0 ? 'GREEN' : 
                   auditScheduler.getDashboardStats('PROVIDER').criticalAlerts <= 2 ? 'YELLOW' : 'RED',
            critical: auditScheduler.getDashboardStats('PROVIDER').criticalAlerts,
            active: auditScheduler.getDashboardStats('PROVIDER').activeAlerts
          },
          rto: {
            status: auditScheduler.getDashboardStats('RTO').criticalAlerts === 0 ? 'GREEN' : 
                   auditScheduler.getDashboardStats('RTO').criticalAlerts <= 2 ? 'YELLOW' : 'RED',
            critical: auditScheduler.getDashboardStats('RTO').criticalAlerts,
            active: auditScheduler.getDashboardStats('RTO').activeAlerts
          }
        };
        return NextResponse.json({ trafficLight });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in audit scheduler API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    auditScheduler.initialize();

    switch (action) {
      case 'acknowledge-alert':
        const { alertId, userId, notes } = body;
        const acknowledged = auditScheduler.acknowledgeAlert(alertId, userId, notes);
        
        return NextResponse.json({ 
          success: acknowledged,
          message: acknowledged ? 'Alert acknowledged successfully' : 'Alert not found'
        });

      case 'resolve-alert':
        const { alertId: resolveAlertId, userId: resolveUserId, notes: resolveNotes } = body;
        const resolved = auditScheduler.resolveAlert(resolveAlertId, resolveUserId, resolveNotes);
        
        return NextResponse.json({ 
          success: resolved,
          message: resolved ? 'Alert resolved successfully' : 'Alert not found'
        });

      case 'create-alert':
        const newAlert = auditScheduler.createAlert(body.alert);
        return NextResponse.json({ 
          success: true, 
          alert: newAlert,
          message: 'Alert created successfully'
        });

      case 'create-task':
        const newTask = auditScheduler.createScheduledTask(body.task);
        return NextResponse.json({ 
          success: true, 
          task: newTask,
          message: 'Task created successfully'
        });

      case 'bulk-acknowledge':
        const { alertIds, userId: bulkUserId, notes: bulkNotes } = body;
        let acknowledgedCount = 0;
        
        alertIds.forEach((id: string) => {
          if (auditScheduler.acknowledgeAlert(id, bulkUserId, bulkNotes)) {
            acknowledgedCount++;
          }
        });

        return NextResponse.json({
          success: true,
          acknowledgedCount,
          totalRequested: alertIds.length,
          message: `${acknowledgedCount} alerts acknowledged successfully`
        });

      case 'export-audit-pack':
        // Generate audit evidence pack
        const allAlerts = auditScheduler.getAlerts();
        const allTasks = auditScheduler.getScheduledTasks();
        const allLogs = auditScheduler.getAuditLogs();
        
        const auditPack = {
          generatedAt: new Date(),
          summary: {
            totalAlerts: allAlerts.length,
            totalTasks: allTasks.length,
            totalLogs: allLogs.length,
            criticalAlerts: allAlerts.filter(a => a.severity === 'CRITICAL').length,
            resolvedAlerts: allAlerts.filter(a => a.status === 'RESOLVED').length,
            overdueAlerts: allAlerts.filter(a => a.dueDate < new Date() && a.status === 'ACTIVE').length,
          },
          alerts: allAlerts,
          tasks: allTasks,
          auditLogs: allLogs.slice(0, 1000), // Last 1000 logs
          complianceStatus: {
            student: auditScheduler.getDashboardStats('STUDENT'),
            trainer: auditScheduler.getDashboardStats('TRAINER'),
            provider: auditScheduler.getDashboardStats('PROVIDER'),
            rto: auditScheduler.getDashboardStats('RTO'),
          }
        };

        return NextResponse.json({
          success: true,
          auditPack,
          message: 'Audit evidence pack generated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in audit scheduler POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}