
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the notification interface to match our database schema
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMobile = useIsMobile();

  // Load notifications for the user
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      try {
        // Use a type assertion to tell TypeScript we're working with the user_notifications table
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20) as { data: Notification[] | null, error: any };
          
        if (error) throw error;
        
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };
    
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('public:user_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          setNotifications(current => [payload.new as Notification, ...current]);
          setUnreadCount(count => count + 1);
          
          // Show browser notification if enabled
          checkAndShowNotification(payload.new as Notification);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkAndShowNotification = (notification: Notification) => {
    if (!('Notification' in window)) return;
    
    // Check if the user has notification preferences enabled
    const checkPreferences = async () => {
      if (!user) return;
      
      try {
        // Use a type assertion for the user_preferences table
        const { data, error } = await supabase
          .from('user_preferences')
          .select('notifications_enabled')
          .eq('user_id', user.id)
          .single() as { data: { notifications_enabled: boolean } | null, error: any };
          
        if (error) throw error;
        
        // If notifications are enabled and permission is granted, show notification
        if (data?.notifications_enabled && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.error('Error checking notification preferences:', err);
      }
    };
    
    checkPreferences();
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };

  const markAsRead = async (id: string) => {
    try {
      // Use a type assertion for the update operation
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', id) as { data: any, error: any };
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      // Use a type assertion for the update operation
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false) as { data: any, error: any };
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-canvas-muted" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-xs bg-canvas-accent text-white shadow-warm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div 
          className={`absolute z-50 ${isMobile ? 'w-[calc(100vw-2rem)] right-0' : 'w-80 right-0'} 
            top-full mt-2 bg-white/80 glass rounded-lg shadow-lg border border-gray-200 overflow-hidden backdrop-blur-md 
            dark:bg-gray-800/90 dark:border-gray-700 animate-fade-in`}
        >
          <div className="flex items-center justify-between p-3 border-b bg-white/70 dark:bg-gray-800/90">
            <h3 className="font-semibold text-canvas-foreground dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={closeNotifications}>
                <X className="h-4 w-4 text-canvas-muted dark:text-gray-400" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-canvas-muted dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-canvas-foreground dark:text-gray-100">{notification.title}</h4>
                      <span className="text-xs text-canvas-muted dark:text-gray-400">
                        {format(new Date(notification.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-canvas-muted dark:text-gray-300">{notification.message}</p>
                    <div className="text-xs text-canvas-muted dark:text-gray-400 mt-1">
                      {format(new Date(notification.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
