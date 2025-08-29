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

const removeDuplicates = (tools: RecentTool[]): RecentTool[] => {
  const seen = new Set<string>();
  return tools.filter(tool => {
    const key = `${tool.name.toLowerCase()}-${tool.category.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      recentTools: [],
      addRecentTool: (tool) => {
        const { recentTools } = get();
        const newTool = { ...tool, lastUsed: new Date().toISOString() };
        
        // Remove the current tool if it already exists (by name and category)
        const filtered = recentTools.filter(t => 
          !(t.name.toLowerCase() === tool.name.toLowerCase() && t.category.toLowerCase() === tool.category.toLowerCase())
        );
        
        // Add the new tool to the front and remove duplicates
        const updated = removeDuplicates([newTool, ...filtered]).slice(0, 10);
        
        set({
          recentTools: updated,
        });
      },
      clearRecent: () => set({ recentTools: [] }),
    }),
    {
      name: 'toolforge-recent-storage',
      onRehydrateStorage: () => (state) => {
        // Clean up duplicates when loading from storage
        if (state && state.recentTools.length > 0) {
          state.recentTools = removeDuplicates(state.recentTools);
        }
      },
    }
  )
);
