
import React, { useState, useEffect } from 'react';
import Canvas from '../Canvas';
import { useQuoteRandomizer } from '@/hooks/useQuoteRandomizer';
import { MoodEntry } from '@/hooks/useMoodEntries';

interface EnhancedCanvasProps {
  moodEntry: MoodEntry;
  imageUrl: string;
  onBack: () => void;
}

const EnhancedCanvas: React.FC<EnhancedCanvasProps> = ({ 
  moodEntry: initialMoodEntry, 
  imageUrl: initialImageUrl,
  onBack 
}) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const { 
    currentMoodEntry, 
    randomizeQuote, 
    isLoading,
    findRelatedQuotes
  } = useQuoteRandomizer(initialMoodEntry);
  
  // Initial search for related quotes when component mounts
  useEffect(() => {
    if (initialMoodEntry?.quote) {
      findRelatedQuotes(initialMoodEntry.quote);
    }
  }, [initialMoodEntry]);
  
  // Auto-rotate through related quotes every 30 seconds
  useEffect(() => {
    if (!isLoading) {
      const quoteInterval = setInterval(() => {
        randomizeQuote();
      }, 30000); // 30 seconds
      
      return () => clearInterval(quoteInterval);
    }
  }, [isLoading]);
  
  if (!currentMoodEntry) return null;
  
  return (
    <div className="relative w-full">
      <Canvas 
        moodEntry={currentMoodEntry}
        imageUrl={imageUrl}
        onBack={onBack}
      />
    </div>
  );
};

export default EnhancedCanvas;
