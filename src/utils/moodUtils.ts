
import Fuse from 'fuse.js';
import { findArtForMood, MoodData } from '../data/moodData';

// This is a client-side implementation that will later be replaced with Supabase
// List of mood keywords to match against
const AVAILABLE_MOODS = [
  'happy', 'sad', 'calm', 'excited', 'peaceful', 'anxious', 'content', 
  'frustrated', 'hopeful', 'inspired', 'angry', 'relaxed', 'energetic',
  'tired', 'grateful', 'lonely', 'curious', 'bored', 'confident', 'overwhelmed'
];

const fuseOptions = {
  includeScore: true,
  threshold: 0.4, // Lower threshold means more strict matching
  minMatchCharLength: 2
};

const fuse = new Fuse(AVAILABLE_MOODS, fuseOptions);

/**
 * Enhanced mood matching that uses fuzzy search with fallbacks
 */
export const getEnhancedMoodMatch = (userInput: string): MoodData => {
  // Step 1: Try exact match first
  const exactMatch = findArtForMood(userInput.toLowerCase().trim());
  
  // If we have an exact match, use it
  if (exactMatch && exactMatch.quote) {
    return exactMatch;
  }
  
  // Step 2: Try fuzzy matching
  const fuzzyResults = fuse.search(userInput);
  
  if (fuzzyResults.length > 0) {
    // Get the best fuzzy match
    const bestMatch = fuzzyResults[0].item;
    console.log(`Fuzzy matched "${userInput}" to "${bestMatch}"`);
    
    // Use the matched mood to find art
    return findArtForMood(bestMatch);
  }
  
  // Step 3: Fallback to a random mood if no matches
  const randomIndex = Math.floor(Math.random() * AVAILABLE_MOODS.length);
  const randomMood = AVAILABLE_MOODS[randomIndex];
  console.log(`No match found for "${userInput}", falling back to random mood: "${randomMood}"`);
  
  return findArtForMood(randomMood);
};
