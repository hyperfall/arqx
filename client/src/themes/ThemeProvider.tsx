import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDefinition, themes, defaultTheme } from './index';

interface ThemeContextType {
  theme: ThemeDefinition;
  setTheme: (themeId: string) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeDefinition>(defaultTheme);

  useEffect(() => {
    // Load theme from localStorage
    const savedThemeId = localStorage.getItem('toolforge-theme');
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--background', theme.colors.bg);
    root.style.setProperty('--foreground', theme.colors.text);
    root.style.setProperty('--card', theme.colors.card);
    root.style.setProperty('--card-foreground', theme.colors.text);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--rail', theme.colors.rail);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--muted-foreground', theme.colors.textDim);
    root.style.setProperty('--primary', theme.colors.accent);
    root.style.setProperty('--primary-foreground', theme.type === 'dark' ? theme.colors.text : 'hsl(0, 0%, 100%)');
    root.style.setProperty('--secondary', theme.colors.accentSoft);
    root.style.setProperty('--secondary-foreground', theme.colors.text);
    root.style.setProperty('--gradient-from', theme.effects.gradientFrom);
    root.style.setProperty('--gradient-to', theme.effects.gradientTo);
    root.style.setProperty('--radius', `${theme.radii.lg}px`);
    root.style.setProperty('--shadow-card', theme.shadows.card);
    root.style.setProperty('--shadow-soft', theme.shadows.soft);

    // Apply dark class if needed
    if (theme.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font family
    if (theme.fonts?.base) {
      root.style.setProperty('--font-sans', theme.fonts.base);
    }
  }, [theme]);

  const setTheme = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      localStorage.setItem('toolforge-theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}
