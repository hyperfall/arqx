import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentTool {
  id: string;
  name: string;
  description: string;
  category: string;
  lastUsed: string;
  icon: string;
}

interface RecentState {
  recentTools: RecentTool[];
  addRecentTool: (tool: Omit<RecentTool, 'lastUsed'>) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentTools: [],
      addRecentTool: (tool) => {
        const { recentTools } = get();
        const newTool = { ...tool, lastUsed: new Date().toISOString() };
        const filtered = recentTools.filter(t => t.id !== tool.id);
        set({
          recentTools: [newTool, ...filtered].slice(0, 10), // Keep only 10 recent tools
        });
      },
      clearRecent: () => set({ recentTools: [] }),
    }),
    {
      name: 'toolforge-recent-storage',
    }
  )
);
