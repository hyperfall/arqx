import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/useUIStore";
import { useDockPadding } from "@/lib/useDockPadding";
import { cn } from "@/lib/utils";

export default function BottomDock() {
  const { isComposerDocked, setComposerDocked } = useUIStore();
  const { dockRef } = useDockPadding();
  const [refineText, setRefineText] = useState("");

  if (!isComposerDocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim()) return;
    
    console.log("Refining tool with:", refineText);
    setRefineText("");
    // Handle refinement logic here
  };

  const handleClose = () => {
    setComposerDocked(false);
  };

  return (
    <div 
      ref={dockRef}
      className={cn(
        "absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur-sm border-t border-border",
        isComposerDocked ? "block" : "hidden"
      )}
      data-testid="bottom-dock"
    >
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Refine this tool... e.g., 'also resize to 1080p'"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus-ring transition-all duration-200"
            data-testid="refine-input"
          />
        </div>
        <Button 
          type="submit" 
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors focus-ring"
          data-testid="apply-refinement"
        >
          <Send className="w-4 h-4 mr-2" />
          Apply
        </Button>
        <Button 
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors focus-ring"
          data-testid="close-dock"
        >
          <X className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
