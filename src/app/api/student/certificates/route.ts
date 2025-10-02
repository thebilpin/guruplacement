// Student Certificates API - Manage student certificates and achievements
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🏆 Fetching Student certificates...');

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const status = url.searchParams.get('status'); // valid, expired, expiring
    const category = url.searchParams.get('category'); // professional, safety, compliance

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Get student data
    const studentDoc = await collections.students().doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Get certificates
    const certificatesSnapshot = await collections.certificates()
      .where('studentId', '==', studentId)
      .orderBy('issuedDate', 'desc')
      .get();

    const certificates = certificatesSnapshot.docs.map(doc => {
      const certData = doc.data();
      const expiryDate = certData.expiryDate ? new Date(certData.expiryDate) : null;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      let certificateStatus = 'valid';
      if (expiryDate) {
        if (expiryDate <= now) {
          certificateStatus = 'expired';
        } else if (expiryDate <= thirtyDaysFromNow) {
          certificateStatus = 'expiring';
        }
      }

      return {
        id: doc.id,
        name: certData.name || certData.title || 'Unknown Certificate',
        issuer: certData.issuer || 'Unknown Issuer',
        issuedDate: certData.issuedDate,
        expiryDate: certData.expiryDate,
        status: certificateStatus,
        category: certData.category || 'professional',
        certificateNumber: certData.certificateNumber || certData.credentialId,
        description: certData.description || '',
        verificationUrl: certData.verificationUrl || '',
        documentUrl: certData.documentUrl || '',
        skills: certData.skills || [],
        requirements: certData.requirements || [],
        renewalRequired: certData.renewalRequired || false,
        renewalPeriod: certData.renewalPeriod || null,
        tags: certData.tags || [],
        isVerified: certData.isVerified || false,
        createdAt: certData.createdAt,
        updatedAt: certData.updatedAt
      };
    });

    // Apply filters
    let filteredCertificates = certificates;

    if (status) {
      filteredCertificates = filteredCertificates.filter(cert => cert.status === status);
    }

    if (category) {
      filteredCertificates = filteredCertificates.filter(cert => cert.category === category);
    }

    // Get achievements/badges (using certificates as achievements for now)
    const achievements = [
      {
        id: 'consistent-learner',
        name: 'Consistent Learner',
        description: 'Completed learning activities for 7 consecutive days',
        icon: '🎯',
        category: 'learning',
        earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        points: 100
      },
      {
        id: 'placement-ready',
        name: 'Placement Ready',
        description: 'Completed all pre-placement requirements',
        icon: '✅',
        category: 'compliance',
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        points: 250
      },
      {
        id: 'safety-champion',
        name: 'Safety Champion',
        description: 'Completed all safety training modules',
        icon: '🛡️',
        category: 'safety',
        earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        points: 150
      }
    ];

    // Calculate statistics
    const stats = {
      total: filteredCertificates.length,
      valid: filteredCertificates.filter(cert => cert.status === 'valid').length,
      expiring: filteredCertificates.filter(cert => cert.status === 'expiring').length,
      expired: filteredCertificates.filter(cert => cert.status === 'expired').length,
      byCategory: {
        professional: filteredCertificates.filter(cert => cert.category === 'professional').length,
        safety: filteredCertificates.filter(cert => cert.category === 'safety').length,
        compliance: filteredCertificates.filter(cert => cert.category === 'compliance').length,
        technical: filteredCertificates.filter(cert => cert.category === 'technical').length
      },
      achievementsEarned: achievements.length,
      totalPoints: achievements.reduce((sum, achievement) => sum + achievement.points, 0)
    };

    // Get upcoming renewal deadlines
    const upcomingRenewals = filteredCertificates
      .filter(cert => cert.expiryDate && cert.renewalRequired)
      .filter(cert => {
        const expiryDate = new Date(cert.expiryDate);
        const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        return expiryDate <= sixtyDaysFromNow && expiryDate > new Date();
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 5);

    const response = {
      success: true,
      certificates: filteredCertificates,
      achievements,
      stats,
      upcomingRenewals,
      student: {
        id: studentId,
        name: studentData?.name || 'Student',
        course: studentData?.courseName || 'Unknown Course'
      },
      filters: {
        status,
        category
      }
    };

    console.log('✅ Student certificates fetched successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching Student certificates:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch certificates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📜 Uploading Student certificate...');
    
    const body = await request.json();
    const { studentId, certificateData } = body;

    if (!studentId || !certificateData) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and certificate data are required'
      }, { status: 400 });
    }

    // Verify student exists
    const studentDoc = await collections.students().doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    // Create certificate record
    const certificateRef = collections.certificates().doc();
    const certificate = {
      studentId,
      name: certificateData.name,
      issuer: certificateData.issuer,
      issuedDate: certificateData.issuedDate || new Date().toISOString(),
      expiryDate: certificateData.expiryDate || null,
      category: certificateData.category || 'professional',
      certificateNumber: certificateData.certificateNumber || '',
      description: certificateData.description || '',
      verificationUrl: certificateData.verificationUrl || '',
      documentUrl: certificateData.documentUrl || '',
      skills: certificateData.skills || [],
      requirements: certificateData.requirements || [],
      renewalRequired: certificateData.renewalRequired || false,
      renewalPeriod: certificateData.renewalPeriod || null,
      tags: certificateData.tags || [],
      isVerified: false, // Needs verification
      uploadedBy: studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await certificateRef.set(certificate);

    // Create notification for verification
    const notificationRef = collections.notifications().doc();
    await notificationRef.set({
      userId: studentId,
      type: 'certificate_uploaded',
      title: 'Certificate Uploaded',
      message: `Your ${certificateData.name} certificate has been uploaded and is pending verification.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      certificateId: certificateRef.id,
      message: 'Certificate uploaded successfully and is pending verification'
    });

  } catch (error) {
    console.error('Error uploading Student certificate:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating Student certificate...');
    
    const body = await request.json();
    const { certificateId, updates } = body;

    if (!certificateId) {
      return NextResponse.json({
        success: false,
        error: 'Certificate ID is required'
      }, { status: 400 });
    }

    // Verify certificate exists and belongs to student
    const certificateRef = collections.certificates().doc(certificateId);
    const certificateDoc = await certificateRef.get();

    if (!certificateDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Certificate not found'
      }, { status: 404 });
    }

    // Update certificate
    await certificateRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate updated successfully'
    });

  } catch (error) {
    console.error('Error updating Student certificate:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting Student certificate...');
    
    const url = new URL(request.url);
    const certificateId = url.searchParams.get('certificateId');

    if (!certificateId) {
      return NextResponse.json({
        success: false,
        error: 'Certificate ID is required'
      }, { status: 400 });
    }

    // Verify certificate exists
    const certificateRef = collections.certificates().doc(certificateId);
    const certificateDoc = await certificateRef.get();

    if (!certificateDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Certificate not found'
      }, { status: 404 });
    }

    // Delete certificate
    await certificateRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Certificate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Student certificate:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}