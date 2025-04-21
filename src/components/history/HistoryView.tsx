
import React from 'react';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HistoryEntry } from '../../utils/historyUtils';
import { formatDistanceToNow } from 'date-fns';

interface HistoryViewProps {
  onClose: () => void;
  entries: HistoryEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ onClose, entries }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in backdrop-blur-sm">
      <div className="fixed inset-x-4 top-[10%] bottom-[10%] bg-white rounded-lg shadow-xl p-4 md:max-w-md md:mx-auto animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-normal">Canvas History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="space-y-4 pr-2">
            {entries.length === 0 ? (
              <p className="text-canvas-muted text-center py-8">No canvases yet. Create your first mood canvas!</p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-canvas-border rounded-lg hover:border-canvas-accent transition-colors shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-canvas-border">
                      <img
                        src={entry.image_url || entry.imagePlaceholder}
                        alt={entry.mood_text || entry.mood}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{entry.mood_text || entry.mood}</p>
                      <p className="text-xs text-canvas-muted mb-2">
                        {formatDistanceToNow(new Date(entry.created_at || entry.timestamp || 0), { addSuffix: true })}
                      </p>
                      <p className="text-sm italic line-clamp-2">{entry.quote}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HistoryView;
