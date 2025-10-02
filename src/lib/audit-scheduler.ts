// Core Audit Scheduler Service
// Handles all compliance alerts, reminders, and audit scheduling across all dashboards

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  dashboardType: DashboardType;
  entityId: string; // student ID, trainer ID, provider ID, etc.
  entityName: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: AlertStatus;
  category: AlertCategory;
  escalationLevel: number;
  reminderDays: number[]; // [90, 60, 30, 7, 1]
  lastReminderSent?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  dashboardType: DashboardType;
  entityId: string;
  dueDate: Date;
  frequency: TaskFrequency;
  nextDueDate: Date;
  lastCompleted?: Date;
  status: TaskStatus;
  assignedTo?: string;
  priority: TaskPriority;
  reminderDays: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, { old: any; new: any }>;
}

export type AlertType = 
  | 'EXPIRY_REMINDER'
  | 'COMPLIANCE_BREACH'
  | 'DEADLINE_APPROACHING'
  | 'OVERDUE_TASK'
  | 'AUDIT_DUE'
  | 'DOCUMENT_MISSING'
  | 'VALIDATION_REQUIRED'
  | 'ESCALATION';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED' | 'DISMISSED';

export type AlertCategory = 
  | 'COMPLIANCE'
  | 'SAFETY'
  | 'DOCUMENTATION'
  | 'ASSESSMENT'
  | 'PLACEMENT'
  | 'AUDIT'
  | 'SYSTEM';

export type DashboardType = 'STUDENT' | 'TRAINER' | 'PROVIDER' | 'RTO' | 'ADMIN';

export type TaskType = 
  | 'AUDIT'
  | 'VALIDATION'
  | 'RENEWAL'
  | 'REVIEW'
  | 'REPORTING'
  | 'ASSESSMENT'
  | 'MODERATION';

export type TaskFrequency = 
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUALLY'
  | 'ANNUALLY'
  | 'CUSTOM';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// In-memory storage (replace with database in production)
let alerts: Alert[] = [];
let scheduledTasks: ScheduledTask[] = [];
let auditLogs: AuditLog[] = [];

export class AuditSchedulerService {
  private static instance: AuditSchedulerService;

  public static getInstance(): AuditSchedulerService {
    if (!AuditSchedulerService.instance) {
      AuditSchedulerService.instance = new AuditSchedulerService();
    }
    return AuditSchedulerService.instance;
  }

  // Initialize with sample data
  public initialize(): void {
    if (alerts.length === 0) {
      this.createSampleData();
    }
  }

  // Alert Management
  public createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Alert {
    const alert: Alert = {
      id: `ALT${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      ...alertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    alerts.push(alert);
    this.logAction('ALERT_CREATED', 'Alert', alert.id, 'system', `Alert created: ${alert.title}`);
    return alert;
  }

  public getAlerts(filters?: {
    dashboardType?: DashboardType;
    entityId?: string;
    status?: AlertStatus;
    severity?: AlertSeverity;
    category?: AlertCategory;
  }): Alert[] {
    let filteredAlerts = [...alerts];

    if (filters) {
      if (filters.dashboardType) {
        filteredAlerts = filteredAlerts.filter(a => a.dashboardType === filters.dashboardType);
      }
      if (filters.entityId) {
        filteredAlerts = filteredAlerts.filter(a => a.entityId === filters.entityId);
      }
      if (filters.status) {
        filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
      }
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
      }
      if (filters.category) {
        filteredAlerts = filteredAlerts.filter(a => a.category === filters.category);
      }
    }

    return filteredAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public acknowledgeAlert(alertId: string, userId: string, notes?: string): boolean {
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;

    alerts[alertIndex].status = 'ACKNOWLEDGED';
    alerts[alertIndex].acknowledgedAt = new Date();
    alerts[alertIndex].acknowledgedBy = userId;
    alerts[alertIndex].updatedAt = new Date();
    if (notes) alerts[alertIndex].notes = notes;

    this.logAction('ALERT_ACKNOWLEDGED', 'Alert', alertId, userId, `Alert acknowledged${notes ? `: ${notes}` : ''}`);
    return true;
  }

  public resolveAlert(alertId: string, userId: string, notes?: string): boolean {
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;

    alerts[alertIndex].status = 'RESOLVED';
    alerts[alertIndex].resolvedAt = new Date();
    alerts[alertIndex].resolvedBy = userId;
    alerts[alertIndex].updatedAt = new Date();
    if (notes) alerts[alertIndex].notes = notes;

    this.logAction('ALERT_RESOLVED', 'Alert', alertId, userId, `Alert resolved${notes ? `: ${notes}` : ''}`);
    return true;
  }

  // Task Management
  public createScheduledTask(taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>): ScheduledTask {
    const task: ScheduledTask = {
      id: `TSK${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    scheduledTasks.push(task);
    this.logAction('TASK_CREATED', 'ScheduledTask', task.id, 'system', `Scheduled task created: ${task.name}`);
    return task;
  }

  public getScheduledTasks(filters?: {
    dashboardType?: DashboardType;
    entityId?: string;
    status?: TaskStatus;
    type?: TaskType;
    dueWithinDays?: number;
  }): ScheduledTask[] {
    let filteredTasks = [...scheduledTasks];

    if (filters) {
      if (filters.dashboardType) {
        filteredTasks = filteredTasks.filter(t => t.dashboardType === filters.dashboardType);
      }
      if (filters.entityId) {
        filteredTasks = filteredTasks.filter(t => t.entityId === filters.entityId);
      }
      if (filters.status) {
        filteredTasks = filteredTasks.filter(t => t.status === filters.status);
      }
      if (filters.type) {
        filteredTasks = filteredTasks.filter(t => t.type === filters.type);
      }
      if (filters.dueWithinDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + filters.dueWithinDays);
        filteredTasks = filteredTasks.filter(t => t.dueDate <= cutoffDate);
      }
    }

    return filteredTasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  // Alert Generation Logic
  public generateExpiryAlerts(): void {
    const now = new Date();
    const reminderThresholds = [90, 60, 30, 7, 1]; // days before expiry

    // Check all entities for expiring documents/credentials
    this.checkStudentExpiries(now, reminderThresholds);
    this.checkTrainerExpiries(now, reminderThresholds);
    this.checkProviderExpiries(now, reminderThresholds);
    this.checkRTOExpiries(now, reminderThresholds);
  }

  private checkStudentExpiries(now: Date, thresholds: number[]): void {
    // Police Check, WWCC, Immunisation expiry reminders
    const sampleExpiryDates = [
      { type: 'Police Check', entityId: 'STU001', entityName: 'John Smith', expiryDate: new Date('2025-11-15') },
      { type: 'WWCC', entityId: 'STU002', entityName: 'Sarah Johnson', expiryDate: new Date('2025-10-20') },
      { type: 'Immunisation', entityId: 'STU003', entityName: 'Mike Brown', expiryDate: new Date('2025-10-05') },
    ];

    sampleExpiryDates.forEach(item => {
      thresholds.forEach(days => {
        const reminderDate = new Date(item.expiryDate);
        reminderDate.setDate(reminderDate.getDate() - days);
        
        if (now >= reminderDate && now < item.expiryDate) {
          const existingAlert = alerts.find(a => 
            a.entityId === item.entityId && 
            a.type === 'EXPIRY_REMINDER' && 
            a.reminderDays.includes(days) &&
            a.status === 'ACTIVE'
          );

          if (!existingAlert) {
            this.createAlert({
              type: 'EXPIRY_REMINDER',
              severity: days <= 7 ? 'HIGH' : days <= 30 ? 'MEDIUM' : 'LOW',
              title: `${item.type} Expiring Soon`,
              message: `${item.entityName}'s ${item.type} expires on ${item.expiryDate.toLocaleDateString()}`,
              dashboardType: 'STUDENT',
              entityId: item.entityId,
              entityName: item.entityName,
              dueDate: item.expiryDate,
              status: 'ACTIVE',
              category: 'COMPLIANCE',
              escalationLevel: 0,
              reminderDays: [days],
            });
          }
        }
      });
    });
  }

  private checkTrainerExpiries(now: Date, thresholds: number[]): void {
    // TAE/PD log expiry alerts, licence renewals
    const sampleExpiryDates = [
      { type: 'TAE Qualification', entityId: 'TR001', entityName: 'Sarah Mitchell', expiryDate: new Date('2025-12-01') },
      { type: 'First Aid Certificate', entityId: 'TR002', entityName: 'Michael Chen', expiryDate: new Date('2025-11-10') },
      { type: 'PD Log Review', entityId: 'TR003', entityName: 'Emily Watson', expiryDate: new Date('2025-10-15') },
    ];

    sampleExpiryDates.forEach(item => {
      thresholds.forEach(days => {
        const reminderDate = new Date(item.expiryDate);
        reminderDate.setDate(reminderDate.getDate() - days);
        
        if (now >= reminderDate && now < item.expiryDate) {
          const existingAlert = alerts.find(a => 
            a.entityId === item.entityId && 
            a.type === 'EXPIRY_REMINDER' && 
            a.reminderDays.includes(days) &&
            a.status === 'ACTIVE'
          );

          if (!existingAlert) {
            this.createAlert({
              type: 'EXPIRY_REMINDER',
              severity: days <= 7 ? 'HIGH' : days <= 30 ? 'MEDIUM' : 'LOW',
              title: `${item.type} Expiring Soon`,
              message: `${item.entityName}'s ${item.type} expires on ${item.expiryDate.toLocaleDateString()}`,
              dashboardType: 'TRAINER',
              entityId: item.entityId,
              entityName: item.entityName,
              dueDate: item.expiryDate,
              status: 'ACTIVE',
              category: 'COMPLIANCE',
              escalationLevel: 0,
              reminderDays: [days],
            });
          }
        }
      });
    });
  }

  private checkProviderExpiries(now: Date, thresholds: number[]): void {
    // MoU/Contract renewals, insurance expiry
    const sampleExpiryDates = [
      { type: 'MoU Agreement', entityId: 'PRV001', entityName: 'TechCorp Training', expiryDate: new Date('2025-12-31') },
      { type: 'Insurance Policy', entityId: 'PRV002', entityName: 'SkillBuilders Ltd', expiryDate: new Date('2025-11-30') },
      { type: 'WHS Certification', entityId: 'PRV003', entityName: 'ExpertCare Training', expiryDate: new Date('2025-10-25') },
    ];

    sampleExpiryDates.forEach(item => {
      thresholds.forEach(days => {
        const reminderDate = new Date(item.expiryDate);
        reminderDate.setDate(reminderDate.getDate() - days);
        
        if (now >= reminderDate && now < item.expiryDate) {
          const existingAlert = alerts.find(a => 
            a.entityId === item.entityId && 
            a.type === 'EXPIRY_REMINDER' && 
            a.reminderDays.includes(days) &&
            a.status === 'ACTIVE'
          );

          if (!existingAlert) {
            this.createAlert({
              type: 'EXPIRY_REMINDER',
              severity: days <= 7 ? 'HIGH' : days <= 30 ? 'MEDIUM' : 'LOW',
              title: `${item.type} Expiring Soon`,
              message: `${item.entityName}'s ${item.type} expires on ${item.expiryDate.toLocaleDateString()}`,
              dashboardType: 'PROVIDER',
              entityId: item.entityId,
              entityName: item.entityName,
              dueDate: item.expiryDate,
              status: 'ACTIVE',
              category: 'COMPLIANCE',
              escalationLevel: 0,
              reminderDays: [days],
            });
          }
        }
      });
    });
  }

  private checkRTOExpiries(now: Date, thresholds: number[]): void {
    // Internal audit schedule, training product validation, AVETMISS reporting
    const sampleExpiryDates = [
      { type: 'Internal Audit', entityId: 'RTO001', entityName: 'Annual Compliance Audit', expiryDate: new Date('2025-11-01') },
      { type: 'Training Product Validation', entityId: 'RTO002', entityName: 'IT Training Package Review', expiryDate: new Date('2025-12-15') },
      { type: 'AVETMISS Reporting', entityId: 'RTO003', entityName: 'Q4 2025 AVETMISS Submission', expiryDate: new Date('2025-10-31') },
    ];

    sampleExpiryDates.forEach(item => {
      thresholds.forEach(days => {
        const reminderDate = new Date(item.expiryDate);
        reminderDate.setDate(reminderDate.getDate() - days);
        
        if (now >= reminderDate && now < item.expiryDate) {
          const existingAlert = alerts.find(a => 
            a.entityId === item.entityId && 
            a.type === 'EXPIRY_REMINDER' && 
            a.reminderDays.includes(days) &&
            a.status === 'ACTIVE'
          );

          if (!existingAlert) {
            this.createAlert({
              type: 'EXPIRY_REMINDER',
              severity: days <= 7 ? 'CRITICAL' : days <= 30 ? 'HIGH' : 'MEDIUM',
              title: `${item.type} Due Soon`,
              message: `${item.entityName} is due on ${item.expiryDate.toLocaleDateString()}`,
              dashboardType: 'RTO',
              entityId: item.entityId,
              entityName: item.entityName,
              dueDate: item.expiryDate,
              status: 'ACTIVE',
              category: 'AUDIT',
              escalationLevel: 0,
              reminderDays: [days],
            });
          }
        }
      });
    });
  }

  // Escalation Logic
  public processEscalations(): void {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    alerts.forEach(alert => {
      if (alert.status === 'ACTIVE' && alert.createdAt < fourteenDaysAgo) {
        // Escalate unresolved alerts after 14 days
        this.escalateAlert(alert.id, 'Unresolved alert after 14 days');
      }
    });
  }

  private escalateAlert(alertId: string, reason: string): void {
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return;

    alerts[alertIndex].status = 'ESCALATED';
    alerts[alertIndex].escalationLevel += 1;
    alerts[alertIndex].updatedAt = new Date();

    // Create escalation alert
    this.createAlert({
      type: 'ESCALATION',
      severity: 'CRITICAL',
      title: 'Alert Escalated',
      message: `Alert "${alerts[alertIndex].title}" has been escalated. Reason: ${reason}`,
      dashboardType: 'ADMIN',
      entityId: alerts[alertIndex].entityId,
      entityName: alerts[alertIndex].entityName,
      dueDate: new Date(), // Immediate attention required
      status: 'ACTIVE',
      category: 'SYSTEM',
      escalationLevel: 0,
      reminderDays: [0],
      metadata: { originalAlertId: alertId, escalationReason: reason }
    });

    this.logAction('ALERT_ESCALATED', 'Alert', alertId, 'system', `Alert escalated: ${reason}`);
  }

  // Dashboard-specific alert generation
  public generateDashboardAlerts(dashboardType: DashboardType): Alert[] {
    switch (dashboardType) {
      case 'STUDENT':
        return this.generateStudentAlerts();
      case 'TRAINER':
        return this.generateTrainerAlerts();
      case 'PROVIDER':
        return this.generateProviderAlerts();
      case 'RTO':
        return this.generateRTOAlerts();
      case 'ADMIN':
        return this.generateAdminAlerts();
      default:
        return [];
    }
  }

  private generateStudentAlerts(): Alert[] {
    // Generate student-specific alerts
    const studentAlerts: Alert[] = [];

    // Placement hours compliance alerts
    const placementProgress = [
      { studentId: 'STU001', name: 'John Smith', required: 240, completed: 180, percentage: 75 },
      { studentId: 'STU002', name: 'Sarah Johnson', required: 320, completed: 150, percentage: 47 },
    ];

    placementProgress.forEach(student => {
      if (student.percentage < 60) { // Less than 60% progress
        studentAlerts.push({
          id: `PLH${student.studentId}${Date.now()}`,
          type: 'COMPLIANCE_BREACH',
          severity: 'HIGH',
          title: 'Placement Hours Behind Schedule',
          message: `${student.name} has completed only ${student.percentage}% of required placement hours (${student.completed}/${student.required} hours)`,
          dashboardType: 'STUDENT',
          entityId: student.studentId,
          entityName: student.name,
          dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days to catch up
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'ACTIVE',
          category: 'PLACEMENT',
          escalationLevel: 0,
          reminderDays: [7, 3, 1],
        });
      }
    });

    return studentAlerts;
  }

  private generateTrainerAlerts(): Alert[] {
    // Generate trainer-specific alerts
    const trainerAlerts: Alert[] = [];

    // PD log expiry alerts (11 months since last PD)
    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    const trainersNeedingPD = [
      { trainerId: 'TR001', name: 'Sarah Mitchell', lastPD: new Date('2024-09-01') },
      { trainerId: 'TR002', name: 'Michael Chen', lastPD: new Date('2024-08-15') },
    ];

    trainersNeedingPD.forEach(trainer => {
      if (trainer.lastPD < elevenMonthsAgo) {
        trainerAlerts.push({
          id: `PDL${trainer.trainerId}${Date.now()}`,
          type: 'DEADLINE_APPROACHING',
          severity: 'MEDIUM',
          title: 'Professional Development Due',
          message: `${trainer.name} needs to complete professional development. Last PD was on ${trainer.lastPD.toLocaleDateString()}`,
          dashboardType: 'TRAINER',
          entityId: trainer.trainerId,
          entityName: trainer.name,
          dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'ACTIVE',
          category: 'COMPLIANCE',
          escalationLevel: 0,
          reminderDays: [14, 7, 3],
        });
      }
    });

    return trainerAlerts;
  }

  private generateProviderAlerts(): Alert[] {
    return this.getAlerts({ dashboardType: 'PROVIDER' });
  }

  private generateRTOAlerts(): Alert[] {
    return this.getAlerts({ dashboardType: 'RTO' });
  }

  private generateAdminAlerts(): Alert[] {
    // Master view of all dashboard alerts
    return this.getAlerts();
  }

  // Audit Logging
  public logAction(action: string, entityType: string, entityId: string, userId: string, details: string): void {
    const logEntry: AuditLog = {
      id: `LOG${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
      action,
      entityType,
      entityId,
      userId,
      userEmail: userId.includes('@') ? userId : `${userId}@placementguru.com`,
      timestamp: new Date(),
      details,
      ipAddress: '192.168.1.100', // Placeholder
      userAgent: 'AuditSchedulerService',
    };
    auditLogs.push(logEntry);
  }

  public getAuditLogs(filters?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
  }): AuditLog[] {
    let filteredLogs = [...auditLogs];

    if (filters) {
      if (filters.entityType) {
        filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
      }
      if (filters.entityId) {
        filteredLogs = filteredLogs.filter(log => log.entityId === filters.entityId);
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.fromDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.fromDate!);
      }
      if (filters.toDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.toDate!);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Dashboard Statistics
  public getDashboardStats(dashboardType: DashboardType): any {
    const dashboardAlerts = this.getAlerts({ dashboardType });
    const dashboardTasks = this.getScheduledTasks({ dashboardType });

    return {
      totalAlerts: dashboardAlerts.length,
      activeAlerts: dashboardAlerts.filter(a => a.status === 'ACTIVE').length,
      criticalAlerts: dashboardAlerts.filter(a => a.severity === 'CRITICAL').length,
      overdueAlerts: dashboardAlerts.filter(a => a.dueDate < new Date() && a.status === 'ACTIVE').length,
      totalTasks: dashboardTasks.length,
      overdueTasks: dashboardTasks.filter(t => t.dueDate < new Date() && t.status !== 'COMPLETED').length,
      upcomingTasks: dashboardTasks.filter(t => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return t.dueDate <= thirtyDaysFromNow && t.status !== 'COMPLETED';
      }).length,
    };
  }

  // Initialize sample data
  private createSampleData(): void {
    console.log('🚀 Initializing audit scheduler data...');

    // Generate initial alerts
    this.generateExpiryAlerts();

    // Create some audit logs
    this.logAction('SYSTEM_INITIALIZED', 'System', 'AUDIT_SCHEDULER', 'system', 'Audit scheduler service initialized');
    
    console.log(`✅ Audit scheduler initialized: ${alerts.length} alerts, ${scheduledTasks.length} tasks, ${auditLogs.length} logs`);
  }
}

// Export singleton instance
export const auditScheduler = AuditSchedulerService.getInstance();