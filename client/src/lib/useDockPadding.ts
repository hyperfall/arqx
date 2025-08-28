import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function useDockPadding() {
  const { isComposerDocked, dockHeight, setDockHeight } = useUIStore();
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isComposerDocked || !dockRef.current) {
      setDockHeight(0);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDockHeight(entry.contentRect.height);
      }
    });

    observer.observe(dockRef.current);

    return () => observer.disconnect();
  }, [isComposerDocked, setDockHeight]);

  return { dockRef, paddingBottom: isComposerDocked ? dockHeight : 0 };
}
