
import React from 'react';

interface HeaderProps {
  onClick?: () => void;
  greeting?: string;
}

const Header: React.FC<HeaderProps> = ({ onClick, greeting }) => {
  return (
    <header 
      className="py-4 w-full text-center cursor-pointer hover:text-canvas-accent transition-colors"
      onClick={onClick}
    >
      {greeting && (
        <p className="text-sm text-canvas-muted mb-1 font-light">{greeting}</p>
      )}
      <h1 className="text-lg font-normal tracking-wide text-inherit">
        Daily Mood Canvas
      </h1>
    </header>
  );
};

export default Header;
