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
          "relative group flex items-center gap-3 h-12 px-4 text-sm justify-start transition-all duration-200",
          active 
            ? "bg-[color:var(--card)] text-foreground rounded-l-xl mr-[-24px] pr-12 relative z-10" 
            : "hover:bg-white/60 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-xl w-full",
          isRailCollapsed && "px-3 justify-center"
        )}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!isRailCollapsed && <span className="truncate">{label}</span>}
        
        {/* Connection extension for active item */}
        {active && !isRailCollapsed && (
          <div 
            aria-hidden
            className="absolute right-[-24px] top-0 bottom-0 w-6 bg-[color:var(--card)] rounded-r-xl z-0"
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
        "h-full overflow-visible transition-all duration-200 flex flex-col",
        isRailCollapsed ? "w-[72px]" : "w-64"
      )}
      data-testid="left-rail"
    >
      {/* Rail Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRail}
          className="hover:bg-white/80 dark:hover:bg-white/10 rounded-lg transition-colors focus-ring"
          data-testid="rail-toggle"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-y-auto">
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
          <div className="p-4 mt-auto">
            {isRailCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="hover:bg-white/60 dark:hover:bg-white/10 hover:text-destructive rounded-lg transition-colors focus-ring"
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
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm w-full justify-start hover:bg-white/60 dark:hover:bg-white/10 hover:text-destructive transition-colors focus-ring"
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
