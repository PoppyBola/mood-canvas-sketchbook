
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="py-3 w-full text-center border-t border-canvas-border flex flex-col items-center gap-1">
      <p className="text-xs text-canvas-muted">
        © 2025 Daily Mood Canvas
      </p>
      <Link 
        to="/admin-placeholder" 
        className="text-xs text-canvas-muted hover:text-canvas-accent transition-colors"
      >
        Admin Area
      </Link>
    </footer>
  );
};

export default Footer;
