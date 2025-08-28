// Modern Dark Theme - Sleek dark design with excellent contrast
export const neoNoir = {
  id: 'neo-noir',
  name: 'Modern Dark',
  description: 'Sleek dark theme with perfect contrast',
  type: 'dark' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds - modern grays instead of heavy color tints
    bg: 'hsl(0, 0%, 7%)',            // Deep charcoal background
    surface: 'hsl(0, 0%, 10%)',      // Slightly lighter for surfaces
    card: 'hsl(0, 0%, 10%)',         // Card background
    rail: 'hsl(0, 0%, 5%)',          // Darker sidebar
    
    // Borders and dividers
    border: 'hsl(0, 0%, 18%)',       // Subtle gray borders
    
    // Text colors - optimized for dark backgrounds
    text: 'hsl(0, 0%, 98%)',         // Near-white for maximum contrast
    textDim: 'hsl(0, 0%, 65%)',      // Light gray for secondary text
    
    // Accent colors - modern blue that works well on dark
    accent: 'hsl(212, 100%, 60%)',    // Brighter blue for dark theme
    accentSoft: 'hsl(212, 50%, 12%)', // Dark blue background
    
    // Status colors - bright enough for dark backgrounds
    success: 'hsl(142, 70%, 55%)',   // Bright green
    warn: 'hsl(38, 100%, 60%)',      // Bright orange
    danger: 'hsl(0, 80%, 65%)',      // Bright red
  },
  
  // Border radius values - modern and clean
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    card: 20,
    rail: 20,
  },
  
  // Shadow definitions - deeper shadows for dark theme
  shadows: {
    card: '0 12px 40px -8px hsl(0 0% 0% / 0.4), 0 4px 16px -4px hsl(0 0% 0% / 0.3)',
    soft: '0 6px 20px hsl(212 100% 60% / 0.25)',
  },
  
  // Glass and gradient effects
  effects: {
    gradientFrom: 'hsl(0, 0%, 8%)',
    gradientTo: 'hsl(212, 20%, 9%)',
    blur: 20,
  },
  
  // Typography
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
};