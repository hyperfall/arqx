import { useState } from "react";
import GalleryCard from "./GalleryCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryTool } from "@/lib/seeds";

interface GalleryGridProps {
  tools: GalleryTool[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function GalleryGrid({ tools, loading = false, onLoadMore, hasMore = true }: GalleryGridProps) {
  if (loading && tools.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <GalleryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <GalleryCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            variant="secondary"
            disabled={loading}
            className="px-6 py-2 rounded-lg hover:bg-secondary/80 transition-colors focus-ring"
            data-testid="load-more-button"
          >
            {loading ? "Loading..." : "Load More Tools"}
          </Button>
        </div>
      )}
    </div>
  );
}

function GalleryCardSkeleton() {
  return (
    <div className="bg-muted/20 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-8 h-4 rounded" />
      </div>
      <Skeleton className="w-32 h-5 rounded mb-2" />
      <Skeleton className="w-full h-4 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="w-20 h-4 rounded" />
        <Skeleton className="w-12 h-6 rounded" />
      </div>
    </div>
  );
}
