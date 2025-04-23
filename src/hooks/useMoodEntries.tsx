
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Fuse from 'fuse.js';

export interface MoodEntry {
  id: string;
  mood_tags: string[];
  quote: string;
  quote_author: string;
  image_path: string;
  gradient_classes: string[];
  popularity_score?: number;
}

export function useMoodEntries() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize Fuse for fuzzy search once we have entries
  const [fuseSearch, setFuseSearch] = useState<Fuse<MoodEntry> | null>(null);

  useEffect(() => {
    async function fetchMoodEntries() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .order('popularity_score', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setEntries(data);
          
          // Create fuzzy search instance with the loaded entries
          const fuse = new Fuse(data, {
            includeScore: true,
            threshold: 0.4,
            keys: ['mood_tags'],
            ignoreLocation: true,
            useExtendedSearch: true
          });
          
          setFuseSearch(fuse);
        }
      } catch (err) {
        console.error("Error fetching mood entries:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    fetchMoodEntries();
  }, []);

  /**
   * Find the best matching mood entry for the given mood text
   */
  const findMatch = (moodText: string): MoodEntry | null => {
    if (!moodText || !fuseSearch || entries.length === 0) {
      return entries.length > 0 ? getRandomEntry() : null;
    }
    
    // First try exact match with mood tags
    const exactMatch = entries.find(entry => 
      entry.mood_tags.some(tag => 
        tag.toLowerCase() === moodText.toLowerCase())
    );
    
    if (exactMatch) return exactMatch;
    
    // Try fuzzy search
    const results = fuseSearch.search(moodText);
    if (results.length > 0) {
      return results[0].item;
    }
    
    // Fallback to random
    return getRandomEntry();
  };

  /**
   * Get a random mood entry
   */
  const getRandomEntry = (): MoodEntry | null => {
    if (entries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
  };

  /**
   * Get a daily inspiration (biased towards popular entries)
   */
  const getDailyInspiration = (): MoodEntry | null => {
    if (entries.length === 0) return null;
    
    // Bias towards more popular entries 
    const popularEntries = entries
      .filter(entry => entry.popularity_score && entry.popularity_score > 0)
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
    
    if (popularEntries.length > 0) {
      // Pick from top 5 popular entries
      const topEntries = popularEntries.slice(0, Math.min(5, popularEntries.length));
      const randomIndex = Math.floor(Math.random() * topEntries.length);
      return topEntries[randomIndex];
    }
    
    return getRandomEntry();
  };

  return {
    entries,
    loading,
    error,
    findMatch,
    getRandomEntry,
    getDailyInspiration
  };
}
