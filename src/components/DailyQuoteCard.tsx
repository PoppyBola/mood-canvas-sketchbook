import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DailyQuote {
  id: string;
  quote: string;
  quote_author: string;
  mood_tags: string[];
  image_path: string;
  popularity_score?: number; // Added popularity_score property
}

const DailyQuoteCard = () => {
  const { user } = useAuth();
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDailyQuote();
  }, [user]);

  const fetchDailyQuote = async () => {
    setLoading(true);
    try {
      // First try to get a personalized quote based on user history
      if (user) {
        // Get user's most used mood tags from history
        const { data: historyData } = await supabase
          .from('user_mood_history')
          .select('mood_text')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (historyData && historyData.length > 0) {
          // Try to find a mood entry that matches their history
          const moodTexts = historyData.map(item => item.mood_text.toLowerCase());
          
          // Get a random quote that matches one of their recent moods
          const { data: matchingQuotes } = await supabase
            .from('mood_entries')
            .select('*')
            .filter('mood_tags', 'cs', `{${moodTexts.join(',')}}`)
            .limit(10);
            
          if (matchingQuotes && matchingQuotes.length > 0) {
            // Randomly select one of the matching quotes
            const randomQuote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
            setQuote(randomQuote);
            setLoading(false);
            return;
          }
        }
      }
      
      // Fallback to a random quote
      const { data: randomQuotes } = await supabase
        .from('mood_entries')
        .select('*')
        .limit(10);
        
      if (randomQuotes && randomQuotes.length > 0) {
        const randomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
        setQuote(randomQuote);
      }
    } catch (err) {
      console.error('Error fetching daily quote:', err);
      toast.error('Failed to load today\'s quote');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchDailyQuote();
  };
  
  const handleLike = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 1000);
    
    try {
      // Update popularity score of this quote
      await supabase
        .from('mood_entries')
        .update({ popularity_score: (quote?.popularity_score || 0) + 1 })
        .eq('id', quote?.id);
        
      toast.success('Quote saved to favorites');
    } catch (err) {
      console.error('Error liking quote:', err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-t-canvas-accent border-canvas-border/30 rounded-full animate-spin"></div>
            <p className="text-canvas-muted">Finding today's inspiration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <p className="text-canvas-muted">Could not load today's quote</p>
            <Button variant="outline" onClick={handleRefresh} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Quote of the Day</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${likeAnimation ? 'animate-heartbeat' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${likeAnimation ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <blockquote className="border-l-4 border-indigo-200 pl-4 italic">
          "{quote.quote}"
        </blockquote>
        <p className="text-right mt-2 text-canvas-muted">— {quote.quote_author}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {quote.mood_tags.slice(0, 3).map((tag, index) => (
            <div 
              key={index}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
            >
              {tag}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuoteCard;
