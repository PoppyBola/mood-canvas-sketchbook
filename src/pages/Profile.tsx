
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { HistoryEntry, getHistory } from '../utils/historyUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, Heart, Clock, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [savedCanvases, setSavedCanvases] = useState<HistoryEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      // Load history from localStorage
      setHistory(getHistory());
      setIsLoading(false);
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveCanvas = async (entry: HistoryEntry) => {
    if (!user) return;
    
    try {
      // In a future implementation, this would save to Supabase
      // For now, we'll just show a toast message
      toast.success('Canvas saved to your favorites');
      
      // Add to local saved state for demo
      setSavedCanvases(prev => [entry, ...prev]);
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast.error('Failed to save canvas');
    }
  };

  const handleDeleteHistory = () => {
    if (confirm('Are you sure you want to clear all your history?')) {
      localStorage.setItem('moodHistory', JSON.stringify([]));
      setHistory([]);
      toast.success('History cleared');
    }
  };

  if (isLoading) {
    return (
      <Layout gradientClasses={["from-yellow-50", "via-amber-100", "to-yellow-100"]}>
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout gradientClasses={["from-yellow-50", "via-amber-100", "to-yellow-100"]}>
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-canvas-border flex items-center justify-center">
              <User className="w-6 h-6 text-canvas-muted" />
            </div>
            <div>
              <h2 className="font-medium">{user?.email}</h2>
              <p className="text-sm text-canvas-muted">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="history">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-canvas-border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Your Canvas History</h3>
                {history.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteHistory}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-center py-8 text-canvas-muted">
                  Your canvas history will appear here.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {history.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="rounded-lg overflow-hidden border border-canvas-border bg-white shadow-warm group relative"
                    >
                      <div className="relative aspect-[4/5]">
                        <img 
                          src={entry.imagePlaceholder} 
                          alt={`Mood: ${entry.mood}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 text-white text-xs transition-opacity">
                          <p className="font-medium">{entry.mood}</p>
                          <button 
                            onClick={() => handleSaveCanvas(entry)}
                            className="mt-2 bg-white/20 backdrop-blur-sm text-white rounded-full py-1 px-2 flex items-center justify-center gap-1 hover:bg-white/30 transition-colors"
                          >
                            <Heart className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-canvas-muted truncate">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-canvas-border p-4">
              <h3 className="font-medium mb-4">Saved Canvases</h3>
              
              {savedCanvases.length === 0 ? (
                <p className="text-center py-8 text-canvas-muted">
                  Your saved canvases will appear here. Click the heart icon on a canvas to save it.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {savedCanvases.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="rounded-lg overflow-hidden border border-canvas-border bg-white shadow-warm"
                    >
                      <div className="relative aspect-[4/5]">
                        <img 
                          src={entry.imagePlaceholder} 
                          alt={`Mood: ${entry.mood}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium">{entry.mood}</p>
                        <p className="text-xs text-canvas-muted">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
