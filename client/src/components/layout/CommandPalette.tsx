import { useState } from "react";
import { Search, Home, Grid3X3, Settings, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/useUIStore";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const quickActions = [
  { icon: Home, label: "Go to Home", href: "/" },
  { icon: Grid3X3, label: "Open Gallery", href: "/gallery" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Info, label: "About", href: "/about" },
];

export default function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    navigate(href);
    setCommandPaletteOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="w-full max-w-md mx-4 p-0 overflow-hidden" data-testid="command-palette">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-0 text-lg focus:outline-none focus:ring-0"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </div>
            <div className="space-y-1">
              {filteredActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => handleSelect(action.href)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer w-full text-left transition-colors focus-ring"
                  data-testid={`command-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{action.label}</span>
                </button>
              ))}
              {filteredActions.length === 0 && query && (
                <div className="px-3 py-2 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
