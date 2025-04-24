
import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette, PenLine } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

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
  const { isDarkMode } = useTheme();
  
  if (!isMobile) return null;

  // Handler functions to ensure events properly fire
  const handleInspirationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInspiration();
  };
  
  const handleCreateCanvasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCreateCanvas();
  };

  if (!showButtons) return null;

  return (
    <motion.div 
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 z-20",
        isDarkMode 
          ? "bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/80 backdrop-blur-md border-t border-gray-800" 
          : "bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-md border-t border-canvas-border/20"
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="container mx-auto flex justify-around items-center gap-3 max-w-md">
        <motion.div 
          className="flex-1"
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={handleCreateCanvasClick}
            className="w-full py-6 rounded-2xl bg-gradient-to-br from-canvas-accent to-canvas-accent/90 hover:from-canvas-accent/90 hover:to-canvas-accent/80 text-white shadow-warm transition-all duration-300"
          >
            <span className="flex items-center">
              <PenLine className="mr-2 h-5 w-5" />
              New Canvas
            </span>
          </Button>
        </motion.div>
        
        <motion.div 
          className="flex-1"
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={handleInspirationClick}
            variant="outline" 
            className={cn(
              "w-full py-6 rounded-2xl border-2 transition-all duration-300",
              isDarkMode 
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white" 
                : "border-canvas-border bg-white hover:bg-canvas-border/10"
            )}
          >
            <span className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Inspiration
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileActionBar;
