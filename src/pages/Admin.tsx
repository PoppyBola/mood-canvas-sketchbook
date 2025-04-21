
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, ImagePlus, Edit, Trash2 } from 'lucide-react';

interface MoodEntry {
  id: string;
  quote: string;
  quote_author: string;
  image_path: string;
  mood_tags: string[];
  gradient_classes: string[];
  description?: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // In a real app, check admin status from Supabase

  // For new mood entry form
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImagePath, setNewImagePath] = useState('');
  const [newGradientClasses, setNewGradientClasses] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch mood entries
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // In a production app, check if the user is an admin
    // For now, we'll just simulate it
    setIsAdmin(true);
    
    const fetchMoodEntries = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setMoodEntries(data || []);
      } catch (error) {
        console.error('Error fetching mood entries:', error);
        toast.error('Failed to load mood entries');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMoodEntries();
  }, [user, navigate]);

  const handleCreateMoodEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote || !newAuthor || !newTags || !newImagePath || !newGradientClasses) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const moodTagsArray = newTags.split(',').map(tag => tag.trim().toLowerCase());
      const gradientClassesArray = newGradientClasses.split(',').map(cls => cls.trim());
      
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            quote: newQuote,
            quote_author: newAuthor,
            mood_tags: moodTagsArray,
            image_path: newImagePath,
            gradient_classes: gradientClassesArray,
            description: newDescription || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success('Mood entry created successfully');
      // Add the new entry to the list
      if (data) {
        setMoodEntries([data[0], ...moodEntries]);
      }
      
      // Reset form
      setNewQuote('');
      setNewAuthor('');
      setNewTags('');
      setNewImagePath('');
      setNewGradientClasses('');
      setNewDescription('');
    } catch (error) {
      console.error('Error creating mood entry:', error);
      toast.error('Failed to create mood entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMoodEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return;
    
    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Mood entry deleted successfully');
      // Remove the deleted entry from the list
      setMoodEntries(moodEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      toast.error('Failed to delete mood entry');
    }
  };

  // If not admin, show access denied
  if (!isAdmin && !isLoading) {
    return (
      <Layout>
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-red-100 shadow-warm max-w-md">
          <h2 className="text-xl font-medium text-red-500 mb-2">Access Denied</h2>
          <p className="text-canvas-muted">
            You don't have permission to access the admin dashboard.
          </p>
          <Button 
            variant="default" 
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Return to Canvas
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout gradientClasses={["from-blue-50", "via-indigo-100", "to-blue-50"]}>
      <div className="w-full max-w-4xl mx-auto space-y-8 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-canvas-accent" />
            <h1 className="text-xl font-display">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            Return to Canvas
          </Button>
        </div>

        <Tabs defaultValue="entries">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="entries">Manage Entries</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-canvas-border p-4 overflow-hidden">
              <h2 className="font-medium mb-4">All Mood Entries ({moodEntries.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-canvas-border/30">
                    <tr>
                      <th className="text-left p-2">Quote</th>
                      <th className="text-left p-2">Author</th>
                      <th className="text-left p-2">Tags</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canvas-border/20">
                    {moodEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-canvas-border/10">
                        <td className="p-2">
                          <div className="max-w-xs truncate">{entry.quote}</div>
                        </td>
                        <td className="p-2">{entry.quote_author}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {entry.mood_tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-canvas-border/20 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-canvas-muted hover:text-canvas-foreground"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteMoodEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {moodEntries.length === 0 && (
                <p className="text-center py-8 text-canvas-muted">
                  No mood entries found.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-canvas-border p-6">
              <h2 className="font-medium mb-6 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-canvas-accent" />
                Create New Mood Entry
              </h2>
              
              <form onSubmit={handleCreateMoodEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="quote" className="text-sm font-medium">
                      Quote <span className="text-red-500">*</span>
                    </label>
                    <Textarea 
                      id="quote"
                      placeholder="Enter an inspirational quote"
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      required
                      className="bg-white"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="author" className="text-sm font-medium">
                        Author <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        id="author"
                        placeholder="Quote author"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tags" className="text-sm font-medium">
                        Mood Tags <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        id="tags"
                        placeholder="happy, joyful, content (comma-separated)"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="imagePath" className="text-sm font-medium">
                      Image Path <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="imagePath"
                      placeholder="happy_1.png or https://example.com/image.jpg"
                      value={newImagePath}
                      onChange={(e) => setNewImagePath(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <p className="text-xs text-canvas-muted">
                      Either a Supabase storage path or an external URL
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="gradientClasses" className="text-sm font-medium">
                      Gradient Classes <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="gradientClasses"
                      placeholder="from-yellow-200, to-orange-200 (comma-separated)"
                      value={newGradientClasses}
                      onChange={(e) => setNewGradientClasses(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Textarea 
                    id="description"
                    placeholder="Additional description or context for this mood"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-white"
                    rows={2}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Mood Entry'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
