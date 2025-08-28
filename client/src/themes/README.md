# Theme System

A simple, modular theme system that makes it easy to add new themes and customize colors.

## Adding a New Theme

1. Create a new file in `definitions/` folder (e.g. `my-theme.ts`)
2. Export your theme object with this format:

```typescript
export const myTheme = {
  id: 'my-theme',
  name: 'My Theme',
  description: 'A beautiful custom theme',
  type: 'light', // or 'dark'
  
  colors: {
    // Backgrounds
    bg: 'hsl(0, 0%, 100%)',      // Main background
    surface: 'hsl(0, 0%, 98%)',  // Modal/card backgrounds  
    card: 'hsl(0, 0%, 100%)',    // Main content area
    rail: 'hsl(0, 0%, 95%)',     // Sidebar background
    
    // Borders
    border: 'hsl(0, 0%, 90%)',
    
    // Text
    text: 'hsl(0, 0%, 10%)',     // Primary text
    textDim: 'hsl(0, 0%, 50%)',  // Secondary text
    
    // Accents
    accent: 'hsl(220, 100%, 50%)', // Primary accent color
    accentSoft: 'hsl(220, 100%, 95%)', // Light accent bg
    
    // Status colors
    success: 'hsl(120, 60%, 50%)',
    warn: 'hsl(45, 100%, 50%)',
    danger: 'hsl(0, 70%, 50%)',
  },
  
  radii: {
    sm: 4, md: 8, lg: 12, card: 16, rail: 16
  },
  
  shadows: {
    card: '0 4px 12px rgba(0,0,0,0.1)',
    soft: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  effects: {
    gradientFrom: 'hsl(220, 50%, 95%)',
    gradientTo: 'hsl(260, 50%, 95%)',
    blur: 10,
  }
};
```

3. Add the import to `loader.ts`:
```typescript
import { myTheme } from './definitions/my-theme';
```

4. Add it to the themeModules object:
```typescript
const themeModules = {
  pastelGlass,
  neoNoir, 
  highContrast,
  myTheme, // Add your theme here
};
```

## Customizing Colors

Each theme file contains intuitive color names that are easy to modify:

- `bg` - Main application background
- `surface` - Cards, modals, elevated surfaces
- `card` - Main content area background  
- `rail` - Sidebar/navigation background
- `text` - Primary text color
- `textDim` - Secondary/muted text
- `accent` - Primary brand/accent color
- `success/warn/danger` - Status indicator colors

## Color Format

Use HSL format for better color manipulation:
```typescript
'hsl(220, 100%, 50%)' // Hue, Saturation, Lightness
```

HSL makes it easy to create color variations:
- Adjust lightness: `hsl(220, 100%, 30%)` (darker) to `hsl(220, 100%, 80%)` (lighter)
- Adjust saturation: `hsl(220, 50%, 50%)` (muted) to `hsl(220, 100%, 50%)` (vibrant)