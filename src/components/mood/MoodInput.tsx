
import React from 'react';

interface MoodInputProps {
  onSubmit: (mood: string) => void;
}

const MoodInput: React.FC<MoodInputProps> = ({ onSubmit }) => {
  const [mood, setMood] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood);
      setMood('');
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto animate-fade-in relative">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-2xl font-normal mb-2 animate-fade-in">How are you feeling today?</h2>
        <p className="text-canvas-muted text-sm animate-fade-in opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>Express it in a single word</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative">
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Your mood in one word..."
            className="w-full p-3 text-center text-lg bg-white/5 backdrop-blur-sm border-b-2 border-canvas-border focus:border-canvas-accent outline-none transition-all placeholder:text-canvas-muted/50 focus:ring-2 focus:ring-canvas-accent/20 rounded-md"
            maxLength={20}
          />
          <div className="absolute inset-0 bg-white/5 blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        
        <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <button
            type="submit"
            disabled={!mood.trim()}
            className="px-8 py-2.5 bg-canvas-accent text-canvas-foreground rounded-full hover:bg-opacity-90 active:bg-opacity-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-105 active:scale-95"
          >
            Create Canvas
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoodInput;
