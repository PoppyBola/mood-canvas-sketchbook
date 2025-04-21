
import { Link } from 'react-router-dom';
import { PaintBrush, UserCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shadow-warm transition-transform group-hover:scale-110">
          <PaintBrush className="w-4 h-4 text-canvas-accent" />
        </div>
        <span className="font-display text-lg tracking-wide text-canvas-foreground transition-colors group-hover:text-canvas-accent">Daily Mood Canvas</span>
      </Link>
      
      <div className="flex items-center gap-2">
        {user ? (
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              <span className="hidden md:inline">Profile</span>
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
