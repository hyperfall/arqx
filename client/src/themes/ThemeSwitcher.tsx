import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Select value={theme.id} onValueChange={setTheme}>
      <SelectTrigger className="w-[160px] bg-muted border border-border rounded-lg text-sm focus-ring" data-testid="theme-switcher">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {themes.map((themeOption) => (
          <SelectItem key={themeOption.id} value={themeOption.id}>
            {themeOption.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
