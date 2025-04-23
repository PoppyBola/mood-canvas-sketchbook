
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { getGreeting } from '../../utils/timeUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  onHeaderClick?: () => void;
  gradientClasses?: string[];
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  onHeaderClick,
  gradientClasses = ["from-amber-100", "via-orange-150", "to-yellow-100"],
  showFooter = true
}) => {
  const { isDarkMode } = useTheme();
  const gradientClassNames = [`bg-gradient-to-br`, ...gradientClasses].join(' ');
  const greeting = getGreeting();
  const isMobile = useIsMobile();

  // Dark mode adjustments
  const darkModeGradient = "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen h-screen transition-colors duration-[1500ms] ease-in-out font-sans",
        isDarkMode ? darkModeGradient : gradientClassNames
      )}
      onClick={onHeaderClick}
      role={onHeaderClick ? "button" : undefined}
      tabIndex={onHeaderClick ? 0 : undefined}
      onKeyDown={(e) => { if (onHeaderClick && (e.key === 'Enter' || e.key === ' ')) onHeaderClick(); }}
      style={{ WebkitOverflowScrolling: "touch"}}
    >
      <Header />
      <main className={cn(
        "flex-1 flex flex-col items-center justify-center px-6 py-8 w-full mx-auto select-text transition-all",
        isMobile ? 'pb-24 max-w-md' : 'max-w-5xl'
      )}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
