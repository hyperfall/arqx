// Automatic theme loader - scans definitions folder and loads all themes
import { pastelGlass } from './definitions/pastel-glass';
import { neoNoir } from './definitions/neo-noir';
import { highContrast } from './definitions/high-contrast';
import { oceanBreeze } from './definitions/ocean-breeze';
import type { ThemeDefinition } from './types';

// Auto-detected themes from definitions folder
// Add new theme imports here, or they'll be auto-detected in the future
const themeModules = {
  pastelGlass,
  neoNoir,
  highContrast,
  oceanBreeze,
};

// Convert theme objects to ThemeDefinition format
const loadedThemes: ThemeDefinition[] = Object.values(themeModules).map(theme => ({
  ...theme,
  // Ensure all required properties are present
  fonts: theme.fonts || {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif', 
    mono: 'Menlo, monospace',
  }
}));

// Export loaded themes and utilities
export const themes = loadedThemes;
export const defaultTheme = themes[0]; // First theme is default

// Helper functions for theme management
export const getThemeById = (id: string): ThemeDefinition | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getThemesByType = (type: 'light' | 'dark'): ThemeDefinition[] => {
  return themes.filter(theme => theme.type === type);
};

export const validateTheme = (theme: any): theme is ThemeDefinition => {
  return (
    theme &&
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    (theme.type === 'light' || theme.type === 'dark') &&
    theme.colors &&
    theme.radii &&
    theme.shadows &&
    theme.effects
  );
};

// Future: Auto-scan definitions folder (requires build-time or dynamic imports)
// This could be enhanced to automatically detect .ts/.js files in the definitions folder