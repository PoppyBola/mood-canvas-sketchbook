
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      try {
        // Trim and convert to lowercase for consistent matching
        const normalizedSearch = searchTerm.trim().toLowerCase();

        // First, try exact match
        const { data: exactMatches, error: exactError } = await supabase
          .from('mood_entries')
          .select('*')
          .contains('mood_tags', [normalizedSearch]);

        if (exactError) {
          console.error('Exact match error:', exactError);
          throw exactError;
        }

        if (exactMatches && exactMatches.length > 0) {
          return exactMatches[Math.floor(Math.random() * exactMatches.length)];
        }

        // If no exact match, fetch all entries for fuzzy matching
        const { data: allEntries, error: allError } = await supabase
          .from('mood_entries')
          .select('*');

        if (allError) {
          console.error('Fetching all entries error:', allError);
          throw allError;
        }

        if (!allEntries || allEntries.length === 0) {
          toast.error('No mood entries found');
          return null;
        }

        // Collect all unique tags
        const allTags = allEntries.flatMap(entry => 
          entry.mood_tags.map(tag => tag.toLowerCase())
        );
        const uniqueTags = [...new Set(allTags)];

        // Perform fuzzy matching on tags
        const fuse = new Fuse(uniqueTags, {
          threshold: 0.4,
          minMatchCharLength: 2
        });

        const fuzzyResults = fuse.search(normalizedSearch);
        
        if (fuzzyResults.length > 0) {
          const bestMatch = fuzzyResults[0].item;
          
          const { data: fuzzyMatches, error: fuzzyError } = await supabase
            .from('mood_entries')
            .select('*')
            .contains('mood_tags', [bestMatch]);

          if (fuzzyError) {
            console.error('Fuzzy match error:', fuzzyError);
            throw fuzzyError;
          }

          if (fuzzyMatches && fuzzyMatches.length > 0) {
            return fuzzyMatches[Math.floor(Math.random() * fuzzyMatches.length)];
          }
        }

        // Fallback: Get a random entry if no matches found
        return allEntries[Math.floor(Math.random() * allEntries.length)];
      } catch (err) {
        console.error('Mood entry fetch error:', err);
        toast.error('Failed to find a mood match. Using a random mood.');
        
        // Fetch a random entry as ultimate fallback
        try {
          const { data: randomEntries, error: randomError } = await supabase
            .from('mood_entries')
            .select('*')
            .limit(5);

          if (randomError) throw randomError;
          
          return randomEntries 
            ? randomEntries[Math.floor(Math.random() * randomEntries.length)]
            : null;
        } catch (fallbackErr) {
          console.error('Fallback random entry error:', fallbackErr);
          return null;
        }
      }
    },
    enabled: !!searchTerm,
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
          
          // Handle Supabase storage paths
          let storagePath = moodEntry.image_path.replace(/^public\//, '');
          
          const { data } = supabase.storage
            .from('mood_images')
            .getPublicUrl(storagePath);
          
          if (data?.publicUrl) {
            setImageUrl(data.publicUrl);
          } else {
            // Fallback to a placeholder
            setImageUrl('https://placehold.co/600x800/f8f0e3/957DAD?text=Mood+Canvas');
            toast.warning('Could not load mood image');
          }
        } catch (err) {
          console.error('Image URL error:', err);
          setImageUrl('https://placehold.co/600x800/f8f0e3/957DAD?text=Mood+Canvas');
          toast.warning('Error loading mood image');
        }
      }
    };

    if (moodEntry) {
      getImageUrl();
    }
  }, [moodEntry]);

  return { 
    moodEntry, 
    imageUrl, 
    isLoading, 
    error, 
    refetch 
  };
};
