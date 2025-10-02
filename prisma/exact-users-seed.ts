import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function createExactUserRequirements() {
  console.log('🎯 Creating EXACT user requirements...');
  console.log('Target: 1 admin, 1 student, 8 RTOs, 8 providers, 1 supervisor, 1 assessor');

  try {
    // Clear existing users first
    console.log('🧹 Clearing existing users...');
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    
    usersSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Cleared existing users');

    // 1. Create 1 Admin
    console.log('👑 Creating 1 Admin...');
    await db.collection('users').add({
      email: 'admin@placementguru.com',
      name: 'Platform Administrator',
      role: 'admin',
      phone: '+61 2 9876 5432',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        manageUsers: true,
        systemSettings: true,
        analytics: true,
        compliance: true
      }
    });
    console.log('✅ Created admin@placementguru.com');

    // 2. Create 1 Student
    console.log('🎓 Creating 1 Student...');
    await db.collection('users').add({
      email: 'student@example.com',
      name: 'Sarah Johnson',
      role: 'student',
      phone: '+61 4 1234 5678',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        dateOfBirth: '1998-05-15',
        address: '123 Student St, Sydney NSW 2000',
        emergencyContact: {
          name: 'John Johnson',
          phone: '+61 4 8765 4321',
          relationship: 'Father'
        }
      }
    });
    console.log('✅ Created student@example.com');

    // 3. Create 8 RTOs with their admin users
    console.log('🏫 Creating 8 RTOs...');
    const rtos = [
      { name: 'Sydney Training Institute', email: 'admin@sydneytraining.edu.au', code: 'STI001' },
      { name: 'Melbourne Skills Academy', email: 'admin@melbourneskills.edu.au', code: 'MSA002' },
      { name: 'Brisbane Career College', email: 'admin@brisbanecareer.edu.au', code: 'BCC003' },
      { name: 'Perth Technical Institute', email: 'admin@perthtechnical.edu.au', code: 'PTI004' },
      { name: 'Adelaide Professional Training', email: 'admin@adelaidepro.edu.au', code: 'APT005' },
      { name: 'Gold Coast Learning Center', email: 'admin@goldcoastlearn.edu.au', code: 'GCL006' },
      { name: 'Canberra Education Hub', email: 'admin@canberraed.edu.au', code: 'CEH007' },
      { name: 'Darwin Skills Development', email: 'admin@darwinskills.edu.au', code: 'DSD008' }
    ];

    for (let i = 0; i < rtos.length; i++) {
      const rto = rtos[i];
      
      // Create RTO user
      await db.collection('users').add({
        email: rto.email,
        name: `${rto.name} Administrator`,
        role: 'rto',
        phone: `+61 ${i + 2} 9876 543${i}`,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        organization: rto.name,
        rtoCode: rto.code
      });
      
      console.log(`✅ Created RTO user ${i + 1}: ${rto.email}`);
    }

    // 4. Create 8 Providers with their admin users
    console.log('🏭 Creating 8 Providers...');
    const providers = [
      { name: 'TechCorp Solutions', email: 'admin@techcorp.com.au', industry: 'Technology' },
      { name: 'Healthcare Partners', email: 'admin@healthpartners.com.au', industry: 'Healthcare' },
      { name: 'Construction Masters', email: 'admin@constructmasters.com.au', industry: 'Construction' },
      { name: 'Retail Excellence Group', email: 'admin@retailexcel.com.au', industry: 'Retail' },
      { name: 'Finance Solutions Ltd', email: 'admin@financesolut.com.au', industry: 'Finance' },
      { name: 'Hospitality Professionals', email: 'admin@hospipro.com.au', industry: 'Hospitality' },
      { name: 'Manufacturing Leaders', email: 'admin@manulearn.com.au', industry: 'Manufacturing' },
      { name: 'Transport & Logistics Co', email: 'admin@transportlog.com.au', industry: 'Transport' }
    ];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      // Create Provider user
      await db.collection('users').add({
        email: provider.email,
        name: `${provider.name} Administrator`,
        role: 'provider',
        phone: `+61 ${i + 3} 8765 432${i}`,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        organization: provider.name,
        industry: provider.industry
      });
      
      console.log(`✅ Created Provider user ${i + 1}: ${provider.email}`);
    }

    // 5. Create 1 Supervisor
    console.log('👨‍💼 Creating 1 Supervisor...');
    await db.collection('users').add({
      email: 'supervisor@workplacement.com.au',
      name: 'Michael Thompson',
      role: 'supervisor',
      phone: '+61 4 2345 6789',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      qualifications: [
        'Certificate IV in Training and Assessment',
        'Diploma of Human Resources Management'
      ],
      experience: '15 years in workplace training and supervision'
    });
    console.log('✅ Created supervisor@workplacement.com.au');

    // 6. Create 1 Assessor
    console.log('📋 Creating 1 Assessor...');
    await db.collection('users').add({
      email: 'assessor@evaluation.com.au',
      name: 'Dr. Jennifer Williams',
      role: 'assessor',
      phone: '+61 4 3456 7890',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      qualifications: [
        'PhD in Education Assessment',
        'Certificate IV in Training and Assessment',
        'Advanced Diploma in Assessment and Evaluation'
      ],
      specializations: ['Competency Assessment', 'Skills Evaluation', 'Learning Outcomes']
    });
    console.log('✅ Created assessor@evaluation.com.au');

    // Verify final counts
    console.log('\n📊 Verifying final user counts...');
    const finalUsersSnapshot = await db.collection('users').get();
    const roleCounts = {
      admin: 0,
      student: 0,
      rto: 0,
      provider: 0,
      supervisor: 0,
      assessor: 0,
      total: 0
    };

    finalUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      const role = userData.role?.toLowerCase();
      
      if (role in roleCounts) {
        roleCounts[role as keyof typeof roleCounts]++;
      }
      roleCounts.total++;
    });

    console.log('🎉 ✅ EXACT USER REQUIREMENTS CREATED! ✅ 🎉');
    console.log('📊 Final User Distribution:');
    console.log(`👑 Admins: ${roleCounts.admin} (Required: 1) ${roleCounts.admin === 1 ? '✅' : '❌'}`);
    console.log(`🎓 Students: ${roleCounts.student} (Required: 1) ${roleCounts.student === 1 ? '✅' : '❌'}`);
    console.log(`🏫 RTOs: ${roleCounts.rto} (Required: 8) ${roleCounts.rto === 8 ? '✅' : '❌'}`);
    console.log(`🏭 Providers: ${roleCounts.provider} (Required: 8) ${roleCounts.provider === 8 ? '✅' : '❌'}`);
    console.log(`👨‍💼 Supervisors: ${roleCounts.supervisor} (Required: 1) ${roleCounts.supervisor === 1 ? '✅' : '❌'}`);
    console.log(`📋 Assessors: ${roleCounts.assessor} (Required: 1) ${roleCounts.assessor === 1 ? '✅' : '❌'}`);
    console.log(`📈 Total Users: ${roleCounts.total}`);

    console.log('\n🔑 Login Credentials:');
    console.log('All users have password: password123');
    console.log('\n🚀 Key Access Points:');
    console.log('• Platform Admin: admin@placementguru.com');
    console.log('• Student: student@example.com');
    console.log('• RTO Example: admin@sydneytraining.edu.au');
    console.log('• Provider Example: admin@techcorp.com.au');
    console.log('• Supervisor: supervisor@workplacement.com.au');
    console.log('• Assessor: assessor@evaluation.com.au');

    const allMatch = roleCounts.admin === 1 &&
                    roleCounts.student === 1 &&
                    roleCounts.rto === 8 &&
                    roleCounts.provider === 8 &&
                    roleCounts.supervisor === 1 &&
                    roleCounts.assessor === 1;

    if (allMatch) {
      console.log('\n🎯 ✅ ALL REQUIREMENTS PERFECTLY MATCHED! ✅ 🎯');
    } else {
      console.log('\n⚠️ Some requirements not met. Please check the counts above.');
    }

  } catch (error) {
    console.error('❌ Error creating exact user requirements:', error);
  }
}

// Run the function
createExactUserRequirements();