import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';
import HistoryView from '../components/history/HistoryView';
import { findArtForMood, MoodData } from '../data/moodData';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import { getSessionStreak, incrementSessionStreak } from '../utils/sessionUtils';
import { toast } from 'sonner';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);
  const [artData, setArtData] = useState<MoodData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [gradientClasses, setGradientClasses] = useState<string[]>(["from-gray-100", "to-slate-200"]);
  const [sessionStreak, setSessionStreak] = useState(0);

  useEffect(() => {
    setSessionStreak(getSessionStreak());
  }, []);

  const handleMoodSubmit = (mood: string) => {
    const matchedArtData = findArtForMood(mood);
    setCurrentMood(mood);
    setArtData(matchedArtData);
    setShowArt(true);
    setGradientClasses(matchedArtData.gradientClasses);

    // Add to history
    addHistoryEntry({
      mood,
      imagePlaceholder: matchedArtData.imagePlaceholder,
      quote: matchedArtData.quote,
      quoteAuthor: matchedArtData.quoteAuthor
    });

    // Update streak
    const newStreak = incrementSessionStreak();
    setSessionStreak(newStreak);
    if (newStreak > 1) {
      toast(`${newStreak} canvases created! 🎨`);
    }
  };

  const handleShare = async () => {
    if (!artData) return;
    
    const shareText = `My mood canvas for '${currentMood}': "${artData.quote}" - ${artData.quoteAuthor} #DailyMoodCanvas`;
    
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
    setArtData(null);
  };

  return (
    <Layout onHeaderClick={handleNewCanvas} gradientClasses={gradientClasses}>
      <div className="w-full flex flex-col items-center justify-center">
        {!showArt ? (
          <MoodInput onSubmit={handleMoodSubmit} />
        ) : (
          <ArtDisplay 
            mood={currentMood} 
            artData={artData!}
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
