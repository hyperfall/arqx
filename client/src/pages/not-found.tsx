import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in" data-testid="not-found-page">
      {/* Modern 404 Design */}
      <div className="space-y-4">
        <div className="relative">
          <h1 className="text-9xl font-bold text-primary/20 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-primary" />
          </div>
        </div>
        <div className="w-32 h-1 bg-gradient-to-r from-primary/50 to-primary mx-auto rounded-full"></div>
      </div>

      {/* Content */}
      <div className="space-y-4 max-w-lg">
        <h2 className="text-3xl font-bold text-foreground">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to building amazing tools.
        </p>
      </div>

      {/* Modern Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button asChild size="lg" className="min-w-[140px]">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => window.history.back()} 
          className="min-w-[140px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>

      {/* Quick Links */}
      <div className="pt-8 border-t border-border/50 w-full max-w-md">
        <p className="text-sm text-muted-foreground mb-4">Quick links:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/gallery">Tool Gallery</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">About</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
