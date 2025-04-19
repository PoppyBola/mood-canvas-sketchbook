
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';
import HistoryView from '../components/history/HistoryView';
import { findArtForMood, MoodData } from '../data/moodData';
import { addHistoryEntry, getHistory } from '../utils/historyUtils';
import { toast } from 'sonner';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);
  const [artData, setArtData] = useState<MoodData | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleMoodSubmit = (mood: string) => {
    const matchedArtData = findArtForMood(mood);
    setCurrentMood(mood);
    setArtData(matchedArtData);
    setShowArt(true);

    // Add to history
    addHistoryEntry({
      mood,
      imagePlaceholder: matchedArtData.imagePlaceholder,
      quote: matchedArtData.quote,
      quoteAuthor: matchedArtData.quoteAuthor
    });
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
    <Layout onHeaderClick={handleNewCanvas}>
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
