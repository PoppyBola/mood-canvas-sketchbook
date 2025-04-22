
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Palette, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <Layout gradientClasses={["from-indigo-50", "via-purple-50", "to-pink-50"]}>
      <div className="w-full max-w-4xl mx-auto space-y-8 px-4">
        <h1 className="text-2xl font-medium mb-6">Settings</h1>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the app looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-canvas-muted">
                    More appearance options coming soon. You can currently toggle between light and dark mode using the palette icon in the header.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage your data and privacy preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Data Storage</h3>
                    <p className="text-sm text-canvas-muted">
                      Your mood entries are stored securely in our database. You can delete your account and all associated data at any time.
                    </p>
                    
                    <h3 className="font-medium">Local History</h3>
                    <p className="text-sm text-canvas-muted">
                      For convenience, we store your recent mood entries in your browser's local storage so they're available even when offline.
                    </p>
                    
                    <Button variant="destructive" className="mt-4">
                      Clear Local Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
