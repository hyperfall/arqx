// Define type directly to avoid module resolution issues
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

export const themes: ThemeDefinition[] = [
  {
    id: 'pastel-glass',
    name: 'Pastel Glass',
    description: 'Light and airy with soft pastels',
    type: 'light',
    colors: {
      bg: 'hsl(250, 20%, 97%)',
      surface: 'hsl(0, 0%, 100%)',
      card: 'hsl(0, 0%, 100%)',
      rail: 'hsl(0, 0%, 98%)',
      border: 'hsl(220, 13%, 91%)',
      text: 'hsl(222, 47%, 11%)',
      textDim: 'hsl(215, 20%, 65%)',
      accent: 'hsl(262, 69%, 66%)',
      accentSoft: 'hsl(251, 25%, 95%)',
      success: 'hsl(142, 76%, 36%)',
      warn: 'hsl(38, 92%, 50%)',
      danger: 'hsl(0, 84%, 60%)',
    },
    radii: {
      sm: 4,
      md: 8,
      lg: 12,
      card: 16,
      rail: 16,
    },
    shadows: {
      card: '0 4px 12px -2px hsl(0 0% 0% / 0.08), 0 2px 8px -2px hsl(0 0% 0% / 0.04)',
      soft: '0 2px 4px hsl(262 69% 66% / 0.3)',
    },
    effects: {
      gradientFrom: 'hsl(270, 50%, 90%)',
      gradientTo: 'hsl(30, 60%, 90%)',
      blur: 10,
    },
    fonts: {
      base: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
  },
  {
    id: 'neo-noir',
    name: 'Neo Noir',
    description: 'Dark theme with purple accents',
    type: 'dark',
    colors: {
      bg: 'hsl(224, 71%, 4%)',
      surface: 'hsl(224, 71%, 4%)',
      card: 'hsl(224, 71%, 4%)',
      rail: 'hsl(215, 28%, 8%)',
      border: 'hsl(215, 27%, 17%)',
      text: 'hsl(210, 20%, 98%)',
      textDim: 'hsl(217, 10%, 64%)',
      accent: 'hsl(263, 70%, 50%)',
      accentSoft: 'hsl(215, 27%, 17%)',
      success: 'hsl(142, 76%, 36%)',
      warn: 'hsl(38, 92%, 50%)',
      danger: 'hsl(0, 63%, 31%)',
    },
    radii: {
      sm: 4,
      md: 8,
      lg: 12,
      card: 16,
      rail: 16,
    },
    shadows: {
      card: '0 4px 12px -2px hsl(0 0% 0% / 0.3), 0 2px 8px -2px hsl(0 0% 0% / 0.2)',
      soft: '0 2px 4px hsl(263 70% 50% / 0.4)',
    },
    effects: {
      gradientFrom: 'hsl(250, 50%, 10%)',
      gradientTo: 'hsl(270, 50%, 15%)',
      blur: 12,
    },
    fonts: {
      base: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
  },
  {
    id: 'high-contrast',
    name: 'High Contrast Light',
    description: 'Accessibility-focused with high contrast',
    type: 'light',
    colors: {
      bg: 'hsl(0, 0%, 100%)',
      surface: 'hsl(0, 0%, 100%)',
      card: 'hsl(0, 0%, 100%)',
      rail: 'hsl(0, 0%, 98%)',
      border: 'hsl(0, 0%, 20%)',
      text: 'hsl(0, 0%, 0%)',
      textDim: 'hsl(0, 0%, 40%)',
      accent: 'hsl(220, 100%, 40%)',
      accentSoft: 'hsl(220, 100%, 95%)',
      success: 'hsl(120, 100%, 25%)',
      warn: 'hsl(45, 100%, 35%)',
      danger: 'hsl(0, 100%, 40%)',
    },
    radii: {
      sm: 2,
      md: 4,
      lg: 6,
      card: 8,
      rail: 8,
    },
    shadows: {
      card: '0 2px 8px hsl(0 0% 0% / 0.15)',
      soft: '0 1px 3px hsl(220 100% 40% / 0.5)',
    },
    effects: {
      gradientFrom: 'hsl(0, 0%, 98%)',
      gradientTo: 'hsl(0, 0%, 95%)',
      blur: 0,
    },
    fonts: {
      base: 'Inter, system-ui, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
  },
];

export const defaultTheme = themes[0];
