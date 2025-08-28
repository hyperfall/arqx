import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categories, sortOptions, timeframes } from "@/lib/seeds";

interface GalleryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export default function GalleryToolbar({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  timeframe,
  onTimeframeChange,
}: GalleryToolbarProps) {
  return (
    <div className="bg-muted/20 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus-ring"
            data-testid="gallery-search"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px] bg-card border border-border rounded-lg text-sm focus-ring" data-testid="category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat} {cat === 'All' ? 'Categories' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] bg-card border border-border rounded-lg text-sm focus-ring" data-testid="sort-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Timeframe Tabs */}
        <div className="flex bg-card border border-border rounded-lg p-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 text-sm rounded-md font-medium ${
                timeframe === tf 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`timeframe-${tf.toLowerCase()}`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
