
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserPreferences {
  daily_reminder_enabled: boolean;
  reminder_time: string;
  notifications_enabled: boolean;
}

const defaultPreferences: UserPreferences = {
  daily_reminder_enabled: true,
  reminder_time: '09:00:00',
  notifications_enabled: true
};

const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Generate hour options for the select dropdown
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const ampm = i < 12 ? 'AM' : 'PM';
    const hour12 = i % 12 === 0 ? 12 : i % 12;
    return {
      value: `${hour}:00:00`,
      label: `${hour12}:00 ${ampm}`
    };
  });

  useEffect(() => {
    if (!user) return;
    
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          throw error;
        }

        if (data) {
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async () => {
    if (!user) {
      toast.error('You must be logged in to save preferences');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;
      
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReminderToggle = (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      daily_reminder_enabled: checked
    }));
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications_enabled: checked
    }));
    
    // Request notification permissions if enabled
    if (checked && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleTimeChange = (time: string) => {
    setPreferences(prev => ({
      ...prev,
      reminder_time: time
    }));
  };

  // If browser doesn't support notifications, don't show notification toggle
  const supportsNotifications = 'Notification' in window;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you want to receive reminders about your mood canvas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reminder" className="flex-1">
                  Daily mood reminder
                  <p className="text-sm text-canvas-muted">
                    Receive a daily reminder to record your mood
                  </p>
                </Label>
                <Switch
                  id="daily-reminder"
                  checked={preferences.daily_reminder_enabled}
                  onCheckedChange={handleReminderToggle}
                />
              </div>
            </div>
            
            {preferences.daily_reminder_enabled && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="reminder-time">Preferred reminder time</Label>
                <Select
                  value={preferences.reminder_time}
                  onValueChange={handleTimeChange}
                  disabled={!preferences.daily_reminder_enabled}
                >
                  <SelectTrigger id="reminder-time" className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {hourOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-canvas-muted mt-1">
                  All times are in your local timezone
                </p>
              </div>
            )}
            
            {supportsNotifications && (
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notifications" className="flex-1">
                    Browser notifications
                    <p className="text-sm text-canvas-muted">
                      Show notifications in your browser when you're using the app
                    </p>
                  </Label>
                  <Switch
                    id="browser-notifications"
                    checked={preferences.notifications_enabled}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>
              </div>
            )}
            
            <Button 
              onClick={savePreferences} 
              className="w-full mt-4"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
