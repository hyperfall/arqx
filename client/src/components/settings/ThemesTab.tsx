import { ThemeSwitcher } from "@/themes/ThemeSwitcher";
import { useTheme } from "@/themes/ThemeProvider";

export function ThemesTab() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Theme Settings</h3>
        <ThemeSwitcher />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-2">Current Theme</h4>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary" />
            <div>
              <div className="font-medium">{theme.name}</div>
              <div className="text-sm text-muted-foreground">
                {theme.description}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-foreground mb-2">Preview Swatches</h4>
          <div className="flex space-x-2">
            <div className="w-8 h-8 rounded bg-primary" title="Primary" />
            <div className="w-8 h-8 rounded bg-secondary" title="Secondary" />
            <div className="w-8 h-8 rounded bg-muted" title="Muted" />
            <div className="w-8 h-8 rounded bg-card border border-border" title="Card" />
          </div>
        </div>
      </div>
    </div>
  );
}