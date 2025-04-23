
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry } from './useMoodEntries';
import { toast } from 'sonner';

/**
 * This hook provides functionality to find and randomize quotes that share the same words
 */
export const useQuoteRandomizer = (initialMoodEntry: MoodEntry | null) => {
  const [currentMoodEntry, setCurrentMoodEntry] = useState<MoodEntry | null>(initialMoodEntry);
  const [relatedQuotes, setRelatedQuotes] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Find related quotes when mood entry changes
  useEffect(() => {
    if (initialMoodEntry) {
      setCurrentMoodEntry(initialMoodEntry);
    }
  }, [initialMoodEntry]);

  // Function to find quotes containing the same reference words
  const findRelatedQuotes = async (searchText: string) => {
    if (!searchText) return;
    
    setIsLoading(true);
    try {
      // First, try matching quotes containing similar words
      const words = searchText.toLowerCase()
        .split(' ')
        .filter(word => word.length > 3) // Only consider meaningful words
        .map(word => `%${word}%`);
        
      if (words.length === 0) {
        setRelatedQuotes([]);
        setIsLoading(false);
        return;
      }
      
      // Query for quotes containing any of the extracted words
      let query = supabase.from('mood_entries').select('*');
      
      // Build a complex query to match any word
      for (const word of words) {
        query = query.or(`quote.ilike.${word}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Filter out the current quote
        const filteredQuotes = currentMoodEntry 
          ? data.filter(quote => quote.id !== currentMoodEntry.id) 
          : data;
          
        setRelatedQuotes(filteredQuotes);
      } else {
        setRelatedQuotes([]);
      }
    } catch (err) {
      console.error('Error finding related quotes:', err);
      toast.error('Could not find related quotes');
      setRelatedQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a random related quote
  const getRandomRelatedQuote = () => {
    if (relatedQuotes.length === 0) {
      return currentMoodEntry;
    }
    
    const randomIndex = Math.floor(Math.random() * relatedQuotes.length);
    return relatedQuotes[randomIndex];
  };
  
  // Randomize the current quote based on related quotes
  const randomizeQuote = async () => {
    if (!currentMoodEntry) return null;
    
    // If we haven't searched for related quotes yet, do it now
    if (relatedQuotes.length === 0) {
      await findRelatedQuotes(currentMoodEntry.quote);
    }
    
    // If we have related quotes, select a random one
    if (relatedQuotes.length > 0) {
      const newQuote = getRandomRelatedQuote();
      setCurrentMoodEntry(newQuote);
      return newQuote;
    }
    
    return currentMoodEntry;
  };

  return {
    currentMoodEntry,
    relatedQuotes,
    isLoading,
    findRelatedQuotes,
    randomizeQuote
  };
};
