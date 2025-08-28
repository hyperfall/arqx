import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function useKeyboard() {
  const { toggleRail, setCommandPaletteOpen, isCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Focus search with "/"
      if (e.key === '/' && !isInputFocused(e.target)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Toggle rail with "["
      if (e.key === '[' && !isInputFocused(e.target)) {
        e.preventDefault();
        toggleRail();
      }

      // Command palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }

      // Close palette with Escape
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleRail, setCommandPaletteOpen, isCommandPaletteOpen]);
}

function isInputFocused(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || 
         target instanceof HTMLTextAreaElement || 
         target instanceof HTMLSelectElement ||
         (target instanceof HTMLElement && target.contentEditable === 'true');
}

export const keyboardShortcuts = [
  { key: '/', description: 'Focus search' },
  { key: '[', description: 'Toggle left rail' },
  { key: '⌘K / Ctrl+K', description: 'Open command palette' },
  { key: 'Enter', description: 'Submit composer' },
  { key: 'Shift+Enter', description: 'New line in composer' },
  { key: 'Esc', description: 'Close modals' },
];
