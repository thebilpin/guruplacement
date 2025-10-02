// Script to enable required Google Cloud APIs for Firebase project
// Run this to fix the IAM permission issues

const { google } = require('googleapis');
const fs = require('fs');

async function enableRequiredAPIs() {
  try {
    // Load service account credentials
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    
    if (!serviceAccount.project_id) {
      throw new Error('No project_id found in service account');
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/service.management'
      ]
    });
    
    const serviceUsage = google.serviceusage({ version: 'v1', auth });
    const projectId = serviceAccount.project_id;
    
    const requiredAPIs = [
      'firestore.googleapis.com',
      'firebase.googleapis.com', 
      'identitytoolkit.googleapis.com',
      'iamcredentials.googleapis.com',
      'serviceusage.googleapis.com',
      'cloudresourcemanager.googleapis.com'
    ];
    
    console.log(`Enabling APIs for project: ${projectId}`);
    
    for (const api of requiredAPIs) {
      try {
        console.log(`Enabling ${api}...`);
        
        const request = {
          name: `projects/${projectId}/services/${api}`
        };
        
        const operation = await serviceUsage.services.enable(request);
        console.log(`✅ ${api} enabled successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to enable ${api}:`, error.message);
        
        // If it's already enabled, that's fine
        if (error.message.includes('already enabled')) {
          console.log(`✅ ${api} was already enabled`);
        }
      }
    }
    
    console.log('\n🎉 API enablement process completed!');
    console.log('You may need to wait a few minutes for changes to propagate.');
    
  } catch (error) {
    console.error('❌ Error enabling APIs:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n🔧 MANUAL STEPS REQUIRED:');
      console.log('1. Go to: https://console.cloud.google.com/apis/library?project=studio-6552229432-9934b');
      console.log('2. Search for and enable these APIs:');
      console.log('   - Identity and Access Management (IAM) API');
      console.log('   - Cloud Resource Manager API'); 
      console.log('   - Firebase Authentication API');
      console.log('   - Cloud Firestore API');
      console.log('   - Service Usage API');
      console.log('\n3. Go to: https://console.cloud.google.com/iam-admin/iam?project=studio-6552229432-9934b');
      console.log('4. Find your service account: firebase-adminsdk-fbsvc@studio-6552229432-9934b.iam.gserviceaccount.com');
      console.log('5. Add these roles:');
      console.log('   - Service Usage Consumer');
      console.log('   - Firebase Admin');
      console.log('   - Cloud Datastore User');
    }
  }
}

enableRequiredAPIs();