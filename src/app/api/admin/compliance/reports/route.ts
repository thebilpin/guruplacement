import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';

    console.log(`📊 Generating ${reportType} report...`);

    // Get compliance data
    const complianceSnapshot = await collections.complianceRecords().get();
    const complianceRecords = complianceSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));

    // Get activity logs for audit trail (simplified query)
    const auditSnapshot = await collections.activityLogs()
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const auditLogs = auditSnapshot.docs
      .filter((doc: any) => ['audit', 'compliance_alert', 'compliance_action'].includes(doc.data().type))
      .slice(0, 100)
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));

    let reportData: any = {};
    let reportTitle = '';

    switch (reportType) {
      case 'summary':
        reportData = generateSummaryReport(complianceRecords);
        reportTitle = 'Compliance Summary Report';
        break;
      
      case 'audit-trail':
        reportData = generateAuditTrailReport(auditLogs);
        reportTitle = 'Audit Trail Report';
        break;
      
      case 'document-expiry':
        reportData = generateDocumentExpiryReport(complianceRecords);
        reportTitle = 'Document Expiry Report';
        break;
      
      case 'organization-status':
        reportData = generateOrganizationStatusReport(complianceRecords);
        reportTitle = 'Organization Status Report';
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }

    // Generate PDF content (simplified HTML version)
    const htmlContent = generateReportHTML(reportTitle, reportData, reportType);

    // In a real implementation, you would use a PDF library like puppeteer or jsPDF
    // For now, we'll return the HTML content
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="compliance-${reportType}-report-${new Date().toISOString().split('T')[0]}.html"`
      }
    });

  } catch (error) {
    console.error('❌ Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateSummaryReport(complianceRecords: any[]) {
  const totalOrganizations = complianceRecords.length;
  const compliantOrganizations = complianceRecords.filter(r => r.status === 'compliant').length;
  const nonCompliantOrganizations = complianceRecords.filter(r => r.status === 'non_compliant').length;
  const underReviewOrganizations = complianceRecords.filter(r => r.status === 'under_review').length;

  const rtoRecords = complianceRecords.filter(r => r.organizationType === 'rto');
  const providerRecords = complianceRecords.filter(r => r.organizationType === 'provider');
  const studentRecords = complianceRecords.filter(r => r.organizationType === 'student');

  return {
    overview: {
      totalOrganizations,
      compliantOrganizations,
      nonCompliantOrganizations,
      underReviewOrganizations,
      complianceRate: totalOrganizations > 0 ? Math.round((compliantOrganizations / totalOrganizations) * 100) : 0
    },
    byType: {
      rtos: {
        total: rtoRecords.length,
        compliant: rtoRecords.filter(r => r.status === 'compliant').length,
        averageScore: rtoRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (rtoRecords.length || 1)
      },
      providers: {
        total: providerRecords.length,
        compliant: providerRecords.filter(r => r.status === 'compliant').length,
        averageScore: providerRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (providerRecords.length || 1)
      },
      students: {
        total: studentRecords.length,
        compliant: studentRecords.filter(r => r.status === 'compliant').length,
        averageScore: studentRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (studentRecords.length || 1)
      }
    },
    riskAnalysis: {
      highRisk: complianceRecords.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length,
      mediumRisk: complianceRecords.filter(r => r.riskLevel === 'medium').length,
      lowRisk: complianceRecords.filter(r => r.riskLevel === 'low').length
    }
  };
}

function generateAuditTrailReport(auditLogs: any[]) {
  const auditEvents = auditLogs.filter(log => log.type === 'audit');
  const complianceActions = auditLogs.filter(log => log.type === 'compliance_action');
  const alerts = auditLogs.filter(log => log.type === 'compliance_alert');

  return {
    summary: {
      totalEvents: auditLogs.length,
      auditEvents: auditEvents.length,
      complianceActions: complianceActions.length,
      alerts: alerts.length
    },
    recentEvents: auditLogs.slice(0, 50).map(log => ({
      date: log.createdAt.toLocaleDateString(),
      time: log.createdAt.toLocaleTimeString(),
      type: log.type,
      action: log.action || log.alertType || 'Audit',
      user: log.performedBy || log.auditorName || 'System',
      details: log.description || log.message || 'N/A'
    }))
  };
}

function generateDocumentExpiryReport(complianceRecords: any[]) {
  const now = new Date();
  const allDocuments = complianceRecords.flatMap(record => 
    (record.submittedDocuments || []).map((doc: any) => ({
      ...doc,
      organizationName: record.organizationName,
      organizationType: record.organizationType
    }))
  );

  const expiringDocuments = allDocuments.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  });

  const expiredDocuments = allDocuments.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate < now;
  });

  return {
    summary: {
      totalDocuments: allDocuments.length,
      expiringDocuments: expiringDocuments.length,
      expiredDocuments: expiredDocuments.length,
      validDocuments: allDocuments.filter(doc => doc.status === 'valid').length
    },
    expiringDocuments: expiringDocuments.map(doc => ({
      documentName: doc.name,
      organizationName: doc.organizationName,
      organizationType: doc.organizationType,
      expiryDate: new Date(doc.expiryDate).toLocaleDateString(),
      daysUntilExpiry: Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      priority: doc.priority || 'medium'
    })),
    expiredDocuments: expiredDocuments.map(doc => ({
      documentName: doc.name,
      organizationName: doc.organizationName,
      organizationType: doc.organizationType,
      expiryDate: new Date(doc.expiryDate).toLocaleDateString(),
      daysOverdue: Math.ceil((now.getTime() - new Date(doc.expiryDate).getTime()) / (1000 * 60 * 60 * 24))
    }))
  };
}

function generateOrganizationStatusReport(complianceRecords: any[]) {
  return {
    summary: {
      totalOrganizations: complianceRecords.length,
      compliantOrganizations: complianceRecords.filter(r => r.status === 'compliant').length,
      nonCompliantOrganizations: complianceRecords.filter(r => r.status === 'non_compliant').length,
      underReviewOrganizations: complianceRecords.filter(r => r.status === 'under_review').length
    },
    organizations: complianceRecords.map(record => ({
      name: record.organizationName,
      type: record.organizationType,
      status: record.status,
      overallScore: record.overallScore || 0,
      riskLevel: record.riskLevel || 'low',
      lastAuditDate: record.lastAuditDate ? new Date(record.lastAuditDate).toLocaleDateString() : 'N/A',
      nextAuditDue: record.nextAuditDue ? new Date(record.nextAuditDue).toLocaleDateString() : 'N/A',
      missingDocuments: (record.missingDocuments || []).length,
      expiringDocuments: (record.expiringDocuments || []).length
    }))
  };
}

function generateReportHTML(title: string, data: any, reportType: string): string {
  const currentDate = new Date().toLocaleDateString();
  
  let contentHTML = '';

  switch (reportType) {
    case 'summary':
      contentHTML = `
        <div class="section">
          <h2>Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Organizations</h3>
              <div class="stat-value">${data.overview.totalOrganizations}</div>
            </div>
            <div class="stat-card">
              <h3>Compliant Organizations</h3>
              <div class="stat-value">${data.overview.compliantOrganizations}</div>
            </div>
            <div class="stat-card">
              <h3>Compliance Rate</h3>
              <div class="stat-value">${data.overview.complianceRate}%</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>By Organization Type</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Total</th>
                <th>Compliant</th>
                <th>Average Score</th>
                <th>Compliance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>RTOs</td>
                <td>${data.byType.rtos.total}</td>
                <td>${data.byType.rtos.compliant}</td>
                <td>${Math.round(data.byType.rtos.averageScore)}/100</td>
                <td>${data.byType.rtos.total > 0 ? Math.round((data.byType.rtos.compliant / data.byType.rtos.total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td>Providers</td>
                <td>${data.byType.providers.total}</td>
                <td>${data.byType.providers.compliant}</td>
                <td>${Math.round(data.byType.providers.averageScore)}/100</td>
                <td>${data.byType.providers.total > 0 ? Math.round((data.byType.providers.compliant / data.byType.providers.total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td>Students</td>
                <td>${data.byType.students.total}</td>
                <td>${data.byType.students.compliant}</td>
                <td>${Math.round(data.byType.students.averageScore)}/100</td>
                <td>${data.byType.students.total > 0 ? Math.round((data.byType.students.compliant / data.byType.students.total) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      break;

    case 'audit-trail':
      contentHTML = `
        <div class="section">
          <h2>Audit Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Events</h3>
              <div class="stat-value">${data.summary.totalEvents}</div>
            </div>
            <div class="stat-card">
              <h3>Audit Events</h3>
              <div class="stat-value">${data.summary.auditEvents}</div>
            </div>
            <div class="stat-card">
              <h3>Compliance Actions</h3>
              <div class="stat-value">${data.summary.complianceActions}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Recent Events</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${data.recentEvents.map((event: any) => `
                <tr>
                  <td>${event.date}</td>
                  <td>${event.time}</td>
                  <td>${event.type}</td>
                  <td>${event.action}</td>
                  <td>${event.user}</td>
                  <td>${event.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      break;

    case 'document-expiry':
      contentHTML = `
        <div class="section">
          <h2>Document Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Documents</h3>
              <div class="stat-value">${data.summary.totalDocuments}</div>
            </div>
            <div class="stat-card">
              <h3>Expiring Soon</h3>
              <div class="stat-value">${data.summary.expiringDocuments}</div>
            </div>
            <div class="stat-card">
              <h3>Expired</h3>
              <div class="stat-value">${data.summary.expiredDocuments}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Expiring Documents</h2>
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Organization</th>
                <th>Type</th>
                <th>Expiry Date</th>
                <th>Days Until Expiry</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${data.expiringDocuments.map((doc: any) => `
                <tr>
                  <td>${doc.documentName}</td>
                  <td>${doc.organizationName}</td>
                  <td>${doc.organizationType}</td>
                  <td>${doc.expiryDate}</td>
                  <td>${doc.daysUntilExpiry}</td>
                  <td>${doc.priority}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      break;

    case 'organization-status':
      contentHTML = `
        <div class="section">
          <h2>Organization Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Organizations</h3>
              <div class="stat-value">${data.summary.totalOrganizations}</div>
            </div>
            <div class="stat-card">
              <h3>Compliant</h3>
              <div class="stat-value">${data.summary.compliantOrganizations}</div>
            </div>
            <div class="stat-card">
              <h3>Non-Compliant</h3>
              <div class="stat-value">${data.summary.nonCompliantOrganizations}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Organization Details</h2>
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Status</th>
                <th>Score</th>
                <th>Risk Level</th>
                <th>Last Audit</th>
                <th>Next Audit</th>
                <th>Missing Docs</th>
              </tr>
            </thead>
            <tbody>
              ${data.organizations.map((org: any) => `
                <tr>
                  <td>${org.name}</td>
                  <td>${org.type}</td>
                  <td>${org.status}</td>
                  <td>${org.overallScore}/100</td>
                  <td>${org.riskLevel}</td>
                  <td>${org.lastAuditDate}</td>
                  <td>${org.nextAuditDue}</td>
                  <td>${org.missingDocuments}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .header h1 { color: #1e40af; margin: 0; }
        .header p { margin: 10px 0 0 0; color: #666; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
        .stat-card h3 { margin: 0 0 10px 0; color: #64748b; font-size: 14px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; color: #1e40af; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Generated on ${currentDate} by PlacementGuru Compliance System</p>
      </div>
      
      ${contentHTML}
      
      <div class="footer">
        <p>This report was automatically generated by PlacementGuru's Compliance Management System.</p>
        <p>For questions about this report, please contact the compliance team.</p>
      </div>
    </body>
    </html>
  `;
}