
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { supabase } from '../lib/supabase/client';

interface MoodEntry {
  id: string;
  quote: string;
  quote_author: string;
  image_path: string;
  mood_tags: string[];
  gradient_classes: string[];
}

export const useMoodEntry = (searchTerm: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: moodEntry, isLoading } = useQuery({
    queryKey: ['moodEntry', searchTerm],
    queryFn: async (): Promise<MoodEntry | null> => {
      // Try exact match first
      let { data: exactMatches, error: exactError } = await supabase
        .from('mood_entries')
        .select('*')
        .contains('mood_tags', [searchTerm.toLowerCase()])
        .limit(5);

      if (exactError) {
        console.error('Error fetching exact matches:', exactError);
        return null;
      }

      if (exactMatches && exactMatches.length > 0) {
        const randomMatch = exactMatches[Math.floor(Math.random() * exactMatches.length)];
        return randomMatch;
      }

      // If no exact match, try fuzzy matching
      const { data: allTags } = await supabase
        .from('mood_entries')
        .select('mood_tags');

      if (!allTags) return null;

      // Extract unique tags
      const uniqueTags = Array.from(new Set(allTags.flatMap(entry => entry.mood_tags)));
      
      const fuse = new Fuse(uniqueTags, {
        threshold: 0.4,
        minMatchCharLength: 2
      });

      const fuzzyResults = fuse.search(searchTerm);
      
      if (fuzzyResults.length > 0) {
        const matchedTag = fuzzyResults[0].item;
        
        let { data: fuzzyMatches, error: fuzzyError } = await supabase
          .from('mood_entries')
          .select('*')
          .contains('mood_tags', [matchedTag])
          .limit(5);

        if (fuzzyError) {
          console.error('Error fetching fuzzy matches:', fuzzyError);
          return null;
        }

        if (fuzzyMatches && fuzzyMatches.length > 0) {
          return fuzzyMatches[Math.floor(Math.random() * fuzzyMatches.length)];
        }
      }

      // Fallback: Get a random entry
      const { data: randomEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .limit(5);

      if (randomEntries && randomEntries.length > 0) {
        return randomEntries[Math.floor(Math.random() * randomEntries.length)];
      }

      return null;
    },
  });

  // Get image URL when moodEntry changes
  const getImageUrl = async () => {
    if (moodEntry?.image_path) {
      const { data } = supabase.storage
        .from('mood_images')
        .getPublicUrl(moodEntry.image_path);
      setImageUrl(data.publicUrl);
    }
  };

  // Effect to update image URL
  if (moodEntry && !imageUrl) {
    getImageUrl();
  }

  return { moodEntry, imageUrl, isLoading };
};

