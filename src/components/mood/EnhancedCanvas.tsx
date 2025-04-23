
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Canvas from '../Canvas';
import { useQuoteRandomizer } from '@/hooks/useQuoteRandomizer';
import { MoodEntry } from '@/hooks/useMoodEntries';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedCanvasProps {
  moodEntry: MoodEntry;
  imageUrl: string;
  onBack: () => void;
}

const EnhancedCanvas: React.FC<EnhancedCanvasProps> = ({ 
  moodEntry: initialMoodEntry, 
  imageUrl: initialImageUrl,
  onBack 
}) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const { 
    currentMoodEntry, 
    randomizeQuote, 
    isLoading,
    findRelatedQuotes
  } = useQuoteRandomizer(initialMoodEntry);
  
  // Initial search for related quotes when component mounts
  useEffect(() => {
    if (initialMoodEntry?.quote) {
      findRelatedQuotes(initialMoodEntry.quote);
    }
  }, [initialMoodEntry]);
  
  const handleRandomize = async () => {
    if (isLoading) return;
    
    const newQuote = await randomizeQuote();
    if (newQuote && newQuote !== currentMoodEntry) {
      toast.success("Found a related quote!");
    } else {
      toast.info("No more related quotes found");
    }
  };
  
  if (!currentMoodEntry) return null;
  
  return (
    <div className="relative w-full">
      <Canvas 
        moodEntry={currentMoodEntry}
        imageUrl={imageUrl}
        onBack={onBack}
      />
      
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRandomize}
          disabled={isLoading}
          className="bg-white/70 hover:bg-white/90 backdrop-blur-sm rounded-full shadow-warm"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 
          {isLoading ? 'Finding...' : 'Similar Quote'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedCanvas;
