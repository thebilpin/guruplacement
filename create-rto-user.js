// Simple script to create RTO user manually
// This can be called from the browser console or as a standalone function

export async function createRTOUser() {
  try {
    console.log('🔐 Creating RTO user account...');
    
    const response = await fetch('/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rto@placementhero.com.au',
        password: 'MicrolaB631911',
        firstName: 'RTO',
        lastName: 'Administrator',
        role: 'rto_admin',
        organization: 'PlacementHero RTO'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ RTO user created successfully:', result);
      return result;
    } else {
      console.error('❌ Failed to create RTO user:', result);
      return result;
    }
  } catch (error) {
    console.error('❌ Error creating RTO user:', error);
    return { error: error.message };
  }
}

// Browser console usage:
// Copy and paste this entire code into browser console, then run:
// createRTOUser().then(result => console.log('Final result:', result));

if (typeof window !== 'undefined') {
  window.createRTOUser = createRTOUser;
  console.log('🚀 createRTOUser function is now available in window object');
  console.log('Run: createRTOUser() to create the RTO user');
}