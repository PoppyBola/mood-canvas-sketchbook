
import React from 'react';
import { Share, History } from 'lucide-react';

interface ArtDisplayProps {
  mood: string;
}

const ArtDisplay: React.FC<ArtDisplayProps> = ({ mood }) => {
  // In Phase 1, we're using a static placeholder image
  const placeholderArt = "https://picsum.photos/seed/moodart/800/1000";
  
  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in space-y-6">
      <div className="rounded-lg overflow-hidden shadow-sm border border-canvas-border bg-white">
        <img 
          src={placeholderArt} 
          alt={`Art inspired by the mood: ${mood}`}
          className="w-full h-auto"
        />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-canvas-muted text-sm">Inspired by</p>
        <p className="text-xl italic">{mood || "Serene"}</p>
      </div>
      
      <div className="flex justify-center space-x-6 pt-4">
        <button className="p-2 rounded-full hover:bg-canvas-border transition-all" aria-label="Share your mood canvas">
          <Share className="w-5 h-5 text-canvas-muted" />
        </button>
        <button className="p-2 rounded-full hover:bg-canvas-border transition-all" aria-label="View your canvas history">
          <History className="w-5 h-5 text-canvas-muted" />
        </button>
      </div>
    </div>
  );
};

export default ArtDisplay;
