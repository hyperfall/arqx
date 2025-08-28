import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/themes/ThemeSwitcher";
import { useTheme } from "@/themes/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { keyboardShortcuts } from "@/lib/keyboard";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Settings() {
  const { theme } = useTheme();
  const { isAuthenticated, user, signOut } = useAuthStore();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="space-y-8" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience and manage your account
        </p>
      </div>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Theme
            <ThemeSwitcher />
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isAuthenticated ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="text-foreground">{user?.email}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sign-in Method</Label>
                  <div className="text-foreground">
                    {isSupabaseConfigured ? "Magic Link" : "Mock Authentication"}
                  </div>
                </div>
                <Separator />
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  data-testid="settings-sign-out"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div>
                <p className="text-muted-foreground mb-4">
                  Sign in to save your tools and sync across devices.
                </p>
                <Button data-testid="settings-sign-in">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Local Processing</h4>
              <p className="text-sm text-muted-foreground">
                All tool runs are simulated locally in your browser. No files are uploaded to our servers.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm">
                Terms of Service
              </Button>
              <Button variant="outline" size="sm">
                Data Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Label component if not imported
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
