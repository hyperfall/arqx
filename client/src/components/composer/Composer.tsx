import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store/useUIStore";
import { generateToolFromText } from "@/lib/fastlane";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface ComposerProps {
  variant?: "center" | "dock";
  placeholder?: string;
  onSubmit?: (input: string, toolSpec: any) => void;
}

const quickExamples = [
  { icon: "🖼️", text: "Convert PNG to JPEG", description: "Convert PNG to JPEG" },
  { icon: "📄", text: "Merge PDF", description: "Combine PDF files" },
  { icon: "🎬", text: "Extract frames", description: "Get frames from video" },
  { icon: "🧹", text: "Strip EXIF", description: "Remove image metadata" },
];

export default function Composer({ 
  variant = "center", 
  placeholder = "Describe the tool you want to build... e.g., 'Convert PNG images to JPEG with 80% quality'",
  onSubmit 
}: ComposerProps) {
  const [input, setInput] = useState("");
  const { setComposerDocked } = useUIStore();
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const toolSpec = generateToolFromText(input);
    
    if (onSubmit) {
      onSubmit(input, toolSpec);
    } else {
      // Default behavior: navigate to tool page and dock composer
      navigate(`/t/${toolSpec.id}`);
      if (variant === "center") {
        setComposerDocked(true);
      }
    }
    
    setInput("");
  };

  const handleExampleClick = (exampleText: string) => {
    // Direct tool generation and navigation for quick examples
    const toolSpec = generateToolFromText(exampleText);
    
    if (onSubmit) {
      onSubmit(exampleText, toolSpec);
    } else {
      navigate(`/t/${toolSpec.id}`);
      if (variant === "center") {
        setComposerDocked(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (variant === "center") {
    return (
      <div className="max-w-4xl mx-auto mb-8 animate-slide-up">
        {/* Quick Examples - Positioned Above for F-Pattern Eye Movement */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
          {quickExamples.map((example, index) => (
            <Button
              key={example.text}
              variant="outline"
              onClick={() => handleExampleClick(example.text)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border-2",
                "hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:border-primary/70 hover:bg-primary/5",
                "active:scale-95 active:translate-y-0",
                "animate-fade-in opacity-0",
                // Staggered animation delay for visual appeal
                index === 0 && "animation-delay-100 animate-delay-100",
                index === 1 && "animation-delay-200 animate-delay-200", 
                index === 2 && "animation-delay-300 animate-delay-300",
                index === 3 && "animation-delay-400 animate-delay-400"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              data-testid={`example-${example.text.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="mr-2 text-base animate-bounce-subtle">{example.icon}</span>
              {example.text}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Interaction Zone - Central Focus Point */}
          <div className="relative group mb-6">
            {/* Glow effect behind textarea for attention */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="relative">
              <Textarea
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full p-8 bg-background/95 backdrop-blur-md border-2 border-border/60",
                  "hover:border-primary/60 focus:border-primary rounded-3xl text-foreground placeholder-muted-foreground",
                  "resize-none transition-all duration-500 min-h-[160px] text-lg leading-relaxed",
                  "shadow-xl hover:shadow-2xl focus:shadow-2xl",
                  "focus:bg-background focus:scale-[1.02] focus:ring-4 focus:ring-primary/10"
                )}
                rows={5}
                data-testid="main-composer"
              />
              
              {/* Floating action button - Positioned for thumb reach on mobile */}
              <div className="absolute bottom-6 right-6">
                <Button 
                  type="submit" 
                  disabled={!input.trim()}
                  className={cn(
                    "relative overflow-hidden px-10 py-4 rounded-full font-bold text-lg",
                    "bg-gradient-to-r from-primary via-primary to-primary/90",
                    "hover:from-primary/90 hover:via-primary hover:to-primary",
                    "disabled:from-muted disabled:to-muted disabled:cursor-not-allowed",
                    "transition-all duration-300 shadow-2xl hover:shadow-primary/25",
                    "transform hover:scale-110 hover:-translate-y-2 active:scale-95 active:translate-y-0",
                    "focus:ring-4 focus:ring-primary/30 focus:scale-110 focus:-translate-y-2",
                    // Pulse animation for attention
                    input.trim() && "animate-pulse-subtle"
                  )}
                  data-testid="generate-tool-button"
                >
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 -skew-x-12 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="relative flex items-center">
                    <Send className="w-6 h-6 mr-3 animate-bounce-subtle" />
                    Generate Tool
                  </div>
                </Button>
              </div>

              {/* Helper text positioned for natural reading flow */}
              <div className="absolute bottom-6 left-6 text-sm text-muted-foreground/80 hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                <span>Press Enter to submit</span>
              </div>
            </div>
          </div>
        </form>

        {/* Subtle visual separator */}
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-border to-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
      <div className="flex-1">
        <Textarea
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus-ring transition-all duration-200 resize-none"
          rows={1}
          data-testid="dock-composer"
        />
      </div>
      <Button 
        type="submit" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors focus-ring"
        data-testid="submit-refinement"
      >
        <Send className="w-4 h-4 mr-2" />
        Apply
      </Button>
    </form>
  );
}
