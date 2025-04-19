
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';
import { findArtForMood, MoodData } from '../data/moodData';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);
  const [artData, setArtData] = useState<MoodData | null>(null);

  const handleMoodSubmit = (mood: string) => {
    const matchedArtData = findArtForMood(mood);
    setCurrentMood(mood);
    setArtData(matchedArtData);
    setShowArt(true);
  };

  return (
    <Layout>
      <div className="w-full flex flex-col items-center justify-center">
        {!showArt ? (
          <MoodInput onSubmit={handleMoodSubmit} />
        ) : (
          <ArtDisplay 
            mood={currentMood} 
            artData={artData!}
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;

