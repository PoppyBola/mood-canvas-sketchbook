
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
  gradientClasses = ["from-amber-100", "via-orange-150", "to-yellow-100"]
}) => {
  const gradientClassNames = [`bg-gradient-to-br`, ...gradientClasses].join(' ');
  const greeting = getGreeting();

  return (
    <div
      className={`flex flex-col min-h-screen h-screen transition-colors duration-[1500ms] ease-in-out ${gradientClassNames} font-sans`}
      onClick={onHeaderClick}
      role={onHeaderClick ? "button" : undefined}
      tabIndex={onHeaderClick ? 0 : undefined}
      onKeyDown={(e) => { if (onHeaderClick && (e.key === 'Enter' || e.key === ' ')) onHeaderClick(); }}
      style={{ WebkitOverflowScrolling: "touch"}}
    >
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full max-w-md mx-auto select-text transition-all">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
