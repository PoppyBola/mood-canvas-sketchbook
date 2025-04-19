
import React from 'react';
import { Share, History } from 'lucide-react';
import type { MoodData } from '../../data/moodData';

interface ArtDisplayProps {
  mood: string;
  artData: MoodData;
  onShare: () => void;
  onHistory: () => void;
  onNewCanvas: () => void;
}

const ArtDisplay: React.FC<ArtDisplayProps> = ({ 
  mood, 
  artData,
  onShare,
  onHistory,
  onNewCanvas
}) => {
  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in space-y-8">
      <div className="rounded-lg overflow-hidden shadow-sm border border-canvas-border bg-white">
        <img 
          src={artData.imagePlaceholder} 
          alt={`Art inspired by the mood: ${mood}`}
          className="w-full h-auto"
        />
      </div>
      
      <div className="text-center space-y-6">
        <div className="space-y-1">
          <p className="text-canvas-muted text-sm">Canvas for</p>
          <p className="text-xl italic">{mood}</p>
        </div>

        <div className="space-y-2 px-4">
          <p className="text-base text-canvas-foreground italic">"{artData.quote}"</p>
          <p className="text-sm text-canvas-muted">— {artData.quoteAuthor}</p>
        </div>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4">
        <button 
          className="p-2 rounded-full hover:bg-canvas-border transition-all" 
          onClick={onShare}
          aria-label="Share your mood canvas"
        >
          <Share className="w-5 h-5 text-canvas-muted" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-canvas-border transition-all" 
          onClick={onHistory}
          aria-label="View your canvas history"
        >
          <History className="w-5 h-5 text-canvas-muted" />
        </button>
      </div>
      
      <button
        onClick={onNewCanvas}
        className="text-sm text-canvas-muted hover:text-canvas-foreground transition-colors"
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;
