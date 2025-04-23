
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CircleDot } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface DailyQuote {
  id: string;
  quote: string;
  quote_author: string;
  mood_tags: string[];
  image_path: string | null;
  popularity_score?: number;
  gradient_classes?: string[] | null;
}

interface DailyQuoteModalProps {
  onClose: () => void;
}

const DailyQuoteModal: React.FC<DailyQuoteModalProps> = ({ onClose }) => {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyQuote();
    // eslint-disable-next-line
  }, []);

  const fetchDailyQuote = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setQuote(data);
    } catch (err) {
      toast.error("Couldn't load inspiration.");
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm animate-fade-in">
        <div className="bg-white/90 rounded-2.5xl shadow-warm-lg p-10 flex flex-col items-center gap-4 min-w-[320px]">
          <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin" />
          <div className="text-canvas-muted">Loading inspiration...</div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  // Soft glass effect, big quote overlay, with possible image background in the future
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur animate-fade-in transition">
      <div className="relative bg-white/80 dark:bg-canvas-background/80 rounded-2.5xl shadow-warm-lg border border-canvas-border/60 max-w-md w-full mx-4 flex flex-col px-0 pb-0 overflow-hidden animate-scale-in">
        <Button 
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 text-canvas-muted hover:text-canvas-accent bg-transparent"
        >
          <X className="w-6 h-6" />
        </Button>
        <CardContent className="pt-8 px-8 pb-6 flex flex-col items-center">
          <div className="rounded-2xl w-full glass border-none p-6 bg-white/70 backdrop-blur shadow-inner flex flex-col items-center">
            <CircleDot className="w-8 h-8 text-canvas-accent mb-2 opacity-60" />
            <blockquote className="text-center text-lg italic text-canvas-foreground break-words" style={{fontFamily: "Playfair Display, serif"}}>
              "{quote.quote}"
            </blockquote>
            <div className="text-canvas-muted mt-4 mb-0 text-sm font-medium text-center">— {quote.quote_author}</div>
          </div>
          <div className="flex gap-2 justify-center mt-6">
            <Button size="sm" onClick={handleShare}
              className="rounded-full bg-canvas-accent/80 hover:bg-canvas-accent transition px-4 text-white shadow-warm focus:ring-2"
            >
              Share
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default DailyQuoteModal;
