// Ocean Breeze Theme - Cool blues and whites (example of how easy it is to add themes)
export const oceanBreeze = {
  id: 'ocean-breeze',
  name: 'Ocean Breeze',
  description: 'Cool and calming with ocean-inspired colors',
  type: 'light' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds
    bg: 'hsl(200, 30%, 98%)',        // Light blue-gray background
    surface: 'hsl(0, 0%, 100%)',     // Pure white surfaces
    card: 'hsl(0, 0%, 100%)',        // White content card
    rail: 'hsl(200, 20%, 96%)',      // Light blue-gray sidebar
    
    // Borders and dividers
    border: 'hsl(200, 15%, 85%)',    // Soft blue-gray borders
    
    // Text colors
    text: 'hsl(210, 40%, 15%)',      // Dark blue-gray text
    textDim: 'hsl(200, 20%, 50%)',   // Muted blue-gray
    
    // Accent colors
    accent: 'hsl(200, 100%, 45%)',    // Ocean blue
    accentSoft: 'hsl(200, 80%, 95%)', // Light ocean blue background
    
    // Status colors
    success: 'hsl(150, 70%, 40%)',   // Sea green
    warn: 'hsl(35, 85%, 55%)',       // Warm orange
    danger: 'hsl(355, 75%, 55%)',    // Coral red
  },
  
  // Border radius values
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    card: 18,
    rail: 18,
  },
  
  // Shadow definitions
  shadows: {
    card: '0 6px 16px -4px hsl(200 50% 40% / 0.12), 0 4px 12px -2px hsl(200 50% 40% / 0.08)',
    soft: '0 3px 8px hsl(200 100% 45% / 0.25)',
  },
  
  // Glass and gradient effects
  effects: {
    gradientFrom: 'hsl(200, 40%, 92%)',
    gradientTo: 'hsl(180, 40%, 92%)',
    blur: 12,
  },
  
  // Typography (optional)
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
};