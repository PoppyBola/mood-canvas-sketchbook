
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { UserCircle2, Settings, Palette } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { setTheme, theme } = useTheme();
  
  // Change theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <header className="border-b border-canvas-border/50 bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-medium">
          Daily Mood Canvas
        </Link>
        
        <div className="flex items-center gap-2">
          {user && <NotificationCenter />}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <Palette className="h-5 w-5" />
          </Button>
          
          {user ? (
            <Link to="/profile">
              <Button 
                variant={location.pathname === '/profile' ? 'default' : 'ghost'} 
                size="icon"
              >
                <UserCircle2 className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
          
          {user && (
            <Link to="/settings">
              <Button 
                variant={location.pathname === '/settings' ? 'default' : 'ghost'} 
                size="icon"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
