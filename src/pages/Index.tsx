import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import MoodSelector from '../components/MoodSelector';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMoodEntry } from '../hooks/useMoodEntry';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import type { HistoryEntry } from '../utils/historyUtils';
import HistoryView from '../components/history/HistoryView';
import { supabase } from '@/integrations/supabase/client';
import DailyQuoteModal from '@/components/DailyQuoteModal';
import MobileActionBar from '@/components/layout/MobileActionBar';
import { useIsMobile } from '@/hooks/use-mobile';

// Import new components
import MoodCanvas from '@/components/mood/MoodCanvas';
import MoodLoading from '@/components/mood/MoodLoading';
import MoodError from '@/components/mood/MoodError';

const Index = () => {
  const [moodSearch, setMoodSearch] = useState('');
  const [stage, setStage] = useState<'selector' | 'loading' | 'canvas'>('selector');
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [showQuote, setShowQuote] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Get mood data and image url
  const { moodEntry, imageUrl, isLoading, error, refetch } = useMoodEntry(moodSearch);

  // Load history entries on component mount
  useEffect(() => {
    loadHistory();
  }, [user]);
  
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

  // Add to history when canvas is shown 
  useEffect(() => {
    if (stage === 'canvas' && moodEntry && imageUrl) {
      saveToHistory();
    }
  }, [stage, moodEntry, imageUrl, moodSearch, user]);
  
  const saveToHistory = async () => {
    if (!moodEntry || !imageUrl) return;
    
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
        try {
          await supabase.from('user_mood_history').insert([{
            user_id: user.id,
            mood_text: moodSearch,
            mood_entry_id: moodEntry.id,
            image_url: imageUrl,
            gradient_classes: moodEntry.gradient_classes,
            created_at: new Date().toISOString()
          }]);
          
          await loadHistory(); // Refresh history after saving
        } catch (err) {
          console.error('Error saving to Supabase:', err);
          // Fallback to local storage if Supabase fails
          addHistoryEntry(historyEntry);
          setHistoryEntries(getHistory());
        }
      } else {
        // Save to local storage if user is not logged in
        addHistoryEntry(historyEntry);
        setHistoryEntries(getHistory());
      }
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  const handleBackToSelector = () => {
    setStage('selector');
    setMoodSearch('');
  };

  const handleOpenHistory = () => {
    loadHistory(); // Refresh history before opening
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };
  
  const handleOpenQuoteModal = () => {
    setShowQuote(true);
  };
  
  const handleCloseQuoteModal = () => {
    setShowQuote(false);
  };

  // Render loading state
  if (isLoading || (stage === 'loading' && (!moodEntry || !imageUrl))) {
    return (
      <Layout gradientClasses={["from-yellow-50", "via-amber-100", "to-yellow-100"]}>
        <MoodLoading moodSearch={moodSearch} />
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout gradientClasses={["from-red-100", "to-red-300"]}>
        <MoodError error={error} onBack={handleBackToSelector} />
      </Layout>
    );
  }

  return (
    <Layout 
      gradientClasses={moodEntry?.gradient_classes || ["from-yellow-50", "via-amber-100", "to-yellow-100"]}
      showFooter={!isMobile || stage !== 'selector'}
    >
      {stage === 'selector' && (
        <>
          <MoodSelector onSubmit={handleMoodSubmit} onHistoryOpen={handleOpenHistory} />
          
          {!isMobile && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="ghost"
                className="rounded-xl px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-canvas-muted shadow-warm transition"
                onClick={handleOpenQuoteModal}
              >
                ✨ Inspiration
              </Button>
            </div>
          )}

          {/* Mobile Action Bar */}
          <MobileActionBar 
            onInspiration={handleOpenQuoteModal}
            onCreateCanvas={() => {
              // If the user hasn't entered a mood yet, show a placeholder
              if (!moodSearch) {
                toast("Enter a mood above to create your canvas", {
                  description: "Try 'peaceful' or 'excited' to get started",
                  action: {
                    label: "Got it",
                    onClick: () => {}
                  }
                });
              }
            }}
            showButtons={true}
          />
        </>
      )}

      {stage === 'canvas' && moodEntry && imageUrl && (
        <>
          <MoodCanvas 
            moodEntry={moodEntry}
            imageUrl={imageUrl}
            onBack={handleBackToSelector}
          />
          
          {isMobile && (
            <MobileActionBar 
              onInspiration={handleOpenQuoteModal}
              onCreateCanvas={handleBackToSelector}
              showButtons={true}
            />
          )}
        </>
      )}

      {showHistory && (
        <HistoryView onClose={handleCloseHistory} entries={historyEntries} />
      )}
      
      {showQuote && (
        <DailyQuoteModal onClose={handleCloseQuoteModal} />
      )}
    </Layout>
  );
};

export default Index;
