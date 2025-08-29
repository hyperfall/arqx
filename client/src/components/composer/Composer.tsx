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
      <div className="max-w-3xl mx-auto mb-8 animate-slide-up">
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            <Textarea
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-6 bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 focus:border-primary/70 rounded-3xl text-foreground placeholder-muted-foreground resize-none transition-all duration-300 min-h-[140px] text-lg shadow-lg hover:shadow-xl focus:shadow-2xl"
              rows={4}
              data-testid="main-composer"
            />
            <div className="absolute bottom-6 right-6 flex items-center space-x-3">
              <div className="text-sm text-muted-foreground hidden sm:block">Press Enter to submit</div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-3 rounded-full font-semibold hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:scale-105"
                data-testid="generate-tool-button"
              >
                <Send className="w-5 h-5 mr-2" />
                Generate Tool
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Examples */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {quickExamples.map((example) => (
            <Button
              key={example.text}
              variant="secondary"
              onClick={() => handleExampleClick(example.text)}
              className="px-6 py-3 rounded-full text-sm font-medium hover:bg-secondary/80 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg border border-border/50 hover:border-primary/50"
              data-testid={`example-${example.text.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="mr-2 text-base">{example.icon}</span>
              {example.text}
            </Button>
          ))}
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
