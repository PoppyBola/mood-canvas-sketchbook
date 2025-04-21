
export interface HistoryEntry {
  id: string;
  user_id?: string;
  mood_text: string;
  mood?: string; // For backwards compatibility
  mood_entry_id?: string;
  personal_note?: string;
  image_url?: string;
  imagePlaceholder?: string; // For backwards compatibility
  gradient_classes?: string[];
  created_at: string;
  quote?: string;
  quote_author?: string;
  timestamp?: number;
}

export const getHistory = (): HistoryEntry[] => {
  try {
    const history = localStorage.getItem('moodHistory');
    return history ? JSON.parse(history) : [];
  } catch (err) {
    console.error('Error getting history from localStorage:', err);
    return [];
  }
};

export const addHistoryEntry = (entry: Partial<HistoryEntry>) => {
  try {
    const history = getHistory();
    
    const newEntry: HistoryEntry = {
      ...entry,
      id: entry.id || Date.now().toString(),
      mood_text: entry.mood_text || entry.mood || '',
      image_url: entry.image_url || entry.imagePlaceholder || '',
      created_at: entry.created_at || new Date().toISOString(),
      timestamp: entry.timestamp || Date.now(),
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Store up to 50 entries
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (err) {
    console.error('Error adding entry to history:', err);
    return getHistory();
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem('moodHistory');
  } catch (err) {
    console.error('Error clearing history:', err);
  }
};
