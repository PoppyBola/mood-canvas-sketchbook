
import React from 'react';
import EnhancedCanvas from './EnhancedCanvas';
import { MoodEntry } from '@/hooks/useMoodEntries';

interface MoodCanvasProps {
  moodEntry: MoodEntry | null;
  imageUrl: string | null;
  onBack: () => void;
}

const MoodCanvas: React.FC<MoodCanvasProps> = ({ moodEntry, imageUrl, onBack }) => {
  if (!moodEntry || !imageUrl) return null;
  
  return (
    <EnhancedCanvas
      moodEntry={moodEntry}
      imageUrl={imageUrl}
      onBack={onBack}
    />
  );
};

export default MoodCanvas;
