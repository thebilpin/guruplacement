// Script to manually add the student user to the database
// Run this in the browser console while on the admin page

async function addStudentUser() {
  try {
    console.log('Adding student user...');
    
    const userData = {
      email: 'student@placmenehero.com.au',
      name: 'Student User',
      role: 'student',
      phone: '',
      organization: '',
      active: true,
      emailVerified: true,
      permissions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      firebaseUid: 'student-001'
    };
    
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Student user added successfully:', result);
      // Refresh the page to see the new user
      window.location.reload();
    } else {
      const error = await response.json();
      console.error('❌ Failed to add student user:', error);
    }
    
  } catch (error) {
    console.error('❌ Error adding student user:', error);
  }
}

// Run the function
addStudentUser();