import { useState, useMemo } from "react";
import GalleryToolbar from "@/components/gallery/GalleryToolbar";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { galleryTools, categories, sortOptions, timeframes } from "@/lib/seeds";
import { useDebounce } from "@/hooks/use-debounce";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Trending");
  const [timeframe, setTimeframe] = useState("Week");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredTools = useMemo(() => {
    let filtered = [...galleryTools];

    // Filter by search query
    if (debouncedSearch) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    // Filter by category
    if (category !== "All") {
      filtered = filtered.filter(tool => tool.category === category);
    }

    // Sort
    switch (sortBy) {
      case "New":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Most Runs":
        filtered.sort((a, b) => b.runs - a.runs);
        break;
      case "Highest Rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "Trending":
      default:
        // Keep default order for trending
        break;
    }

    return filtered;
  }, [debouncedSearch, category, sortBy, timeframe]);

  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading more tools
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div data-testid="gallery-page">
      {/* Gallery Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tool Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Discover and use tools created by the community
          </p>
        </div>
        <div className="text-sm text-muted-foreground" data-testid="tools-count">
          {filteredTools.length} tools
        </div>
      </div>

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
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={false} // For demo, no pagination
      />
    </div>
  );
}

