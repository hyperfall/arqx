import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import GalleryToolbar from "@/components/gallery/GalleryToolbar";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CapabilityBanner from "@/components/system/CapabilityBanner";
import { galleryTools, categories, sortOptions, timeframes } from "@/lib/seeds";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/useAuthStore";
import { toolRepo } from "../../../src/repositories";
import { ToolMeta } from "../../../shared/types";
import { featureFlags } from "../../../src/config";
import { Plus, Cloud, HardDrive } from "lucide-react";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Trending");
  const [timeframe, setTimeframe] = useState("Week");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"all" | "my-tools" | "public">("all");

  const { isAuthenticated } = useAuthStore();
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Load tools from repository
  const { data: repoTools = [], isLoading: isLoadingRepo, error } = useQuery({
    queryKey: ['gallery-tools', view, isAuthenticated],
    queryFn: async () => {
      const flags = featureFlags.get();
      
      if (view === "my-tools" && !isAuthenticated) {
        return [];
      }
      
      const params = {
        limit: 100,
        ownerOnly: view === "my-tools",
        query: "", // Backend filtering if available
      };
      
      const tools = await toolRepo.list(params);
      
      // Convert to gallery tool format for display
      return tools.map((meta: ToolMeta) => ({
        id: meta.id,
        name: meta.name,
        description: `Tool from ${meta.source}`, // Will be enhanced when we load full spec
        category: "General", // Default category
        icon: "tool", // Default icon
        rating: 0,
        runs: 0,
        saves: 0,
        tags: [meta.source, meta.isPublic ? "public" : "private"],
        createdAt: meta.updatedAt,
        public: meta.isPublic,
      }));
    },
    staleTime: 30000, // 30 seconds
  });

  const filteredTools = useMemo(() => {
    // Combine repository tools with static gallery tools
    let combinedTools = [];
    
    if (view === "all" || view === "public") {
      // Include static gallery tools for demo purposes
      combinedTools.push(...galleryTools);
    }
    
    if (view === "all" || view === "my-tools") {
      // Include repository tools
      combinedTools.push(...repoTools);
    }

    // Filter by search query
    if (debouncedSearch) {
      combinedTools = combinedTools.filter(tool =>
        tool.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    // Filter by category
    if (category !== "All") {
      combinedTools = combinedTools.filter(tool => tool.category === category);
    }

    // Sort
    switch (sortBy) {
      case "New":
        combinedTools.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Most Runs":
        combinedTools.sort((a, b) => b.runs - a.runs);
        break;
      case "Highest Rating":
        combinedTools.sort((a, b) => b.rating - a.rating);
        break;
      case "Trending":
      default:
        // Keep default order for trending
        break;
    }

    return combinedTools;
  }, [debouncedSearch, category, sortBy, timeframe, repoTools, view]);

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading more tools
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div data-testid="gallery-page">
      {/* System Status Banner */}
      <div className="mb-6">
        <CapabilityBanner compact dismissible />
      </div>

      {/* Gallery Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tool Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Discover and use tools created by the community
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground" data-testid="tools-count">
            {filteredTools.length} tools
          </div>
          <Button size="sm" data-testid="create-tool-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Tool
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">View:</span>
          <div className="flex gap-1">
            <Button
              variant={view === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("all")}
              data-testid="view-all-button"
            >
              All Tools
            </Button>
            {isAuthenticated && (
              <Button
                variant={view === "my-tools" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("my-tools")}
                data-testid="view-my-tools-button"
              >
                My Tools
              </Button>
            )}
            <Button
              variant={view === "public" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("public")}
              data-testid="view-public-button"
            >
              Community
            </Button>
          </div>
        </div>
        
        {/* Storage indicators */}
        <div className="flex items-center gap-2 ml-auto">
          {filteredTools.some(tool => tool.tags.includes("local")) && (
            <Badge variant="outline" className="gap-1">
              <HardDrive className="w-3 h-3" />
              Local: {filteredTools.filter(tool => tool.tags.includes("local")).length}
            </Badge>
          )}
          {filteredTools.some(tool => tool.tags.includes("supabase")) && (
            <Badge variant="outline" className="gap-1">
              <Cloud className="w-3 h-3" />
              Cloud: {filteredTools.filter(tool => tool.tags.includes("supabase")).length}
            </Badge>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load tools from storage. Showing community tools only.
          </AlertDescription>
        </Alert>
      )}

      {/* Gallery Toolbar */}
      <GalleryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        category={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* Gallery Grid */}
      <GalleryGrid
        tools={filteredTools}
        loading={loading || isLoadingRepo}
        onLoadMore={handleLoadMore}
        hasMore={false} // For demo, no pagination
      />
    </div>
  );
}

