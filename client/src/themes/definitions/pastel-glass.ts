// Modern Light Theme - Clean, minimalist design with excellent readability
export const pastelGlass = {
  id: 'pastel-glass',
  name: 'Modern Light',
  description: 'Clean and minimalist with excellent contrast',
  type: 'light' as const,
  
  // Main colors - easy to customize
  colors: {
    // Backgrounds
    bg: 'hsl(0, 0%, 98%)',           // Clean off-white background
    surface: 'hsl(0, 0%, 100%)',     // Pure white surfaces
    card: 'hsl(0, 0%, 100%)',        // White content card
    rail: 'hsl(0, 0%, 97%)',         // Subtle gray sidebar
    
    // Borders and dividers
    border: 'hsl(0, 0%, 88%)',       // Modern gray borders
    
    // Text colors - optimized for readability
    text: 'hsl(0, 0%, 9%)',          // Near-black for maximum contrast
    textDim: 'hsl(0, 0%, 45%)',      // Medium gray for secondary text
    
    // Accent colors - modern blue
    accent: 'hsl(212, 100%, 50%)',    // Vibrant modern blue
    accentSoft: 'hsl(212, 100%, 96%)', // Very light blue background
    
    // Status colors - modern and clear
    success: 'hsl(142, 71%, 45%)',   // Fresh green
    warn: 'hsl(38, 100%, 50%)',      // Clear orange
    danger: 'hsl(0, 84%, 55%)',      // Modern red
  },
  
  // Border radius values - modern and clean
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    card: 20,
    rail: 20,
  },
  
  // Shadow definitions - subtle and modern
  shadows: {
    card: '0 8px 32px -8px hsl(0 0% 0% / 0.08), 0 2px 8px -2px hsl(0 0% 0% / 0.04)',
    soft: '0 4px 12px hsl(212 100% 50% / 0.15)',
  },
  
  // Glass and gradient effects
  effects: {
    gradientFrom: 'hsl(210, 40%, 98%)',
    gradientTo: 'hsl(212, 30%, 96%)',
    blur: 16,
  },
  
  // Typography
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
};