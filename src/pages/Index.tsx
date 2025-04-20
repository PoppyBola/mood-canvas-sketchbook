
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';
import HistoryView from '../components/history/HistoryView';
import { useMoodEntry } from '../hooks/useMoodEntry';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import { getSessionStreak, incrementSessionStreak } from '../utils/sessionUtils';
import { toast } from 'sonner';
import { MoodData } from '../data/moodData';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState(false);
  const [gradientClasses, setGradientClasses] = useState<string[]>(["from-amber-50", "via-orange-50", "to-yellow-50"]);
  const [sessionStreak, setSessionStreak] = useState(getSessionStreak());

  // Use our custom hook to fetch mood entries
  const { moodEntry, imageUrl, isLoading, error } = useMoodEntry(currentMood);

  const handleMoodSubmit = (mood: string) => {
    setCurrentMood(mood);
    setShowArt(true);
  };

  // Effect when moodEntry changes
  React.useEffect(() => {
    if (moodEntry && showArt) {
      console.log("Mood entry loaded:", moodEntry);
      
      if (moodEntry.gradient_classes && moodEntry.gradient_classes.length > 0) {
        setGradientClasses(moodEntry.gradient_classes);
      }
      
      // Add to history
      if (imageUrl) {
        addHistoryEntry({
          mood: currentMood,
          imagePlaceholder: imageUrl,
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
    }
  }, [moodEntry, imageUrl, currentMood, showArt]);

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

  // Show error state
  if (showArt && error) {
    console.error("Error loading mood entry:", error);
    return (
      <Layout gradientClasses={gradientClasses}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">
            Sorry, we couldn't load your canvas. Please try again.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onHeaderClick={handleNewCanvas} gradientClasses={gradientClasses}>
      <div className="w-full flex flex-col items-center justify-center">
        {!showArt ? (
          <MoodInput onSubmit={handleMoodSubmit} />
        ) : moodEntry && imageUrl ? (
          <ArtDisplay 
            mood={currentMood} 
            artData={{
              moodKeyword: currentMood,
              imagePlaceholder: imageUrl,
              quote: moodEntry.quote,
              quoteAuthor: moodEntry.quote_author,
              gradientClasses: moodEntry.gradient_classes
            }}
            onShare={handleShare}
            onHistory={() => setShowHistory(true)}
            onNewCanvas={handleNewCanvas}
          />
        ) : (
          <div className="text-canvas-muted">No matching mood found. Try another word.</div>
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
