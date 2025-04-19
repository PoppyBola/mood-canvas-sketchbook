
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
      <div className="rounded-lg overflow-hidden shadow-sm border border-canvas-border bg-white relative">
        <img 
          src={artData.imagePlaceholder} 
          alt={`Art inspired by the mood: ${mood}`}
          className="w-full h-auto"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 pt-16">
          <div className="space-y-4 text-white">
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Canvas for</p>
              <p className="text-xl italic">{mood}</p>
            </div>

            <div className="space-y-2 px-2">
              <p className="text-base text-white italic leading-relaxed">"{artData.quote}"</p>
              <p className="text-sm text-white/80">— {artData.quoteAuthor}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
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
        className="text-sm text-canvas-muted hover:text-canvas-foreground transition-colors opacity-0 animate-fade-in"
        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;
