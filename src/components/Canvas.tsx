
import React, { useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  
  const handleShare = () => {
    toast.success("Sharing functionality coming soon!");
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-medium text-canvas-foreground">Your Daily Quote</h2>
      </div>
      
      <div 
        id="canvas-container"
        className="relative rounded-xl overflow-hidden shadow-xl transition-all duration-1000 opacity-0 transform hover:scale-[1.01]"
      >
        <div className="relative aspect-[4/5] bg-white">
          <img
            src={imageUrl}
            alt="Mood canvas background"
            className="w-full h-full object-cover"
          />
          
          {/* Centered quote overlay with improved typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]">
            <div className="max-w-[85%] text-center space-y-4">
              <blockquote 
                className={cn(
                  "font-display text-2xl md:text-3xl text-white leading-relaxed",
                  "tracking-wide drop-shadow-lg"
                )}
              >
                "{moodEntry.quote}"
              </blockquote>
              <cite className="block text-sm md:text-base text-white/90 font-sans mt-2 italic">
                — {moodEntry.quote_author}
              </cite>
            </div>
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
