
export interface HistoryEntry {
  id: string;
  mood: string;
  imagePlaceholder: string;
  quote: string;
  quoteAuthor: string;
  timestamp: number;
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
    timestamp: Date.now(),
  };
  
  const updatedHistory = [newEntry, ...history].slice(0, 30);
  localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
};
