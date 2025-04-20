
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';
import HistoryView from '../components/history/HistoryView';
import { useMoodEntry } from '../hooks/useMoodEntry';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import { getSessionStreak, incrementSessionStreak } from '../utils/sessionUtils';
import { toast } from 'sonner';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState(false);
  const [gradientClasses, setGradientClasses] = useState<string[]>(["from-gray-100", "to-slate-200"]);
  const [sessionStreak, setSessionStreak] = useState(getSessionStreak());

  // Use our custom hook to fetch mood entries
  const { moodEntry, imageUrl, isLoading } = useMoodEntry(currentMood);

  const handleMoodSubmit = (mood: string) => {
    setCurrentMood(mood);
    setShowArt(true);
    
    if (moodEntry) {
      setGradientClasses(moodEntry.gradient_classes);
      
      // Add to history
      addHistoryEntry({
        mood,
        imagePlaceholder: imageUrl || '',
        quote: moodEntry.quote,
        quoteAuthor: moodEntry.quote_author
      });

      // Update streak
      const newStreak = incrementSessionStreak();
      setSessionStreak(newStreak);
      if (newStreak > 1) {
        toast(`${newStreak} canvases created! 🎨`);
      }
    }
  };

  const handleShare = async () => {
    if (!moodEntry) return;
    
    const shareText = `My mood canvas for '${currentMood}': "${moodEntry.quote}" - ${moodEntry.quote_author} #DailyMoodCanvas`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast("Copied to clipboard!");
    } catch (err) {
      toast("Couldn't copy to clipboard");
    }
  };

  const handleNewCanvas = () => {
    setShowArt(false);
    setCurrentMood('');
  };

  // Show loading state
  if (showArt && isLoading) {
    return (
      <Layout gradientClasses={gradientClasses}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-canvas-muted">Loading your canvas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onHeaderClick={handleNewCanvas} gradientClasses={gradientClasses}>
      <div className="w-full flex flex-col items-center justify-center">
        {!showArt ? (
          <MoodInput onSubmit={handleMoodSubmit} />
        ) : moodEntry && (
          <ArtDisplay 
            mood={currentMood} 
            artData={{
              imagePlaceholder: imageUrl || '',
              quote: moodEntry.quote,
              quoteAuthor: moodEntry.quote_author
            }}
            onShare={handleShare}
            onHistory={() => setShowHistory(true)}
            onNewCanvas={handleNewCanvas}
          />
        )}
      </div>
      
      {showHistory && (
        <HistoryView
          entries={getHistory()}
          onClose={() => setShowHistory(false)}
        />
      )}
    </Layout>
  );
};

export default Index;

