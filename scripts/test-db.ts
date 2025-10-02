// Test Firestore connection script
import { collections } from '../src/lib/db'

async function testConnection() {
  console.log('🔍 Testing Firestore connection...')
  
  try {
    // Test Firestore connection by attempting to read collections
    const [usersSnapshot, studentsSnapshot] = await Promise.all([
      collections.users().count().get(),
      collections.students().count().get()
    ])

    console.log('✅ Firestore connection successful!')
    console.log(`📊 Found ${usersSnapshot.data().count} users and ${studentsSnapshot.data().count} students`)
    console.log('✅ Firestore is properly set up!')
    
    // Test a simple read operation
    const usersQuery = await collections.users().limit(1).get()
    if (!usersQuery.empty) {
      const sampleUser = usersQuery.docs[0].data()
      console.log(`� Sample user: ${sampleUser.firstName} ${sampleUser.lastName} (${sampleUser.role})`)
    }
    
  } catch (error) {
    console.log('❌ Firestore connection failed!')
    console.log('Error:', error instanceof Error ? error.message : 'Unknown error')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your FIREBASE_SERVICE_ACCOUNT in .env.local')
    console.log('2. Verify the service account JSON is valid')
    console.log('3. Ensure Firestore is enabled in your Firebase project')
    console.log('4. Check Firebase project permissions')
  }
}

testConnection()