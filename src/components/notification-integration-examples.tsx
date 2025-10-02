// Example integration of NotificationCenter in your app layout or header component

import { NotificationCenter } from '@/components/notification-center';

// In your main layout or header component
export function AppHeader({ userId }: { userId: string }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Your logo and navigation */}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Other header items */}
          
          {/* Notification Center Integration */}
          <NotificationCenter userId={userId} />
          
          {/* User menu, etc. */}
        </div>
      </div>
    </header>
  );
}

// Example usage in pages to show inline notifications
import { InlineNotification } from '@/components/notification-center';

export function DashboardPage({ userId }: { userId: string }) {
  const [pageNotifications, setPageNotifications] = useState([]);
  
  useEffect(() => {
    // Fetch notifications for this specific page/context
    fetchPageNotifications();
  }, []);
  
  const handleDismissNotification = (notificationId: string) => {
    setPageNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Show important notifications inline */}
      {pageNotifications.map(notification => (
        <InlineNotification
          key={notification.id}
          notification={notification}
          onDismiss={handleDismissNotification}
        />
      ))}
      
      {/* Rest of your page content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard widgets */}
      </div>
    </div>
  );
}

// Firebase Cloud Messaging setup for web push notifications
// Add this to your main app component or service worker

export async function initializeFCM(userId: string) {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token and save to user profile
      const token = await getFCMToken();
      
      // Save token to database
      await fetch('/api/user/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token })
      });
    }
  } catch (error) {
    console.error('Error initializing FCM:', error);
  }
}

// Usage summary:
// 1. Add <NotificationCenter userId={currentUser.id} /> to your header/navbar
// 2. Use <InlineNotification /> components to show important notifications in pages
// 3. Initialize FCM for push notifications when app loads
// 4. Admin can create announcements through /admin/announcements page
// 5. Users receive real-time notifications through FCM and in-app notification center