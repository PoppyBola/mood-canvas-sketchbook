
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CircleDot, Share2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useMoodEntries, MoodEntry } from "@/hooks/useMoodEntries";

interface DailyQuoteModalProps {
  onClose: () => void;
}

const DailyQuoteModal: React.FC<DailyQuoteModalProps> = ({ onClose }) => {
  const { getDailyInspiration, loading } = useMoodEntries();
  const [quote, setQuote] = useState<MoodEntry | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  const fetchDailyQuote = async () => {
    try {
      const dailyQuote = getDailyInspiration();
      
      if (dailyQuote) {
        setQuote(dailyQuote);
        
        // Get public URL for image if it's a storage path
        if (dailyQuote.image_path) {
          try {
            if (dailyQuote.image_path.startsWith('http')) {
              setImageUrl(dailyQuote.image_path);
            } else {
              // Handle Supabase storage paths
              let storagePath = dailyQuote.image_path.replace(/^mood-images\//, '');
              
              const { data } = supabase.storage
                .from('mood-images')
                .getPublicUrl(storagePath);
                
              if (data) {
                setImageUrl(data.publicUrl);
              }
            }
          } catch (err) {
            console.error("Error getting image URL:", err);
            // Fallback to the image path directly
            setImageUrl(dailyQuote.image_path);
          }
        }
      }
    } catch (err) {
      toast.error("Couldn't load inspiration.");
      console.error("Error fetching daily quote:", err);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  const handleShare = async () => {
    if (!quote) return;
    const shareText = `"${quote.quote}" — ${quote.quote_author}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mood Canvas Inspiration',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Quote copied to clipboard!');
      }
    } catch (err) {
      toast.error('Could not share the quote.');
    }
  };

  const handleClose = () => {
    // Prevent immediate closure, add animation first
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRefresh = () => {
    fetchDailyQuote();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
        <div className="bg-white/90 dark:bg-canvas-background/90 rounded-2.5xl shadow-warm-lg p-10 flex flex-col items-center gap-4 min-w-[320px] max-w-[90vw]">
          <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin" />
          <div className="text-canvas-muted">Loading inspiration...</div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'
      }`}
      onClick={(e) => {
        // Close only if clicking the backdrop, not the modal itself
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`relative bg-white/95 dark:bg-canvas-background/95 rounded-2.5xl shadow-warm-lg border border-canvas-border/60 max-w-md w-[90vw] flex flex-col px-0 pb-0 overflow-hidden transition-transform duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-2 top-2 text-canvas-muted hover:text-canvas-accent bg-transparent z-10"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <div className="relative w-full aspect-[6/5] overflow-hidden">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Inspirational mood"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Dark overlay for quote visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6">
            <div className="text-center space-y-3">
              <CircleDot className="w-8 h-8 text-white/60 mx-auto mb-4" />
              <p className="text-xl md:text-2xl text-white font-display leading-relaxed drop-shadow-lg">
                "{quote.quote}"
              </p>
              <p className="text-sm md:text-base text-white/90 font-sans mt-2 drop-shadow">
                — {quote.quote_author}
              </p>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-4 pb-6 flex items-center justify-between">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="rounded-full"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Quote
          </Button>
          
          <Button 
            onClick={handleShare}
            className="rounded-full px-5 py-2 bg-canvas-accent/90 text-white shadow-warm hover:bg-canvas-accent"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </CardContent>
      </div>
    </div>
  );
};

export default DailyQuoteModal;
