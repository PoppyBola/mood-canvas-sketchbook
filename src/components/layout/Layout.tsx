
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  onHeaderClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHeaderClick }) => {
  return (
    <div className="flex flex-col min-h-full">
      <Header onClick={onHeaderClick} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
