
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import MoodSelector from '../components/MoodSelector';
import Canvas from '../components/Canvas';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMoodEntry } from '../hooks/useMoodEntry';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import type { HistoryEntry } from '../utils/historyUtils';
import HistoryView from '../components/history/HistoryView';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [moodSearch, setMoodSearch] = useState('');
  const [stage, setStage] = useState<'selector' | 'loading' | 'canvas'>('selector');
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get mood data and image url
  const { moodEntry, imageUrl, isLoading, error } = useMoodEntry(moodSearch);

  // Load history entries on component mount
  useEffect(() => {
    const loadHistory = async () => {
      // First try to load from Supabase if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_mood_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
            
          if (!error && data) {
            // Convert Supabase data to HistoryEntry format
            const entries: HistoryEntry[] = data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              mood_text: item.mood_text,
              mood: item.mood_text, // For backwards compatibility
              image_url: item.image_url,
              imagePlaceholder: item.image_url, // For backwards compatibility
              created_at: item.created_at,
              timestamp: new Date(item.created_at).getTime(),
              gradient_classes: item.gradient_classes || [],
              mood_entry_id: item.mood_entry_id,
              personal_note: item.personal_note,
              quote: "",
              quote_author: ""
            }));
            setHistoryEntries(entries);
            return;
          }
        } catch (err) {
          console.error('Error fetching user history from Supabase:', err);
        }
      }
      
      // Fallback to local storage if Supabase fails or user not logged in
      setHistoryEntries(getHistory());
    };
    
    loadHistory();
  }, [user]);

  // Watch for changes in mood entry and image URL to transition to canvas view
  useEffect(() => {
    if (stage === 'loading' && moodEntry && imageUrl) {
      // Add slight delay for smoother transition
      const timer = setTimeout(() => {
        setStage('canvas');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [moodEntry, imageUrl, stage]);

  const handleMoodSubmit = (mood: string) => {
    if (!mood || mood.trim() === '') {
      toast.error('Please enter a mood.');
      return;
    }

    setMoodSearch(mood);
    setStage('loading');
  };

  // Add to history when canvas is shown - save to Supabase if user is logged in
  useEffect(() => {
    if (stage === 'canvas' && moodEntry && imageUrl) {
      try {
        // Convert to HistoryEntry format
        const historyEntry: Partial<HistoryEntry> = {
          mood_text: moodSearch,
          mood: moodSearch, // for backwards compatibility
          image_url: imageUrl,
          imagePlaceholder: imageUrl, // for backwards compatibility
          quote: moodEntry.quote,
          quote_author: moodEntry.quote_author,
          gradient_classes: moodEntry.gradient_classes,
          created_at: new Date().toISOString(),
          timestamp: Date.now(),
        };
        
        // Save to Supabase if user is logged in
        if (user) {
          (async () => {
            try {
              await supabase.from('user_mood_history').insert([{
                user_id: user.id,
                mood_text: moodSearch,
                mood_entry_id: moodEntry.id,
                image_url: imageUrl,
                gradient_classes: moodEntry.gradient_classes,
                created_at: new Date().toISOString()
              }]);
              
              // Fix: Properly handle the Promise with async/await
              try {
                const { data } = await supabase
                  .from('user_mood_history')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false })
                  .limit(20);
                  
                if (data) {
                  const entries: HistoryEntry[] = data.map((item: any) => ({
                    id: item.id,
                    user_id: item.user_id,
                    mood_text: item.mood_text,
                    mood: item.mood_text,
                    image_url: item.image_url,
                    imagePlaceholder: item.image_url,
                    created_at: item.created_at,
                    timestamp: new Date(item.created_at).getTime(),
                    gradient_classes: item.gradient_classes || [],
                    mood_entry_id: item.mood_entry_id,
                    personal_note: item.personal_note,
                    quote: "",
                    quote_author: ""
                  }));
                  setHistoryEntries(entries);
                }
              } catch (fetchError) {
                console.error('Error fetching updated history:', fetchError);
              }
            } catch (err) {
              console.error('Error saving to Supabase:', err);
              // Fallback to local storage if Supabase fails
              addHistoryEntry(historyEntry);
              setHistoryEntries(getHistory());
            }
          })();
        } else {
          // Save to local storage if user is not logged in
          addHistoryEntry(historyEntry);
          setHistoryEntries(getHistory());
        }
      } catch (err) {
        console.error('Error saving to history:', err);
      }
    }
  }, [stage, moodEntry, imageUrl, moodSearch, user]);

  const handleBackToSelector = () => {
    setStage('selector');
    setMoodSearch('');
  };

  const handleOpenHistory = () => {
    // Refresh history before opening
    if (user) {
      // Fix: Properly handle Promise with async/await in an IIFE
      (async () => {
        try {
          const { data } = await supabase
            .from('user_mood_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
            
          if (data) {
            const entries: HistoryEntry[] = data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              mood_text: item.mood_text,
              mood: item.mood_text,
              image_url: item.image_url,
              imagePlaceholder: item.image_url,
              created_at: item.created_at,
              timestamp: new Date(item.created_at).getTime(),
              gradient_classes: item.gradient_classes || [],
              mood_entry_id: item.mood_entry_id,
              personal_note: item.personal_note,
              quote: "",
              quote_author: ""
            }));
            setHistoryEntries(entries);
          }
        } catch (err) {
          console.error('Error refreshing history:', err);
          setHistoryEntries(getHistory());
        }
      })();
    } else {
      setHistoryEntries(getHistory());
    }
    
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  if (isLoading || (stage === 'loading' && (!moodEntry || !imageUrl))) {
    return (
      <Layout gradientClasses={["from-yellow-50", "via-amber-100", "to-yellow-100"]}>
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-lg text-canvas-foreground/80 animate-pulse">Finding the perfect canvas for "{moodSearch}"...</p>
          <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout gradientClasses={["from-red-100", "to-red-300"]}>
        <div className="flex flex-col justify-center items-center gap-4">
          <h2 className="text-xl font-bold">Oops!</h2>
          <p className="text-center">Something went wrong: {error.message}</p>
          <Button onClick={handleBackToSelector}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout gradientClasses={moodEntry?.gradient_classes || ["from-yellow-50", "via-amber-100", "to-yellow-100"]}>
      {stage === 'selector' && (
        <MoodSelector onSubmit={handleMoodSubmit} onHistoryOpen={handleOpenHistory} />
      )}

      {stage === 'canvas' && moodEntry && imageUrl && (
        <Canvas
          moodEntry={moodEntry}
          imageUrl={imageUrl}
          onBack={handleBackToSelector}
        />
      )}

      {showHistory && (
        <HistoryView onClose={handleCloseHistory} entries={historyEntries} />
      )}
    </Layout>
  );
};

export default Index;
