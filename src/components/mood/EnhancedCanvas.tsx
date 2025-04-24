
import React, { useState, useEffect } from 'react';
import Canvas from '../Canvas';
import { useQuoteRandomizer } from '@/hooks/useQuoteRandomizer';
import { MoodEntry } from '@/hooks/useMoodEntries';
import { supabase } from '@/integrations/supabase/client';
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
      // Only trigger once when component mounts
      const loadRelatedQuotes = async () => {
        try {
          await findRelatedQuotes(initialMoodEntry.quote);
        } catch (err) {
          // Silent fail to prevent endless notifications
          console.error("Error finding related quotes:", err);
        }
      };
      
      loadRelatedQuotes();
    }
  }, [initialMoodEntry?.id]); // Only re-run when mood entry ID changes
  
  // Fetch public URL for the image if it's a Supabase storage path
  useEffect(() => {
    const getPublicImageUrl = async () => {
      if (currentMoodEntry?.image_path) {
        try {
          // Skip if it's already a full URL
          if (currentMoodEntry.image_path.startsWith('http')) {
            setImageUrl(currentMoodEntry.image_path);
            return;
          }
          
          // Process storage path for Supabase
          let storagePath = currentMoodEntry.image_path;
          
          // Remove bucket prefix if present
          if (storagePath.startsWith('mood-images/')) {
            storagePath = storagePath.replace(/^mood-images\//, '');
          }
          
          const { data } = supabase.storage
            .from('mood-images')
            .getPublicUrl(storagePath);
            
          if (data?.publicUrl) {
            setImageUrl(data.publicUrl);
          }
        } catch (err) {
          console.error("Error getting public image URL:", err);
          // Avoid showing too many toasts
          if (currentMoodEntry.id !== initialMoodEntry.id) {
            toast.error("Could not load image from storage");
          }
        }
      }
    };
    
    getPublicImageUrl();
  }, [currentMoodEntry?.image_path]);
  
  // Auto-rotate through related quotes every 30 seconds
  useEffect(() => {
    if (!isLoading) {
      const quoteInterval = setInterval(() => {
        randomizeQuote();
      }, 30000); // 30 seconds
      
      return () => clearInterval(quoteInterval);
    }
  }, [isLoading, randomizeQuote]);
  
  if (!currentMoodEntry) return null;
  
  return (
    <div className="relative w-full">
      <Canvas 
        moodEntry={currentMoodEntry}
        imageUrl={imageUrl}
        onBack={onBack}
      />
    </div>
  );
};

export default EnhancedCanvas;
