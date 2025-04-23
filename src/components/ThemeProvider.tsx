
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('mood-canvas-theme') as Theme) || 'light'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    let effectiveTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }
    
    root.classList.add(effectiveTheme);
    setIsDarkMode(effectiveTheme === 'dark');
    
    localStorage.setItem('mood-canvas-theme', theme);
  }, [theme]);

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      const isDark = mediaQuery.matches;
      
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      setIsDarkMode(isDark);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const value = { theme, setTheme, isDarkMode };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
