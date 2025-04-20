import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabase/client';

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

  const { data: moodEntry, isLoading, error } = useQuery({
    queryKey: ['moodEntry', searchTerm],
    queryFn: async (): Promise<MoodEntry | null> => {
      if (!searchTerm) return null;

      console.log('Searching for mood:', searchTerm);
      
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
        console.log('Found exact matches:', exactMatches.length);
        const randomMatch = exactMatches[Math.floor(Math.random() * exactMatches.length)];
        return randomMatch;
      }

      // If no exact match, try fuzzy matching
      const { data: allEntries } = await supabase
        .from('mood_entries')
        .select('id, mood_tags');

      if (!allEntries || allEntries.length === 0) {
        console.log('No entries found in database');
        return null;
      }

      // Extract unique tags
      const allTags = allEntries.flatMap(entry => entry.mood_tags);
      const uniqueTags = Array.from(new Set(allTags));
      
      console.log('Available tags for fuzzy matching:', uniqueTags);
      
      const fuse = new Fuse(uniqueTags, {
        threshold: 0.4,
        minMatchCharLength: 2
      });

      const fuzzyResults = fuse.search(searchTerm);
      
      if (fuzzyResults.length > 0) {
        const matchedTag = fuzzyResults[0].item;
        console.log(`Fuzzy matched "${searchTerm}" to "${matchedTag}"`);
        
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
          const randomFuzzyMatch = fuzzyMatches[Math.floor(Math.random() * fuzzyMatches.length)];
          return randomFuzzyMatch;
        }
      }

      // Fallback: Get a random entry
      console.log('Falling back to random entry');
      const { data: randomEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .limit(5);

      if (randomEntries && randomEntries.length > 0) {
        return randomEntries[Math.floor(Math.random() * randomEntries.length)];
      }

      console.log('No entries found at all');
      return null;
    },
    enabled: searchTerm !== '',
  });

  useEffect(() => {
    const getImageUrl = async () => {
      if (moodEntry?.image_path) {
        try {
          // Check if it's an external URL
          if (moodEntry.image_path.startsWith('http')) {
            setImageUrl(moodEntry.image_path);
          } else {
            // Otherwise, it's a Supabase storage path
            const { data } = supabase.storage
              .from('mood_images')
              .getPublicUrl(moodEntry.image_path);
            
            if (data?.publicUrl) {
              console.log('Image URL:', data.publicUrl);
              setImageUrl(data.publicUrl);
            }
          }
        } catch (err) {
          console.error('Error getting image URL:', err);
        }
      }
    };

    if (moodEntry) {
      getImageUrl();
    }
  }, [moodEntry]);

  return { moodEntry, imageUrl, isLoading, error };
};
