import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isRailCollapsed: boolean;
  isComposerDocked: boolean;
  isCommandPaletteOpen: boolean;
  dockHeight: number;
  toggleRail: () => void;
  setComposerDocked: (docked: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setDockHeight: (height: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isRailCollapsed: false,
      isComposerDocked: false,
      isCommandPaletteOpen: false,
      dockHeight: 0,
      toggleRail: () => set((state) => ({ isRailCollapsed: !state.isRailCollapsed })),
      setComposerDocked: (docked) => set({ isComposerDocked: docked }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      setDockHeight: (height) => set({ dockHeight: height }),
    }),
    {
      name: 'toolforge-ui-storage',
      partialize: (state) => ({ isRailCollapsed: state.isRailCollapsed }),
    }
  )
);
