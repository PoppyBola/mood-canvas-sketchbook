
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface MoodSelectorProps {
  onSubmit: (mood: string) => void;
  onHistoryOpen: () => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSubmit, onHistoryOpen }) => {
  const [mood, setMood] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mood);
  };

  return (
    <div className="w-full space-y-6 text-center">
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
        />
        <Button type="submit" className="w-full bg-canvas-accent hover:bg-canvas-accent/90">
          Create My Canvas
        </Button>
      </form>

      <div className="pt-2">
        <button
          onClick={onHistoryOpen}
          className="flex items-center gap-2 mx-auto text-sm text-canvas-muted hover:text-canvas-accent transition-colors"
        >
          <Clock className="w-4 h-4" />
          <span>View history</span>
        </button>
      </div>
    </div>
  );
};

export default MoodSelector;
