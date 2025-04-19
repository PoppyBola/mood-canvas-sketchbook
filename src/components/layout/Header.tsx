
import React from 'react';

interface HeaderProps {
  onClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick }) => {
  return (
    <header 
      className="py-4 w-full text-center cursor-pointer hover:text-canvas-accent transition-colors"
      onClick={onClick}
    >
      <h1 className="text-lg font-normal tracking-wide text-inherit">
        Daily Mood Canvas
      </h1>
    </header>
  );
};

export default Header;
