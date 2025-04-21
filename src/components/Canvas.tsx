
import React, { useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MoodEntry {
  id: string;
  quote: string;
  quote_author: string;
  gradient_classes: string[];
  mood_tags?: string[];
}

interface CanvasProps {
  moodEntry: MoodEntry;
  imageUrl: string;
  onBack: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ moodEntry, imageUrl, onBack }) => {
  useEffect(() => {
    // Simulate canvas load time
    const timer = setTimeout(() => {
      document.getElementById('canvas-container')?.classList.remove('opacity-0');
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const mood = moodEntry.mood_tags?.[0] || 'your mood';
  
  const handleShare = () => {
    // For now, just show a message that sharing is coming soon
    toast.success("Sharing functionality coming soon!");
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-medium text-canvas-foreground">Canvas for {mood}</h2>
      </div>
      
      <div 
        id="canvas-container"
        className="relative rounded-xl overflow-hidden shadow-xl transition-all duration-1000 opacity-0 transform hover:scale-[1.01]"
      >
        <div className="relative aspect-[4/5] bg-white">
          <img
            src={imageUrl}
            alt={`Mood canvas for ${mood}`}
            className="w-full h-full object-cover"
          />
          
          {/* Quote overlay - positioned directly on image */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 text-white">
            <blockquote className="font-medium text-lg mb-2">"{moodEntry.quote}"</blockquote>
            <cite className="text-sm opacity-90">— {moodEntry.quote_author}</cite>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 px-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1 hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-1 bg-white/80 hover:bg-white"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default Canvas;
