// Neo Noir Theme - Dark theme with purple accents
export const neoNoir = {
  id: 'neo-noir',
  name: 'Neo Noir',
  description: 'Dark theme with purple accents',
  type: 'dark' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds
    bg: 'hsl(224, 71%, 4%)',         // Main background
    surface: 'hsl(224, 71%, 4%)',    // Cards, modals
    card: 'hsl(224, 71%, 4%)',       // Main content card
    rail: 'hsl(215, 28%, 8%)',       // Sidebar background
    
    // Borders and dividers
    border: 'hsl(215, 27%, 17%)',
    
    // Text colors
    text: 'hsl(210, 20%, 98%)',      // Primary text
    textDim: 'hsl(217, 10%, 64%)',   // Secondary text
    
    // Accent colors
    accent: 'hsl(263, 70%, 50%)',     // Primary accent (purple)
    accentSoft: 'hsl(215, 27%, 17%)', // Dark accent background
    
    // Status colors
    success: 'hsl(142, 76%, 36%)',   // Green
    warn: 'hsl(38, 92%, 50%)',       // Orange
    danger: 'hsl(0, 63%, 31%)',      // Dark red
  },
  
  // Border radius values
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    card: 16,
    rail: 16,
  },
  
  // Shadow definitions
  shadows: {
    card: '0 4px 12px -2px hsl(0 0% 0% / 0.3), 0 2px 8px -2px hsl(0 0% 0% / 0.2)',
    soft: '0 2px 4px hsl(263 70% 50% / 0.4)',
  },
  
  // Glass and gradient effects
  effects: {
    gradientFrom: 'hsl(250, 50%, 10%)',
    gradientTo: 'hsl(270, 50%, 15%)',
    blur: 12,
  },
  
  // Typography (optional)
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
};