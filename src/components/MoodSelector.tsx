
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';

interface MoodSelectorProps {
  onSubmit: (mood: string) => void;
  onHistoryOpen: () => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSubmit, onHistoryOpen }) => {
  const [mood, setMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggested moods for quick selection
  const suggestedMoods = [
    'peaceful', 'excited', 'grateful', 'creative', 
    'reflective', 'energetic', 'calm', 'hopeful'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mood.trim()) {
      setIsSubmitting(true);
      onSubmit(mood);
      
      // Reset submission state after a brief period
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  const handleSuggestedMood = (suggestedMood: string) => {
    setMood(suggestedMood);
    // Submit with a slight delay to show the selected mood
    setTimeout(() => {
      onSubmit(suggestedMood);
    }, 100);
  };

  return (
    <div className="w-full space-y-6 text-center animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium text-canvas-foreground">How are you feeling today?</h1>
        <p className="text-canvas-muted">Enter a mood to create your daily canvas</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. peaceful, excited, contemplative..."
          className="px-4 py-3 rounded-lg border border-canvas-border bg-white/70 backdrop-blur-sm focus:ring focus:ring-canvas-accent/30 focus:border-canvas-accent outline-none transition-all"
          disabled={isSubmitting}
          autoFocus
        />
        <Button 
          type="submit" 
          className="w-full bg-canvas-accent hover:bg-canvas-accent/90 transition-all"
          disabled={!mood.trim() || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create My Canvas'}
        </Button>
      </form>

      {/* Mood suggestions */}
      <div className="pt-2">
        <p className="text-sm text-canvas-muted mb-3">Or try one of these:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedMoods.map(suggestedMood => (
            <button
              key={suggestedMood}
              onClick={() => handleSuggestedMood(suggestedMood)}
              className="px-3 py-1.5 bg-white/60 hover:bg-white/90 rounded-full text-xs border border-canvas-border/40 text-canvas-foreground transition-all hover:scale-105 active:scale-95"
            >
              {suggestedMood}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onHistoryOpen}
          className="flex items-center gap-2 mx-auto text-sm text-canvas-muted hover:text-canvas-accent transition-colors"
          type="button"
        >
          <Clock className="w-4 h-4" />
          <span>View history</span>
        </button>
      </div>
    </div>
  );
};

export default MoodSelector;
