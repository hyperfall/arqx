import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";
import { SyncStatusComponent } from "@/components/sync/SyncStatus";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { toolRepo } from "../../../../src/repositories";
import { featureFlags } from "../../../../src/config";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Upload, Database } from "lucide-react";

export function GeneralTab() {
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { toast } = useToast();
  
  const [flags, setFlags] = useState(featureFlags.get());
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    try {
      const utils = toolRepo.getLocalUtils();
      if (utils) {
        const size = await utils.getCacheSize();
        setCacheSize(size);
      }
    } catch (error) {
      console.error('Failed to load cache size:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleToggleLocalOnly = (enabled: boolean) => {
    featureFlags.set({ localOnlyMode: enabled });
    setFlags(featureFlags.get());
    
    toast({
      title: enabled ? "Local-only mode enabled" : "Local-only mode disabled",
      description: enabled 
        ? "Tools will only be saved locally in your browser."
        : "Tools can now sync to the cloud when signed in.",
    });
  };

  const handleToggleSupabase = (enabled: boolean) => {
    featureFlags.set({ supabaseOn: enabled });
    setFlags(featureFlags.get());
    
    toast({
      title: enabled ? "Cloud storage enabled" : "Cloud storage disabled",
      description: enabled 
        ? "Cloud features are now available."
        : "Only local storage will be used.",
    });
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const utils = toolRepo.getLocalUtils();
      if (utils) {
        await utils.clearCache();
        setCacheSize(0);
        toast({
          title: "Cache cleared",
          description: "All local data has been cleared from your browser.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to clear cache",
        description: "An error occurred while clearing the cache.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const utils = toolRepo.getLocalUtils();
      if (utils) {
        const data = await utils.exportToJSON();
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolforge-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Data exported",
          description: "Your tools have been downloaded as a JSON file.",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsImporting(true);
      try {
        const text = await file.text();
        const utils = toolRepo.getLocalUtils();
        if (utils) {
          const imported = await utils.importFromJSON(text);
          await loadCacheSize();
          
          toast({
            title: "Data imported",
            description: `Successfully imported ${imported} tools.`,
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account</h3>
        {isAuthenticated ? (
          <div className="space-y-4">
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
            <Button
              variant="destructive"
              onClick={handleSignOut}
              data-testid="settings-sign-out"
            >
              Sign Out
            </Button>
          </div>
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

      {/* Sync & Storage Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sync & Storage
        </h3>
        
        {isAuthenticated && (
          <SyncStatusComponent showControls={true} />
        )}
        
        {/* Storage Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="local-only">Local-only Mode</Label>
              <div className="text-sm text-muted-foreground">
                Store tools only in your browser (no cloud sync)
              </div>
            </div>
            <Switch
              id="local-only"
              checked={flags.localOnlyMode}
              onCheckedChange={handleToggleLocalOnly}
              data-testid="local-only-toggle"
            />
          </div>

          {!flags.localOnlyMode && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cloud-storage">Cloud Storage</Label>
                <div className="text-sm text-muted-foreground">
                  Enable cloud storage and synchronization
                </div>
              </div>
              <Switch
                id="cloud-storage"
                checked={flags.supabaseOn}
                onCheckedChange={handleToggleSupabase}
                data-testid="cloud-storage-toggle"
              />
            </div>
          )}
        </div>

        {/* Cache Management */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Cache Management</h4>
          
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Local Storage Usage</span>
              <span className="text-sm text-muted-foreground">{formatBytes(cacheSize)}</span>
            </div>
            <Progress value={Math.min((cacheSize / (50 * 1024 * 1024)) * 100, 100)} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              Browser storage limit: ~50MB
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={isClearing}
              data-testid="clear-cache-button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Cache"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={isExporting}
              data-testid="export-data-button"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportData}
              disabled={isImporting}
              data-testid="import-data-button"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}