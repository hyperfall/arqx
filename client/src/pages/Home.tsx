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
    <div className="h-screen flex flex-col" data-testid="home-page">
      {/* Main Content - Centered */}
      <div className="flex-grow min-h-0 flex flex-col justify-center px-4 py-4 max-h-[calc(100vh-300px)]">
        {/* Hero Section */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
              Build tools with natural language
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              Describe what you want to build, and we'll generate a powerful tool for you instantly.
            </p>
          </div>
        </div>

        {/* Main Composer */}
        <div>
          <Composer variant="center" />
        </div>
      </div>

      {/* Recent Tools Section - Always at bottom */}
      <div className="border-t border-border pt-2 pb-0 px-4 bg-background/95 backdrop-blur-sm flex-shrink-0">
        {recentTools.length > 0 ? (
          <>
            <h2 className="text-xs font-semibold text-foreground mb-1">Recent Tools</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {recentTools.map((tool, index) => (
                <Card
                  key={`${tool.name}-${tool.category}-${index}`}
                  className="hover:bg-muted/50 transition-colors cursor-pointer group flex-shrink-0 w-24"
                  onClick={() => navigate(`/t/${tool.id}`)}
                  data-testid={`recent-tool-${tool.id}`}
                >
                  <CardContent className="p-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-xs mb-1">
                        {getIconEmoji(tool.icon)}
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-xs truncate w-full leading-tight">
                        {tool.name}
                      </h3>
                      <span className="px-1 py-0.5 text-xs bg-secondary rounded text-muted-foreground mt-0.5 leading-none">
                        {tool.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">No recent tools</p>
          </div>
        )}
      </div>
    </div>
  );
}
