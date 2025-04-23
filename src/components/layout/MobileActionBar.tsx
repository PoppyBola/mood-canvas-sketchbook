
import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette, PenLine } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileActionBarProps {
  onInspiration: () => void;
  onCreateCanvas: () => void;
  showButtons?: boolean;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  onInspiration, 
  onCreateCanvas,
  showButtons = true
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 z-20 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-sm border-t border-canvas-border/20 transition-transform duration-300">
      <div className="container mx-auto flex justify-around items-center">
        {showButtons && (
          <>
            <Button
              onClick={onCreateCanvas}
              className="flex-1 mx-2 py-6 rounded-2xl bg-canvas-accent hover:bg-canvas-accent/90 text-white shadow-warm transition-all"
            >
              <PenLine className="mr-2 h-5 w-5" />
              New Canvas
            </Button>
            
            <Button
              onClick={onInspiration}
              variant="outline" 
              className="flex-1 mx-2 py-6 rounded-2xl border-canvas-border bg-white hover:bg-canvas-border/10 shadow-warm transition-all"
            >
              <Palette className="mr-2 h-5 w-5" />
              Inspiration
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileActionBar;
