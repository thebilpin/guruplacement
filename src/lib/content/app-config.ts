// Application Configuration
// Central place for all app branding and configuration

export const APP_CONFIG = {
  // Brand Identity
  brand: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'PlacementGuru',
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Streamline Your Placements',
    owner: process.env.NEXT_PUBLIC_BRAND_OWNER || 'PlacementGuru',
    website: process.env.NEXT_PUBLIC_BRAND_WEBSITE || 'placementguru.com.au',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@placementguru.com.au',
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@placementguru.com.au',
  },

  // Portal Information
  portals: {
    admin: {
      name: 'Admin Portal',
      description: 'Administrative Dashboard',
      defaultTitle: 'Admin Dashboard'
    },
    rto: {
      name: 'RTO Portal',
      description: 'RTO Management Dashboard'
    },
    provider: {
      name: 'Provider Portal', 
      description: 'Provider Management Dashboard'
    },
    student: {
      name: 'Student Portal',
      description: 'Student Dashboard'
    }
  },

  // Default User Information
  defaults: {
    adminUser: {
      name: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_NAME || 'Platform Administrator',
      role: 'Platform Owner',
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@placementguru.com.au'
    }
  },

  // Feature Flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
    enableIntegrations: process.env.NEXT_PUBLIC_ENABLE_INTEGRATIONS !== 'false',
    enableAI: process.env.NEXT_PUBLIC_ENABLE_AI !== 'false'
  }
} as const;