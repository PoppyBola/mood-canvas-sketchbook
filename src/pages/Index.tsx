
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
    setHistoryEntries(getHistory());
  }, []);

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

  // Add to local history when canvas is shown
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
        
        addHistoryEntry(historyEntry);
        setHistoryEntries(getHistory());
      } catch (err) {
        console.error('Error saving to history:', err);
      }
    }
  }, [stage, moodEntry, imageUrl, moodSearch]);

  const handleBackToSelector = () => {
    setStage('selector');
    setMoodSearch('');
  };

  const handleOpenHistory = () => {
    setHistoryEntries(getHistory());
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
