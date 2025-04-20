
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
      <div className="text-center mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <h2 className="text-lg font-medium text-canvas-foreground">Canvas for {mood}</h2>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border border-canvas-border bg-white relative transition-all duration-700">
        <img 
          src={artData.imagePlaceholder} 
          alt={`Art inspired by the mood: ${mood}`}
          className="w-full h-auto"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 pb-6 md:p-6 md:pb-8">
          <div className="text-center space-y-2">
            <p className="text-xl md:text-2xl text-white italic leading-relaxed">"{artData.quote}"</p>
            <p className="text-sm md:text-base text-white/90">— {artData.quoteAuthor}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
        <button 
          className="p-2 rounded-full hover:bg-canvas-border transition-all duration-300 hover:scale-105 active:scale-95" 
          onClick={onShare}
          aria-label="Share your mood canvas"
        >
          <Share className="w-5 h-5 text-canvas-muted" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-canvas-border transition-all duration-300 hover:scale-105 active:scale-95" 
          onClick={onHistory}
          aria-label="View your canvas history"
        >
          <History className="w-5 h-5 text-canvas-muted" />
        </button>
      </div>
      
      <button
        onClick={onNewCanvas}
        className="text-sm text-canvas-muted hover:text-canvas-foreground transition-colors duration-300 opacity-0 animate-fade-in hover:scale-105 active:scale-95"
        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;

