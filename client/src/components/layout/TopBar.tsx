import { Search, Bell, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/themes/ThemeSwitcher";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export default function TopBar() {
  const { isAuthenticated, user, signOut } = useAuthStore();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Search:", searchValue);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface/90 glass-effect border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Hammer className="text-primary-foreground w-4 h-4" />
          </div>
          <span className="font-semibold text-foreground text-lg">TOOLFORGE</span>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="relative max-w-md w-full mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tools or commands..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-16 bg-muted/50 border border-border rounded-full text-sm focus-ring"
              data-testid="global-search"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs bg-secondary border border-border rounded text-muted-foreground">
                /
              </kbd>
            </div>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted rounded-lg transition-colors focus-ring"
            data-testid="notifications-button"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 p-1 hover:bg-muted rounded-lg transition-colors focus-ring"
                data-testid="user-menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32" />
                  <AvatarFallback>
                    {user?.email?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <div className="font-medium">Signed in as</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="profile-link">Profile</DropdownMenuItem>
                  <DropdownMenuItem data-testid="settings-link">Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} data-testid="sign-out-button">
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem data-testid="sign-in-button">Sign in</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
