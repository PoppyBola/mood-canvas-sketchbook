
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  const { isDarkMode } = useTheme();

  // For new mood entry form
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImagePath, setNewImagePath] = useState('');
  const [newGradientClasses, setNewGradientClasses] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For CSV import
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [importLogs, setImportLogs] = useState<any[]>([]);

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
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout gradientClasses={isDarkMode ? ["from-gray-900", "via-gray-850", "to-gray-900"] : ["from-blue-50", "via-indigo-100", "to-blue-50"]}>
      <div className="w-full mx-auto space-y-8 px-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Settings className={cn("w-5 h-5", isDarkMode ? "text-purple-400" : "text-canvas-accent")} />
            <h1 className="text-xl font-display">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className={cn(isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white border-gray-700" : "")}
          >
            Return to Canvas
          </Button>
        </div>

        <Tabs defaultValue="entries" className="w-full">
          <TabsList className={cn(
            "grid grid-cols-3 w-full mx-auto mb-6",
            isDarkMode ? "bg-gray-800" : ""
          )}>
            <TabsTrigger value="entries">Manage Entries</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-4">
            <div className={cn(
              "backdrop-blur-sm rounded-xl border p-4 overflow-hidden",
              isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/90 border-canvas-border"
            )}>
              <h2 className="font-medium mb-4">All Mood Entries ({moodEntries.length})</h2>
              
              {isMobile ? (
                // Mobile view: Card-based layout
                <div className="space-y-4">
                  {moodEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={cn(
                        "border rounded-lg p-3 shadow-sm",
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-canvas-border/30"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium text-sm line-clamp-2">{entry.quote}</p>
                          <p className="text-xs text-canvas-muted">{entry.quote_author}</p>
                        </div>
                        <div className="flex items-center gap-1">
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
                            className={cn(
                              "h-8 w-8",
                              isDarkMode ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" : "text-red-400 hover:text-red-600 hover:bg-red-50"
                            )}
                            onClick={() => handleDeleteMoodEntry(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.mood_tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              isDarkMode ? "bg-gray-700" : "bg-canvas-border/20"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.mood_tags.length > 3 && (
                          <span className="text-xs text-canvas-muted">+{entry.mood_tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view: Table layout
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={cn(
                      isDarkMode ? "bg-gray-800/80" : "bg-canvas-border/30"
                    )}>
                      <tr>
                        <th className="text-left p-2">Quote</th>
                        <th className="text-left p-2">Author</th>
                        <th className="text-left p-2">Tags</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={cn(
                      "divide-y",
                      isDarkMode ? "divide-gray-800" : "divide-canvas-border/20"
                    )}>
                      {moodEntries.map((entry) => (
                        <tr key={entry.id} className={cn(
                          isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-canvas-border/10"
                        )}>
                          <td className="p-2">
                            <div className="max-w-xs truncate">{entry.quote}</div>
                          </td>
                          <td className="p-2">{entry.quote_author}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {entry.mood_tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    isDarkMode ? "bg-gray-700" : "bg-canvas-border/20"
                                  )}
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
                                className={cn(
                                  "h-8 w-8",
                                  isDarkMode ? "text-red-400 hover:text-red-300 hover:bg-red-900/30" : "text-red-400 hover:text-red-600 hover:bg-red-50"
                                )}
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
              )}
              
              {moodEntries.length === 0 && (
                <p className="text-center py-8 text-canvas-muted">
                  No mood entries found.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <div className={cn(
              "backdrop-blur-sm rounded-xl border p-6",
              isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/90 border-canvas-border"
            )}>
              <h2 className="font-medium mb-6 flex items-center gap-2">
                <ImagePlus className={cn("w-5 h-5", isDarkMode ? "text-purple-400" : "text-canvas-accent")} />
                Create New Mood Entry
              </h2>
              
              <form onSubmit={handleCreateMoodEntry} className="space-y-4 max-w-4xl mx-auto">
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
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
                      className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
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
                        className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
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
                        className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
                      />
                    </div>
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
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
                      className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
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
                      className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
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
                    className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}
                    rows={2}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit"
                    className={cn(
                      isMobile ? "w-full" : "w-auto",
                      isDarkMode ? "bg-purple-600 hover:bg-purple-700" : ""
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Mood Entry'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-4">
            <div className={cn(
              "backdrop-blur-sm rounded-xl border p-6 max-w-2xl mx-auto",
              isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/90 border-canvas-border"
            )}>
              <h2 className="font-medium mb-6 flex items-center gap-2">
                <span className={cn(
                  "inline-block p-2 rounded-full mr-1",
                  isDarkMode ? "bg-amber-600/30" : "bg-canvas-accent/20"
                )}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="6" fill={isDarkMode ? "#8B5CF6" : "#F7D8A8"}/><path d="M5.7 10a.7.7 0 0 0 0 1.4h4.2v2.68L7.58 12.28a.7.7 0 1 0-.98 1l3.43 3.35a.7.7 0 0 0 .97-.02l3.3-3.32a.7.7 0 1 0-1-.98l-2.14 2.09V11.4h4.2a.7.7 0 0 0 0-1.4H5.7Z" fill={isDarkMode ? "#F3F4F6" : "#D27C2C"}/></svg>
                </span>
                Bulk Import Quotes/Images via CSV
              </h2>
              <p className={cn(
                "mb-4 text-sm",
                isDarkMode ? "text-gray-300" : "text-canvas-muted"
              )}>
                Import a CSV with columns: <code className={isDarkMode ? "text-purple-300" : ""}>quote,quote_author,image_path,mood_tags,gradient_classes,description</code>.<br/>
                Each row creates a <b>mood entry</b>. Empty values are allowed for optional columns.<br/>
                <span className={isDarkMode ? "text-amber-300 block mt-2" : "text-yellow-800 block mt-2"}>⚠️ Only admins can use this tool. All entries are instantly added if valid.</span>
              </p>
              {/* CSV Upload Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!csvFile) {
                    setImportError("Select a CSV file.");
                    return;
                  }
                  setImportError("");
                  setImportLoading(true);
                  setImportResult(null);

                  // 1. Upload the file to the 'mood_images' bucket under /csv_imports
                  const fileName = `csv_imports/${Date.now()}_mood_import.csv`;
                  const { data, error } = await supabase.storage
                    .from('mood_images')
                    .upload(fileName, csvFile, { cacheControl: '60', upsert: true });

                  if (error) {
                    setImportError("File upload failed.");
                    setImportLoading(false);
                    return;
                  }

                  // 2. Trigger import on backend (call minimal edge function to parse/import)
                  try {
                    const funRes = await fetch('/functions/v1/admin_csv_import', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ storagePath: fileName, userId: user.id })
                    });
                    const resJson = await funRes.json();
                    if (resJson.error) {
                      setImportError(resJson.error);
                    } else {
                      setImportResult(resJson);
                    }
                  } catch (err) {
                    setImportError("Backend import failed.");
                  } finally {
                    setImportLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <input
                  className={cn(
                    "block w-full border p-2 rounded text-base file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium",
                    isDarkMode 
                      ? "bg-gray-800 border-gray-700 text-white file:bg-gray-900 file:text-gray-100" 
                      : "border-gray-300 file:bg-gray-100 file:text-gray-700"
                  )}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={e => setCsvFile(e.target.files?.[0] || null)}
                />
                {importLoading ? (
                  <div className={cn("flex items-center", isDarkMode ? "text-purple-400" : "text-canvas-accent")}>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Importing...</span>
                  </div>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={importLoading} 
                    className={cn(
                      isMobile ? "w-full" : "w-auto",
                      isDarkMode ? "bg-purple-600 hover:bg-purple-700" : ""
                    )}
                  >
                    Import CSV
                  </Button>
                )}
                {importError && (
                  <div className="text-red-500 text-sm">{importError}</div>
                )}
                {importResult && (
                  <div className={cn(
                    "text-sm whitespace-pre-wrap",
                    isDarkMode ? "text-green-400" : "text-green-700"
                  )}>
                    {importResult.message || 'Import complete.'}
                  </div>
                )}
              </form>

              {/* Import Logs Table */}
              <h3 className="mt-8 mb-3 font-medium text-base">Recent Imports</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className={cn(
                    isDarkMode ? "bg-gray-800" : "bg-canvas-border/30"
                  )}>
                    <tr>
                      <th className="p-2 text-left">When</th>
                      <th className="p-2 text-left">File</th>
                      <th className="p-2 text-left">Rows</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {importLogs.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-canvas-muted dark:text-gray-400">No imports yet.</td></tr>
                  ) : (
                    importLogs.map(log => (
                      <tr key={log.id}>
                        <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-2">{log.file_name}</td>
                        <td className="p-2">{log.rows_processed} ({log.rows_succeeded} ok)</td>
                        <td className="p-2">{log.status}</td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
