
export interface HistoryEntry {
  id: string;
  user_id?: string;
  mood_text: string;
  mood_entry_id?: string;
  personal_note?: string;
  image_url?: string;
  gradient_classes?: string[];
  created_at: string;
  
  // For backwards compatibility with local storage
  mood?: string;
  imagePlaceholder?: string;
  quote?: string;
  quote_author?: string;
  timestamp?: number;
}

export const getHistory = (): HistoryEntry[] => {
  try {
    const history = localStorage.getItem('moodHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const addHistoryEntry = (entry: Partial<HistoryEntry>) => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: entry.id || Date.now().toString(),
    mood_text: entry.mood_text || entry.mood || '',
    image_url: entry.image_url || entry.imagePlaceholder || '',
    created_at: entry.created_at || new Date().toISOString(),
    timestamp: entry.timestamp || Date.now(),
  };
  
  const updatedHistory = [newEntry, ...history].slice(0, 30);
  localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
};
