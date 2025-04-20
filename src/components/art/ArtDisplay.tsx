
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
      <div className="text-center mb-4 opacity-0 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <h2 className="text-lg font-display text-canvas-foreground">Canvas for {mood}</h2>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-canvas-border bg-white relative">
        <img 
          src={artData.imagePlaceholder} 
          alt={`Art inspired by the mood: ${mood}`}
          className="w-full h-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 pb-8 transition-opacity duration-300 hover:from-black/80">
          <div className="text-center space-y-3 transform transition-transform duration-300 hover:scale-[1.02]">
            <p className="font-display text-xl md:text-2xl text-white leading-relaxed">{artData.quote}</p>
            <p className="text-sm md:text-base text-white/90 font-sans">— {artData.quoteAuthor}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4 opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
        <button 
          className="p-2.5 rounded-full hover:bg-canvas-border/80 transition-all duration-300 hover:scale-105 active:scale-95 group" 
          onClick={onShare}
          aria-label="Share your mood canvas"
        >
          <Share className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
        <button 
          className="p-2.5 rounded-full hover:bg-canvas-border/80 transition-all duration-300 hover:scale-105 active:scale-95 group" 
          onClick={onHistory}
          aria-label="View your canvas history"
        >
          <History className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
      </div>
      
      <button
        onClick={onNewCanvas}
        className="text-sm text-canvas-muted hover:text-canvas-accent transition-all duration-300 opacity-0 animate-fade-up hover:scale-105 active:scale-95"
        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;

