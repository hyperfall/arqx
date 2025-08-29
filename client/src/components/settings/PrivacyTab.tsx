import { Button } from "@/components/ui/button";

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Privacy & Data</h3>
      
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
        </div>
      </div>
    </div>
  );
}