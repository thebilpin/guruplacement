import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';

    console.log(`⚙️ Fetching settings - section: ${section}`);

    switch (section) {
      case 'general':
        return await getGeneralSettings();
      case 'roles':
        return await getRolesSettings();
      case 'notifications':
        return await getNotificationSettings();
      case 'security':
        return await getSecuritySettings();
      case 'all':
      default:
        return await getAllSettings();
    }
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { section, settings, action } = await request.json();
    console.log(`⚙️ Updating settings - section: ${section}, action: ${action}`);

    switch (section) {
      case 'general':
        return await updateGeneralSettings(settings);
      case 'roles':
        return await updateRolesSettings(settings);
      case 'notifications':
        return await updateNotificationSettings(settings);
      case 'security':
        return await updateSecuritySettings(settings);
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getAllSettings() {
  try {
    // Try to get existing settings document
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    let settings = {};

    if (!settingsSnapshot.empty) {
      settings = settingsSnapshot.docs[0].data();
    } else {
      // Create default settings if none exist
      settings = getDefaultSettings();
      await collections.systemSettings().add({
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching all settings:', error);
    throw error;
  }
}

async function getGeneralSettings() {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    const settings = !settingsSnapshot.empty ? settingsSnapshot.docs[0].data() : getDefaultSettings();
    
    return NextResponse.json({
      success: true,
      data: settings.general || getDefaultSettings().general,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching general settings:', error);
    throw error;
  }
}

async function getRolesSettings() {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    const settings = !settingsSnapshot.empty ? settingsSnapshot.docs[0].data() : getDefaultSettings();
    
    return NextResponse.json({
      success: true,
      data: settings.roles || getDefaultSettings().roles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching roles settings:', error);
    throw error;
  }
}

async function getNotificationSettings() {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    const settings = !settingsSnapshot.empty ? settingsSnapshot.docs[0].data() : getDefaultSettings();
    
    return NextResponse.json({
      success: true,
      data: settings.notifications || getDefaultSettings().notifications,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching notification settings:', error);
    throw error;
  }
}

async function getSecuritySettings() {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    const settings = !settingsSnapshot.empty ? settingsSnapshot.docs[0].data() : getDefaultSettings();
    
    return NextResponse.json({
      success: true,
      data: settings.security || getDefaultSettings().security,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching security settings:', error);
    throw error;
  }
}

async function updateGeneralSettings(newSettings: any) {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    
    if (settingsSnapshot.empty) {
      // Create new settings document
      const defaultSettings = getDefaultSettings();
      defaultSettings.general = { ...defaultSettings.general, ...newSettings };
      
      await collections.systemSettings().add({
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing settings
      const docRef = settingsSnapshot.docs[0].ref;
      const currentData = settingsSnapshot.docs[0].data();
      
      await docRef.update({
        general: { ...currentData.general, ...newSettings },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'General settings updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating general settings:', error);
    throw error;
  }
}

async function updateRolesSettings(newSettings: any) {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    
    if (settingsSnapshot.empty) {
      const defaultSettings = getDefaultSettings();
      defaultSettings.roles = { ...defaultSettings.roles, ...newSettings };
      
      await collections.systemSettings().add({
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      const docRef = settingsSnapshot.docs[0].ref;
      const currentData = settingsSnapshot.docs[0].data();
      
      await docRef.update({
        roles: { ...currentData.roles, ...newSettings },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Role settings updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating role settings:', error);
    throw error;
  }
}

async function updateNotificationSettings(newSettings: any) {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    
    if (settingsSnapshot.empty) {
      const defaultSettings = getDefaultSettings();
      defaultSettings.notifications = { ...defaultSettings.notifications, ...newSettings };
      
      await collections.systemSettings().add({
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      const docRef = settingsSnapshot.docs[0].ref;
      const currentData = settingsSnapshot.docs[0].data();
      
      await docRef.update({
        notifications: { ...currentData.notifications, ...newSettings },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    throw error;
  }
}

async function updateSecuritySettings(newSettings: any) {
  try {
    const settingsSnapshot = await collections.systemSettings().limit(1).get();
    
    if (settingsSnapshot.empty) {
      const defaultSettings = getDefaultSettings();
      defaultSettings.security = { ...defaultSettings.security, ...newSettings };
      
      await collections.systemSettings().add({
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      const docRef = settingsSnapshot.docs[0].ref;
      const currentData = settingsSnapshot.docs[0].data();
      
      await docRef.update({
        security: { ...currentData.security, ...newSettings },
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating security settings:', error);
    throw error;
  }
}

function getDefaultSettings() {
  return {
    general: {
      platformName: 'PlacementGuru',
      defaultLanguage: 'en',
      timezone: 'Australia/Sydney',
      dateFormat: 'DD/MM/YYYY',
      currency: 'AUD',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
    },
    roles: {
      defaultRole: 'student',
      roleHierarchy: {
        platform_admin: 100,
        admin: 90,
        rto_admin: 70,
        provider_admin: 70,
        supervisor: 50,
        assessor: 40,
        student: 10,
      },
      permissions: {
        platform_admin: ['*'],
        admin: ['users:*', 'settings:*', 'reports:*'],
        rto_admin: ['students:*', 'courses:*', 'assessments:*'],
        provider_admin: ['placements:*', 'supervisors:*'],
        supervisor: ['students:read', 'assessments:write'],
        assessor: ['assessments:*'],
        student: ['profile:write', 'placements:read'],
      },
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      digestFrequency: 'daily',
      notificationTypes: {
        placementUpdates: true,
        assessmentReminders: true,
        systemAnnouncements: true,
        complianceAlerts: true,
        userRegistrations: true,
      },
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      accountLockoutDuration: 30, // minutes
      twoFactorEnabled: false,
      ipWhitelisting: false,
      auditLogging: true,
    },
  };
}