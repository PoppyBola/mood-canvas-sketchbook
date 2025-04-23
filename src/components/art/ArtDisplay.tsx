
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
      {/* Canvas heading above image */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <h2 className="text-xl font-display text-canvas-foreground text-center tracking-wide">
          Canvas for <span className="font-semibold capitalize">{mood}</span>
        </h2>
      </div>

      <div className="rounded-2.5xl overflow-hidden shadow-warm-lg transition-shadow duration-[1500ms] ease-in-out hover:shadow-warm-lg border border-canvas-border bg-white relative">
        <div className="relative aspect-[4/5]">
          {/* Image */}
          <img
            src={artData.imagePlaceholder}
            alt={`Art inspired by the mood: ${mood}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          {/* Quote overlay with elegant scrim and smooth scale on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 transition-transform duration-700 hover:scale-[1.02]">
            <div className="text-center space-y-3">
              <p className="font-display text-xl md:text-2xl text-white leading-relaxed tracking-wide drop-shadow-lg">
                "{artData.quote}"
              </p>
              <p className="text-sm md:text-base text-white/90 font-sans mt-2 drop-shadow">
                — {artData.quoteAuthor}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex justify-center space-x-6 pt-4 opacity-0 animate-fade-up"
        style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
      >
        <button
          className="p-3 rounded-full hover:bg-canvas-border/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
          onClick={onShare}
          aria-label="Share your mood canvas"
          title="Share your mood canvas"
          type="button"
        >
          <Share className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
        <button
          className="p-3 rounded-full hover:bg-canvas-border/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
          onClick={onHistory}
          aria-label="View your canvas history"
          title="View your canvas history"
          type="button"
        >
          <History className="w-5 h-5 text-canvas-muted group-hover:text-canvas-accent transition-colors" />
        </button>
      </div>

      <button
        onClick={onNewCanvas}
        className="text-sm text-canvas-muted hover:text-canvas-accent transition-all duration-300 opacity-0 animate-fade-up mx-auto block hover:scale-105 active:scale-95"
        style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
        type="button"
      >
        Create New Canvas
      </button>
    </div>
  );
};

export default ArtDisplay;
