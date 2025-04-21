
import React, { useState, useEffect } from 'react';
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
  const [gradientClasses, setGradientClasses] = useState<string[]>(["from-amber-100", "via-orange-150", "to-yellow-100"]);
  const [sessionStreak, setSessionStreak] = useState(getSessionStreak());
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Use our custom hook to fetch mood entries
  const { moodEntry, imageUrl, isLoading, error } = useMoodEntry(currentMood);

  const handleMoodSubmit = (mood: string) => {
    setCurrentMood(mood);
    setShowArt(true);
    setIsFirstVisit(false);
  };

  // Effect when moodEntry changes
  useEffect(() => {
    if (moodEntry && showArt) {
      // Apply gradient for warmth and smooth transition
      if (moodEntry.gradient_classes && moodEntry.gradient_classes.length > 0) {
        setGradientClasses(moodEntry.gradient_classes);
      }

      // Add to history
      if (imageUrl) {
        addHistoryEntry({
          mood: currentMood,
          imagePlaceholder: imageUrl,
          quote: moodEntry.quote,
          quoteAuthor: moodEntry.quote_author,
        });

        // Update streak
        const newStreak = incrementSessionStreak();
        setSessionStreak(newStreak);
        if (newStreak > 1) {
          toast.success(`${newStreak} canvases created! 🎨`);
        }
      }
    }
  }, [moodEntry, imageUrl, currentMood, showArt]);

  // Welcome message for first-time visitors
  useEffect(() => {
    if (isFirstVisit) {
      const timer = setTimeout(() => {
        toast("Welcome to Daily Mood Canvas! Express your mood and create a beautiful canvas.");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const handleShare = async () => {
    if (!moodEntry) return;

    try {
      // Use Web Share API first if supported
      if (navigator.share) {
        await navigator.share({
          title: 'My Daily Mood Canvas',
          text: `My mood canvas for '${currentMood}': "${moodEntry.quote}" - ${moodEntry.quote_author} #DailyMoodCanvas`,
        });
        toast.success("Shared successfully!");
        return;
      }
      
      // Fallback to clipboard copy
      const shareText = `My mood canvas for '${currentMood}': "${moodEntry.quote}" - ${moodEntry.quote_author} #DailyMoodCanvas`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Share failed:", err);
      toast.error("Couldn't share canvas");
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
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-canvas-accent/40 border-t-canvas-accent animate-spin" />
          <div className="animate-pulse text-canvas-muted text-center">Creating your canvas...</div>
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
          <div className="text-red-600 bg-red-50 p-6 rounded-xl shadow-md border border-red-100 text-center">
            Sorry, we couldn't create your canvas. Please try again.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onHeaderClick={handleNewCanvas} gradientClasses={gradientClasses}>
      <div className="w-full flex flex-col items-center justify-center select-text">
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
              gradientClasses: moodEntry.gradient_classes || ["from-amber-100", "to-orange-200"]
            }}
            onShare={handleShare}
            onHistory={() => setShowHistory(true)}
            onNewCanvas={handleNewCanvas}
          />
        ) : (
          <div className="text-canvas-muted p-8 text-center bg-white/60 rounded-2xl shadow-md border border-canvas-border max-w-sm">
            <p className="mb-3">No matching mood found.</p>
            <button
              onClick={handleNewCanvas}
              className="text-canvas-accent hover:underline"
              type="button"
            >
              Try another word
            </button>
          </div>
        )}
      </div>

      {showHistory && (
        <HistoryView entries={getHistory()} onClose={() => setShowHistory(false)} />
      )}
    </Layout>
  );
};

export default Index;
