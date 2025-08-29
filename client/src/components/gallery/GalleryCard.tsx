import { Star, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { GalleryTool } from "@/lib/seeds";
import { useRecentStore } from "@/store/useRecentStore";

interface GalleryCardProps {
  tool: GalleryTool;
}

export default function GalleryCard({ tool }: GalleryCardProps) {
  const [, navigate] = useLocation();
  const { addRecentTool } = useRecentStore();

  const handleUse = async (e: React.MouseEvent) => {
    e.stopPropagation();
    addRecentTool({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      icon: tool.icon,
    });
    
    // Track tool open
    try {
      const { TelemetryTracker } = await import('@/lib/analytics');
      await TelemetryTracker.trackToolAction('open_tool', tool.id, tool.name);
    } catch (error) {
      console.warn('Failed to track tool open:', error);
    }
    
    navigate(`/t/${tool.id}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getIconEmoji = (icon: string): string => {
    const iconMap: Record<string, string> = {
      image: "🖼️",
      "file-text": "📄",
      film: "🎬",
      music: "🎵",
      maximize: "📐",
      type: "📝",
      database: "💾",
    };
    return iconMap[icon] || "🔧";
  };

  return (
    <div 
      className="bg-muted/20 rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer group"
      onClick={async () => {
        // Track gallery view
        try {
          const { TelemetryTracker } = await import('@/lib/analytics');
          await TelemetryTracker.trackGalleryView();
        } catch (error) {
          console.warn('Failed to track gallery view:', error);
        }
        navigate(`/t/${tool.id}`);
      }}
      data-testid={`gallery-card-${tool.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-lg">
          {getIconEmoji(tool.icon)}
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs text-muted-foreground">{tool.rating}</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {tool.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tool.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {tool.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{tool.tags.length - 2}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span className="flex items-center">
            <Play className="w-3 h-3 mr-1" />
            {formatNumber(tool.runs)} runs
          </span>
          <span className="flex items-center">
            <Heart className="w-3 h-3 mr-1" />
            {formatNumber(tool.saves)} saves
          </span>
        </div>
        <Button
          onClick={handleUse}
          size="sm"
          className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors focus-ring"
          data-testid={`use-tool-${tool.id}`}
        >
          Use
        </Button>
      </div>
    </div>
  );
}
