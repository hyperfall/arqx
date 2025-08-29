import { Card, CardContent } from "@/components/ui/card";
import Composer from "@/components/composer/Composer";
import { useRecentStore } from "@/store/useRecentStore";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { recentTools } = useRecentStore();
  const [, navigate] = useLocation();

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

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Build tools with natural language
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Describe what you want to build, and we'll generate a powerful tool for you instantly.
          </p>
        </div>
      </div>

      {/* Main Composer */}
      <div className="mb-20">
        <Composer variant="center" />
      </div>

      {/* Recent Tools Section */}
      {recentTools.length > 0 && (
        <div className="border-t border-border pt-6 mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentTools.slice(0, 8).map((tool, index) => (
              <Card
                key={`${tool.name}-${tool.category}-${index}`}
                className="hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/t/${tool.id}`)}
                data-testid={`recent-tool-${tool.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center text-sm">
                      {getIconEmoji(tool.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tool.lastUsed)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs bg-secondary rounded-full">
                      {tool.category}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
