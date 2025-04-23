
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { isDarkMode } = useTheme();
  
  useEffect(() => {
    // Start with loading state
    setIsLoading(true);
    
    // Simulate initial processing delay
    const initialTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [moodEntry.id]);
  
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };
  
  const handleShare = () => {
    toast.success("Sharing functionality coming soon!");
  };

  return (
    <div className="w-full max-w-md space-y-4 animate-fade-up">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-medium text-canvas-foreground dark:text-white">
          Canvas for <span className="italic">{moodEntry.mood_tags?.[0] || 'your mood'}</span>
        </h2>
        <p className="text-sm text-canvas-muted dark:text-gray-400 mt-1">A visual representation of your feelings</p>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl z-10">
            <div className="w-10 h-10 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
            <p className="mt-4 text-canvas-muted dark:text-gray-400">Creating your canvas...</p>
          </div>
        )}
        
        <div 
          className={cn(
            "relative rounded-xl overflow-hidden shadow-warm-lg transition-all duration-1000",
            isLoading ? "opacity-0" : "opacity-100 transform hover:scale-[1.01]",
            !isImageLoaded && !isLoading ? "min-h-[300px] bg-gray-100 dark:bg-gray-800" : ""
          )}
        >
          <div className="relative aspect-[4/5]">
            <img
              src={imageUrl}
              alt="Mood canvas background"
              className={cn(
                "w-full h-full object-cover transition-opacity duration-700",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
            />
            
            {/* Quote overlay with scrim for better readability */}
            <div 
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center p-6",
                "bg-gradient-to-t from-black/70 via-black/40 to-black/30",
                "backdrop-blur-[1px] transition-opacity duration-1000",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="max-w-[90%] text-center space-y-4">
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
      </div>

      <div className="flex justify-between items-center mt-6 px-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className={cn(
            "flex items-center gap-1",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-white/20"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className={cn(
            "flex items-center gap-1",
            isDarkMode ? "bg-gray-800/80 hover:bg-gray-700" : "bg-white/80 hover:bg-white"
          )}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default Canvas;
