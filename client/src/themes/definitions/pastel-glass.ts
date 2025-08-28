// Pastel Glass Theme - Light and airy with soft pastels
export const pastelGlass = {
  id: 'pastel-glass',
  name: 'Pastel Glass',
  description: 'Light and airy with soft pastels',
  type: 'light' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds
    bg: 'hsl(250, 20%, 97%)',        // Main background
    surface: 'hsl(0, 0%, 100%)',     // Cards, modals
    card: 'hsl(0, 0%, 100%)',        // Main content card
    rail: 'hsl(0, 0%, 98%)',         // Sidebar background
    
    // Borders and dividers
    border: 'hsl(220, 13%, 91%)',
    
    // Text colors
    text: 'hsl(222, 47%, 11%)',      // Primary text
    textDim: 'hsl(215, 20%, 65%)',   // Secondary text
    
    // Accent colors
    accent: 'hsl(262, 69%, 66%)',     // Primary accent (purple)
    accentSoft: 'hsl(251, 25%, 95%)', // Light accent background
    
    // Status colors
    success: 'hsl(142, 76%, 36%)',   // Green
    warn: 'hsl(38, 92%, 50%)',       // Orange
    danger: 'hsl(0, 84%, 60%)',      // Red
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
    card: '0 4px 12px -2px hsl(0 0% 0% / 0.08), 0 2px 8px -2px hsl(0 0% 0% / 0.04)',
    soft: '0 2px 4px hsl(262 69% 66% / 0.3)',
  },
  
  // Glass and gradient effects
  effects: {
    gradientFrom: 'hsl(270, 50%, 90%)',
    gradientTo: 'hsl(30, 60%, 90%)',
    blur: 10,
  },
  
  // Typography (optional)
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
};