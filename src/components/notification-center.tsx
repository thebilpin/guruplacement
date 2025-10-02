'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellRing,
  Check,
  Info,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { UserNotification, AnnouncementType, getAnnouncementTypeStyle } from '@/lib/schemas/announcements';

const getTypeIcon = (type: AnnouncementType) => {
  const icons = {
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    critical: <AlertCircle className="h-4 w-4" />
  };
  return icons[type];
};

interface NotificationCenterProps {
  userId: string;
  className?: string;
}

export function NotificationCenter({ userId, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = (type: AnnouncementType) => {
    const icons = {
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle2 className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      critical: <AlertCircle className="h-4 w-4" />
    };
    return icons[type];
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId,
          action: 'mark_read'
        })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId
              ? { ...notification, status: 'read' as any, readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== 'read');
      
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              notificationId: notification.id,
              action: 'mark_read'
            })
          })
        )
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.status !== 'read'
            ? { ...notification, status: 'read' as any, readAt: new Date() }
            : notification
        )
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: UserNotification) => {
    // Mark as read if not already read
    if (notification.status !== 'read') {
      await markAsRead(notification.id);
    }

    // Handle action button click
    if (notification.actionButton?.url) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notificationId: notification.id,
            action: 'mark_clicked'
          })
        });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
      
      window.open(notification.actionButton.url, '_blank');
    }
  };

  const formatDate = (date: any) => {
    const notificationDate = new Date(date.seconds ? date.seconds * 1000 : date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return notificationDate.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className={`relative ${className}`}>
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.status !== 'read' ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${getAnnouncementTypeStyle(notification.type).icon}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${
                          notification.status !== 'read' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notification.status !== 'read' && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      
                      {notification.actionButton && (
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            {notification.actionButton.text}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {notification.status !== 'read' && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 20 && (
          <div className="p-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Inline notification component for showing notifications in pages
interface InlineNotificationProps {
  notification: UserNotification;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function InlineNotification({ notification, onDismiss, className }: InlineNotificationProps) {
  const style = getAnnouncementTypeStyle(notification.type);
  
  const handleActionClick = async () => {
    if (notification.actionButton?.url) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notificationId: notification.id,
            action: 'mark_clicked'
          })
        });
      } catch (error) {
        console.error('Error tracking click:', error);
      }
      
      window.open(notification.actionButton.url, '_blank');
    }
  };

  return (
    <Card className={`${style.bg} ${style.border} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={style.icon}>
            {getTypeIcon(notification.type)}
          </div>
          
          <div className="flex-1">
            <h4 className={`font-medium ${style.text}`}>
              {notification.title}
            </h4>
            <p className={`text-sm ${style.text} opacity-90 mt-1`}>
              {notification.content}
            </p>
            
            <div className="flex items-center gap-3 mt-3">
              {notification.actionButton && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleActionClick}
                  className="text-xs"
                >
                  {notification.actionButton.text}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
              
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDismiss(notification.id)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}