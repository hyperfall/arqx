import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/themes/ThemeProvider";
import TopBar from "@/components/layout/TopBar";
import LeftRail from "@/components/layout/LeftRail";
import MainCard from "@/components/layout/MainCard";
import CommandPalette from "@/components/layout/CommandPalette";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import Tool from "@/pages/Tool";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";
import { useKeyboard } from "@/lib/keyboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/t/:id" component={Tool} />
      <Route path="/settings" component={Settings} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  useKeyboard();

  return (
    <div className="overflow-hidden h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 pt-16 overflow-hidden">
        <div className="grid grid-cols-[260px_1fr] xl:grid-cols-[260px_minmax(860px,1fr)] gap-0 px-6 py-6 h-full">
          <LeftRail />
          <MainCard>
            <Router />
          </MainCard>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
