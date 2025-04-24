
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
        .slice(0, 3); // Limit to 3 words to avoid complex queries
        
      if (words.length === 0) {
        setRelatedQuotes([]);
        setIsLoading(false);
        return;
      }
      
      // Use a more reliable query approach - search for any quote containing any of the words
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .textSearch('quote', words.join(' | ')); // Use text search with OR operator
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Filter out the current quote
        const filteredQuotes = currentMoodEntry 
          ? data.filter(quote => quote.id !== currentMoodEntry.id) 
          : data;
          
        setRelatedQuotes(filteredQuotes);
      } else {
        // Fallback - get random quotes
        const { data: randomQuotes, error: randomError } = await supabase
          .from('mood_entries')
          .select('*')
          .limit(5);
          
        if (randomError) throw randomError;
        
        if (randomQuotes) {
          const filteredRandomQuotes = currentMoodEntry
            ? randomQuotes.filter(quote => quote.id !== currentMoodEntry.id)
            : randomQuotes;
            
          setRelatedQuotes(filteredRandomQuotes);
        } else {
          setRelatedQuotes([]);
        }
      }
    } catch (err) {
      console.error('Error finding related quotes:', err);
      // Silently handle error to prevent endless toast notifications
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
  const randomizeQuote = () => {
    if (!currentMoodEntry) return null;
    
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
