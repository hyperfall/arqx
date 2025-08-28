import { Home, Grid3X3, Settings, Info, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Grid3X3, label: "Tool Gallery", href: "/gallery" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Info, label: "About", href: "/about" },
];

export default function LeftRail() {
  const { isRailCollapsed, toggleRail } = useUIStore();
  const { isAuthenticated, signOut } = useAuthStore();
  const [location, navigate] = useLocation();

  const NavItem = ({ icon: Icon, label, href, active }: { 
    icon: any; 
    label: string; 
    href: string; 
    active: boolean; 
  }) => {
    const content = (
      <Button
        variant="ghost"
        onClick={() => navigate(href)}
        className={cn(
          "relative group flex items-center gap-3 h-12 px-4 rounded-xl text-sm justify-start w-full",
          active 
            ? "bg-gradient-to-r from-violet-500/20 to-violet-500/10 text-violet-700 ring-1 ring-violet-500/30" 
            : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground",
          isRailCollapsed && "px-3 justify-center"
        )}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!isRailCollapsed && <span className="truncate">{label}</span>}
        
        {/* Connector nub for active item */}
        {active && !isRailCollapsed && (
          <span 
            aria-hidden
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-4 h-10 bg-[color:var(--card)] rounded-r-xl shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] z-20"
          />
        )}
      </Button>
    );

    if (isRailCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside 
      className={cn(
        "sticky top-6 h-[calc(100vh-96px)] rounded-2xl bg-[color:var(--rail)] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 overflow-visible dark:ring-white/10 transition-all duration-200",
        isRailCollapsed ? "w-[72px]" : "w-64"
      )}
      data-testid="left-rail"
    >
      {/* Rail Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRail}
          className="hover:bg-muted rounded-lg transition-colors focus-ring"
          data-testid="rail-toggle"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-full overflow-y-auto">
        <nav className="p-4 space-y-2" role="navigation">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={location === item.href}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        {isAuthenticated && (
          <div className="p-4 border-t border-border/50 mt-auto">
            {isRailCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="hover:bg-muted hover:text-destructive rounded-lg transition-colors focus-ring"
                    data-testid="sign-out-button"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Log out
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={signOut}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm w-full justify-start hover:bg-muted hover:text-destructive transition-colors focus-ring"
                data-testid="sign-out-button"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
