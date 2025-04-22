
import React from 'react';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { HistoryEntry } from '../../utils/historyUtils';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface HistoryViewProps {
  onClose: () => void;
  entries: HistoryEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ onClose, entries }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in backdrop-blur-sm">
      <div className={`fixed inset-x-4 ${isMobile ? 'top-[10%] bottom-[10%]' : 'top-[15%] bottom-[15%]'} bg-white rounded-lg shadow-xl p-5 md:max-w-3xl md:mx-auto animate-scale-in`}>
        <div className="flex justify-between items-center mb-5 border-b pb-2">
          <h2 className="text-xl font-medium">Your Canvas History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="space-y-4 pr-2">
            {entries.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-canvas-muted">No canvases yet.</p>
                <Button variant="outline" onClick={onClose}>Create your first mood canvas!</Button>
              </div>
            ) : (
              <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 border border-canvas-border rounded-lg hover:border-canvas-accent transition-colors shadow-sm ${isMobile ? 'mb-4' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-canvas-border bg-gray-50">
                        <img
                          src={entry.image_url || entry.imagePlaceholder}
                          alt={entry.mood_text || entry.mood || 'Mood canvas'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/f8f0e3/957DAD?text=Mood+Canvas';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-base capitalize">{entry.mood_text || entry.mood}</p>
                        <p className="text-xs text-canvas-muted mb-2">
                          {formatDistanceToNow(new Date(entry.created_at || entry.timestamp || 0), { addSuffix: true })}
                        </p>
                        <p className="text-sm italic line-clamp-2">{entry.quote}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HistoryView;
