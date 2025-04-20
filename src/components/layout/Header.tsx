
import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onClick?: () => void;
  greeting?: string;
}

const Header: React.FC<HeaderProps> = ({ onClick, greeting }) => {
  return (
    <header className="py-4 w-full flex items-center justify-between px-4">
      <div 
        className="cursor-pointer hover:text-canvas-accent transition-colors flex-1 text-center"
        onClick={onClick}
      >
        {greeting && (
          <p className="text-sm text-canvas-muted mb-1 font-light">{greeting}</p>
        )}
        <h1 className="text-lg font-normal tracking-wide text-inherit">
          Daily Mood Canvas
        </h1>
      </div>
      
      <Link 
        to="/profile-placeholder" 
        className="p-2 rounded-full hover:bg-canvas-border transition-all hover:scale-105 active:scale-95"
        aria-label="View your profile"
      >
        <User className="w-5 h-5 text-canvas-muted" />
      </Link>
    </header>
  );
};

export default Header;
