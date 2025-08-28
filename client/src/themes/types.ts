export interface ThemeDefinition {
  id: string;
  name: string;
  description?: string;
  type: 'light' | 'dark';
  colors: {
    bg: string;
    surface: string;
    card: string;
    rail: string;
    border: string;
    text: string;
    textDim: string;
    accent: string;
    accentSoft: string;
    success: string;
    warn: string;
    danger: string;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    card: number;
    rail: number;
  };
  shadows: {
    card: string;
    soft: string;
  };
  effects: {
    gradientFrom: string;
    gradientTo: string;
    blur: number;
  };
  fonts?: {
    base?: string;
    display?: string;
    mono?: string;
  };
}

// Ensure the interface is available for module resolution
export default ThemeDefinition;
