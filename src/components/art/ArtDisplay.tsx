
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
    <div className="w-full max-w-sm mx-auto animate-fade-in space-y-6">
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <h2 className="text-xl font-display text-canvas-foreground text-center">Canvas for <span className="font-semibold">{mood}</span></h2>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-700 border border-canvas-border bg-white relative">
        <div className="relative aspect-[4/5]">
          {/* Image */}
          <img 
            src={artData.imagePlaceholder} 
            alt={`Art inspired by the mood: ${mood}`}
            className="w-full h-full object-cover"
          />
          
          {/* Quote overlay - positioned absolutely over the image with elegant scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
            <div className="text-center space-y-3 transform transition-transform duration-500 hover:scale-[1.02]">
              <p className="font-display text-xl md:text-2xl text-white leading-relaxed tracking-wide">{artData.quote}</p>
              <p className="text-sm md:text-base text-white/90 font-sans mt-2">— {artData.quoteAuthor}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4 opacity-0 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
        <button 
          className="p-3 rounded-full hover:bg-canvas-border/50 transition-all duration-300 hover:scale-110 active:scale-95 group" 
          onClick={onShare}
          aria-label="Share your mood canvas"
        >
          <Share className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
        <button 
          className="p-3 rounded-full hover:bg-canvas-border/50 transition-all duration-300 hover:scale-110 active:scale-95 group" 
          onClick={onHistory}
          aria-label="View your canvas history"
        >
          <History className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
      </div>
      
      <button
        onClick={onNewCanvas}
        className="text-sm text-canvas-muted hover:text-canvas-accent transition-all duration-300 opacity-0 animate-fade-up mx-auto block hover:scale-105 active:scale-95"
        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;
