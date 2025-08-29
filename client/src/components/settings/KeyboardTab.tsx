import { Badge } from "@/components/ui/badge";
import { keyboardShortcuts } from "@/lib/keyboard";

export function KeyboardTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
      
      <div className="space-y-3">
        {keyboardShortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-foreground">{shortcut.description}</span>
            <Badge variant="outline" className="font-mono">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}