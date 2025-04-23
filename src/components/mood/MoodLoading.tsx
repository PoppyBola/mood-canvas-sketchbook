
import React from 'react';

interface MoodLoadingProps {
  moodSearch: string;
}

const MoodLoading: React.FC<MoodLoadingProps> = ({ moodSearch }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <p className="text-lg text-canvas-foreground/80 animate-pulse">Finding the perfect canvas for "{moodSearch}"...</p>
      <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
    </div>
  );
};

export default MoodLoading;
