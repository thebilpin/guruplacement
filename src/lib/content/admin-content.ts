// Admin Portal Content
// All text content for admin pages centralized here

export const ADMIN_CONTENT = {
  // Navigation & Layout
  layout: {
    title: 'Admin Dashboard',
    portal: {
      name: 'Admin Portal',
      description: 'Administrative Dashboard'
    },
    navigation: {
      groups: {
        general: 'General',
        compliance: 'Compliance & Monitoring',
        content: 'Content & Data',
        configuration: 'Configuration'
      },
      items: {
        dashboard: 'Dashboard',
        users: 'Users',
        verification: 'User Verification',
        announcements: 'Announcements',
        support: 'Support',
        compliance: 'Compliance Overview',
        studentCompliance: 'Student Compliance Tracker',
        trainerCredentials: 'Trainer/Assessor Credentials',
        auditScheduler: 'Audit Scheduler & Alerts',
        complianceHeatmap: 'Compliance Heatmap',
        complianceAlerts: 'System Compliance Alerts',
        feedbackLogs: 'Feedback & Improvement Logs',
        auditLogs: 'Audit Log & Evidence Export',
        finance: 'Finance',
        dataTools: 'Data Tools',
        analytics: 'Analytics',
        integrations: 'Integrations',
        theming: 'Theming',
        settings: 'Settings',
        sandbox: 'Sandbox'
      }
    },
    search: {
      placeholder: 'Search users, settings...',
      noResults: 'No results found'
    },
    notifications: {
      title: 'Notifications',
      unreadCount: (count: number) => `${count} unread`,
      viewAll: 'View All Notifications',
      markAsRead: 'Mark as read',
      examples: {
        userRegistration: 'New User Registration',
        systemUpdate: 'System Update',
        paymentProcessed: 'Payment Processed'
      }
    },
    profile: {
      viewProfile: 'View Profile',
      settings: 'Settings',
      logout: 'Logout',
      confirmLogout: 'Are you sure you want to logout?'
    }
  },

  // Profile Modal
  profileModal: {
    title: 'Super Admin Profile',
    description: 'View and edit your profile information',
    fields: {
      fullName: 'Full Name',
      email: 'Email Address',
      role: 'Role'
    },
    placeholders: {
      fullName: 'Enter your full name',
      email: 'Enter your email address'
    },
    buttons: {
      changePhoto: 'Change Photo',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      close: 'Close'
    },
    status: {
      lastUpdated: 'Last updated: Today',
      saving: 'Saving...'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Global Dashboard',
    description: 'A high-level overview of the entire platform.',
    exportButton: 'Export Summary',
    kpis: {
      totalUsers: {
        title: 'Total Users',
        description: 'All Platform Users'
      },
      activeRtos: {
        title: 'Active RTOs',
        description: (total: number) => `${total} total registered`
      },
      totalProviders: {
        title: 'Total Providers',
        description: (verified: number) => `${verified} verified`
      },
      studentsEnrolled: {
        title: 'Students Enrolled',
        description: (placements: number) => `${placements} in placement`
      }
    },
    verification: {
      title: 'User Verification Status',
      manageButton: 'Manage Verifications',
      statuses: {
        pending: 'Pending Review',
        underReview: 'Under Review',
        verified: 'Verified',
        rejected: 'Rejected'
      }
    },
    charts: {
      userRegistrations: 'New User Registrations (Last 6 Months)'
    }
  },

  // Analytics
  analytics: {
    title: 'Predictive Analytics',
    description: 'Analyze trends, predict churn, and gain deep insights into platform usage.',
    exportButton: 'Export Analytics Data',
    charts: {
      successRate: {
        title: 'Overall Placement Success Rate',
        description: 'Monthly trend of successful placement completions.'
      },
      churnPrediction: {
        title: 'Churn Prediction (Last 30 Days)',
        description: 'Predicted number of churning providers and RTOs.'
      },
      placementDrilldown: {
        title: 'Placement Drilldown by Category'
      }
    },
    categories: {
      healthcare: 'Healthcare',
      technology: 'Technology',
      education: 'Education',
      business: 'Business'
    }
  },

  // Users Management
  users: {
    title: 'User Management',
    description: 'Manage all platform users and their roles.',
    filters: {
      all: 'All Users',
      admin: 'Admins',
      rto: 'RTOs',
      provider: 'Providers',
      student: 'Students',
      supervisor: 'Supervisors',
      assessor: 'Assessors'
    },
    table: {
      headers: {
        name: 'Name',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        lastLogin: 'Last Login',
        actions: 'Actions'
      }
    },
    roles: {
      admin: 'Admin',
      rto: 'RTO',
      provider: 'Provider',
      student: 'Student',
      supervisor: 'Supervisor',
      assessor: 'Assessor'
    },
    lastLogin: {
      never: 'Never',
      justNow: 'Just now',
      hoursAgo: (hours: number) => `${hours}h ago`,
      daysAgo: (days: number) => `${days}d ago`
    },
    actions: {
      viewDetails: 'View Details',
      editRole: 'Edit Role',
      resetPassword: 'Reset Password',
      suspend: 'Suspend User',
      addUser: 'Add User'
    }
  },

  // Compliance
  compliance: {
    title: 'Compliance Overview',
    description: 'Monitor compliance status across all organizations.',
    stats: {
      totalOrganizations: 'Total Organizations',
      compliant: 'Compliant Organizations',
      nonCompliant: 'Non-Compliant Organizations',
      underReview: 'Under Review',
      documents: {
        total: 'Total Documents',
        valid: 'Valid Documents',
        expired: 'Expired Documents',
        expiring: 'Expiring Documents',
        missing: 'Missing Documents'
      },
      alerts: {
        critical: 'Critical Alerts',
        highPriority: 'High Priority Alerts',
        totalActive: 'Total Active Alerts'
      }
    },
    sections: {
      recentAudits: 'Recent Audits',
      activeAlerts: 'Active Alerts',
      expiringDocuments: 'Expiring Documents'
    }
  },

  // Announcements
  announcements: {
    title: 'Announcements Management',
    description: 'Create and manage platform-wide announcements.',
    form: {
      title: 'Announcement Title',
      content: 'Content',
      type: 'Type',
      targetRoles: 'Target Roles',
      allUsers: 'All Users',
      sendImmediately: 'Send Immediately',
      schedule: 'Schedule for Later',
      image: 'Image URL',
      actionButton: 'Action Button Text',
      actionUrl: 'Action Button URL'
    },
    types: {
      info: 'Information',
      warning: 'Warning',
      success: 'Success',
      error: 'Error'
    },
    statuses: {
      draft: 'Draft',
      scheduled: 'Scheduled',
      published: 'Published',
      archived: 'Archived',
      cancelled: 'Cancelled'
    },
    validation: {
      selectRoles: 'Please select at least one target role or enable "All Users"'
    }
  },

  // Integrations
  integrations: {
    title: 'API Keys & Integrations',
    description: 'Manage API keys, webhooks, and third-party integrations.',
    sections: {
      apiKeys: 'API Keys',
      webhooks: 'Webhooks',
      marketplace: 'Integration Marketplace'
    },
    buttons: {
      createKey: 'Create New Key',
      addWebhook: 'Add Webhook',
      copy: 'Copy',
      delete: 'Delete'
    },
    table: {
      headers: {
        name: 'Name',
        keyId: 'Key ID',
        url: 'URL',
        events: 'Events',
        created: 'Created',
        lastUsed: 'Last Used',
        status: 'Status',
        actions: 'Actions'
      }
    },
    statuses: {
      active: 'Active',
      revoked: 'Revoked',
      failing: 'Failing'
    },
    marketplace: {
      comingSoon: 'Marketplace coming soon!'
    }
  },

  // Common UI Elements
  common: {
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      apply: 'Apply',
      close: 'Close',
      submit: 'Submit',
      reset: 'Reset'
    },
    states: {
      loading: 'Loading...',
      saving: 'Saving...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    },
    messages: {
      noData: 'No data available',
      noResults: 'No results found',
      confirmDelete: 'Are you sure you want to delete this item?',
      unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?'
    }
  }
} as const;