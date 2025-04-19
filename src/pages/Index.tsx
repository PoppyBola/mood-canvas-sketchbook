
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import MoodInput from '../components/mood/MoodInput';
import ArtDisplay from '../components/art/ArtDisplay';

const Index = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [showArt, setShowArt] = useState<boolean>(false);

  const handleMoodSubmit = (mood: string) => {
    setCurrentMood(mood);
    // In Phase 1, we're just simulating the transition to the art display
    setShowArt(true);
  };

  return (
    <Layout>
      <div className="w-full flex flex-col items-center justify-center">
        {!showArt ? (
          <MoodInput onSubmit={handleMoodSubmit} />
        ) : (
          <ArtDisplay mood={currentMood} />
        )}
      </div>
    </Layout>
  );
};

export default Index;
