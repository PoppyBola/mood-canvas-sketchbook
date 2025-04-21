
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
  description?: string;
}

export const useMoodEntry = (searchTerm: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: moodEntry, isLoading, error, refetch } = useQuery({
    queryKey: ['moodEntry', searchTerm],
    queryFn: async (): Promise<MoodEntry | null> => {
      if (!searchTerm) return null;

      console.log('Searching for mood:', searchTerm);
      
      try {
        // Try exact match first with case-insensitive array containment
        const { data: exactMatches, error: exactError } = await supabase
          .from('mood_entries')
          .select('*')
          .contains('mood_tags', [searchTerm.toLowerCase()]);

        if (exactError) {
          console.error('Error fetching exact matches:', exactError);
          throw new Error(`Failed to search moods: ${exactError.message}`);
        }

        if (exactMatches && exactMatches.length > 0) {
          console.log('Found exact matches:', exactMatches.length);
          const randomMatch = exactMatches[Math.floor(Math.random() * exactMatches.length)];
          return randomMatch;
        }

        // If no exact match, try fuzzy matching
        const { data: allEntries, error: allError } = await supabase
          .from('mood_entries')
          .select('id, mood_tags');

        if (allError) {
          console.error('Error fetching all entries:', allError);
          throw new Error(`Failed to get mood entries: ${allError.message}`);
        }

        if (!allEntries || allEntries.length === 0) {
          console.log('No entries found in database');
          throw new Error('No mood entries found in the database');
        }

        // Extract unique tags for fuzzy matching
        const allTags: string[] = [];
        allEntries.forEach(entry => {
          if (entry.mood_tags && Array.isArray(entry.mood_tags)) {
            entry.mood_tags.forEach(tag => allTags.push(tag));
          }
        });
        
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
          
          const { data: fuzzyMatches, error: fuzzyError } = await supabase
            .from('mood_entries')
            .select('*')
            .contains('mood_tags', [matchedTag]);

          if (fuzzyError) {
            console.error('Error fetching fuzzy matches:', fuzzyError);
            throw new Error(`Failed to fetch fuzzy matches: ${fuzzyError.message}`);
          }

          if (fuzzyMatches && fuzzyMatches.length > 0) {
            const randomFuzzyMatch = fuzzyMatches[Math.floor(Math.random() * fuzzyMatches.length)];
            return randomFuzzyMatch;
          }
        }

        // Fallback: Get a random entry
        console.log('Falling back to random entry');
        const { data: randomEntries, error: randomError } = await supabase
          .from('mood_entries')
          .select('*')
          .limit(5);

        if (randomError) {
          console.error('Error fetching random entries:', randomError);
          throw new Error(`Failed to fetch random entries: ${randomError.message}`);
        }

        if (randomEntries && randomEntries.length > 0) {
          return randomEntries[Math.floor(Math.random() * randomEntries.length)];
        }

        console.log('No entries found at all');
        throw new Error('No suitable mood matches found');
      } catch (err: any) {
        console.error('Error in useMoodEntry:', err);
        throw err;
      }
    },
    enabled: searchTerm !== '',
    retry: 1,
  });

  useEffect(() => {
    const getImageUrl = async () => {
      if (moodEntry?.image_path) {
        try {
          // Check if it's an external URL
          if (moodEntry.image_path.startsWith('http')) {
            setImageUrl(moodEntry.image_path);
            return;
          }
          
          // Handle path formats
          let storagePath = moodEntry.image_path;
          
          // Remove 'public/' prefix if present (common mistake when working with Supabase storage)
          if (storagePath.startsWith('public/')) {
            storagePath = storagePath.replace('public/', '');
          }
          
          // Remove 'mood_images/' prefix if duplicated in the path
          if (storagePath.startsWith('mood_images/mood_images/')) {
            storagePath = storagePath.replace('mood_images/', '');
          }
          
          // Get public URL from Supabase storage
          const { data } = supabase.storage
            .from('mood_images')
            .getPublicUrl(storagePath);
          
          if (data?.publicUrl) {
            console.log('Image URL:', data.publicUrl);
            setImageUrl(data.publicUrl);
          } else {
            console.warn('Could not get public URL for path:', storagePath);
            // Fallback to a placeholder
            setImageUrl('https://placehold.co/600x800/f8f0e3/957DAD?text=Mood+Canvas');
          }
        } catch (err) {
          console.error('Error getting image URL:', err);
          // Fallback to a placeholder
          setImageUrl('https://placehold.co/600x800/f8f0e3/957DAD?text=Mood+Canvas');
        }
      }
    };

    if (moodEntry) {
      getImageUrl();
    }
  }, [moodEntry]);

  return { moodEntry, imageUrl, isLoading, error, refetch };
};
