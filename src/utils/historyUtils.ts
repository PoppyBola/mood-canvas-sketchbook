
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
  quoteAuthor?: string;
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

export const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    timestamp: Date.now(),
  };
  
  const updatedHistory = [newEntry, ...history].slice(0, 30);
  localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
};
