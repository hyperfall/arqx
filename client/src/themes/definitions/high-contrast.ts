// High Contrast Theme - Accessibility-focused with high contrast
export const highContrast = {
  id: 'high-contrast',
  name: 'High Contrast Light',
  description: 'Accessibility-focused with high contrast',
  type: 'light' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds
    bg: 'hsl(0, 0%, 100%)',          // Main background
    surface: 'hsl(0, 0%, 100%)',     // Cards, modals
    card: 'hsl(0, 0%, 100%)',        // Main content card
    rail: 'hsl(0, 0%, 98%)',         // Sidebar background
    
    // Borders and dividers
    border: 'hsl(0, 0%, 20%)',       // High contrast borders
    
    // Text colors
    text: 'hsl(0, 0%, 0%)',          // Black text
    textDim: 'hsl(0, 0%, 40%)',      // Dark gray text
    
    // Accent colors
    accent: 'hsl(220, 100%, 40%)',    // Blue accent
    accentSoft: 'hsl(220, 100%, 95%)', // Light blue background
    
    // Status colors
    success: 'hsl(120, 100%, 25%)',  // Dark green
    warn: 'hsl(45, 100%, 35%)',      // Dark orange
    danger: 'hsl(0, 100%, 40%)',     // Dark red
  },
  
  // Border radius values (minimal for accessibility)
  radii: {
    sm: 2,
    md: 4,
    lg: 6,
    card: 8,
    rail: 8,
  },
  
  // Shadow definitions (subtle for high contrast)
  shadows: {
    card: '0 2px 8px hsl(0 0% 0% / 0.15)',
    soft: '0 1px 3px hsl(220 100% 40% / 0.5)',
  },
  
  // Glass and gradient effects (minimal)
  effects: {
    gradientFrom: 'hsl(0, 0%, 98%)',
    gradientTo: 'hsl(0, 0%, 95%)',
    blur: 0, // No blur for accessibility
  },
  
  // Typography (optional)
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, monospace',
  },
};