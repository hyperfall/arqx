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
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Build tools with natural language
        </h1>
        <p className="text-xl text-muted-foreground">
          Describe what you want to build, and we'll generate a powerful tool for you instantly.
        </p>
      </div>

      {/* Main Composer */}
      <Composer variant="center" />

      {/* Recent Tools Section */}
      {recentTools.length > 0 && (
        <div className="border-t border-border pt-8 mt-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTools.slice(0, 6).map((tool) => (
              <Card
                key={tool.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/t/${tool.id}`)}
                data-testid={`recent-tool-${tool.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-lg">
                      {getIconEmoji(tool.icon)}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(tool.lastUsed)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs bg-secondary rounded-full">
                        {tool.category}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
