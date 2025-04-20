
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { getGreeting } from '../../utils/timeUtils';

interface LayoutProps {
  children: ReactNode;
  onHeaderClick?: () => void;
  gradientClasses?: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onHeaderClick, 
  gradientClasses = ["from-amber-50", "via-orange-50", "to-yellow-50"] 
}) => {
  const gradientClassNames = [`bg-gradient-to-br`, ...gradientClasses].join(' ');
  const greeting = getGreeting();
  
  return (
    <div className={`flex flex-col min-h-full transition-colors duration-1500 ease-in-out ${gradientClassNames}`}>
      <Header onClick={onHeaderClick} greeting={greeting} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
