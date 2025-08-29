import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AnalyticsEngine } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { HardDrive, Cloud, Trash2 } from 'lucide-react';

interface QuotaMetersProps {
  localOnlyMode: boolean;
}

export function QuotaMeters({ localOnlyMode }: QuotaMetersProps) {
  const [localCacheSize, setLocalCacheSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    try {
      const size = await AnalyticsEngine.sizeOfArtifacts();
      setLocalCacheSize(size);
    } catch (error) {
      console.error('Failed to load cache size:', error);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await AnalyticsEngine.clearCache();
      setLocalCacheSize(0);
      toast({
        title: "Cache cleared",
        description: "Local cache has been cleared successfully.",
      });
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

  const formatSize = (mb: number) => {
    if (mb < 0.1) return '< 0.1 MB';
    return `${mb.toFixed(1)} MB`;
  };

  const cacheLimit = 200; // 200MB limit
  const cachePercentage = Math.min((localCacheSize / cacheLimit) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Local Cache Meter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4" />
            Local Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Artifacts stored</span>
              <span className="tabular-nums">{formatSize(localCacheSize)}</span>
            </div>
            <Progress value={cachePercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>LRU cache limit</span>
              <span className="tabular-nums">{cacheLimit} MB</span>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isClearing || localCacheSize === 0}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isClearing ? "Clearing..." : "Clear Cache"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Local Cache</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all cached artifacts ({formatSize(localCacheSize)}) 
                  from your browser's local storage. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCache} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear Cache
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <strong>Note:</strong> Local cache stores processed files and tool outputs. 
            Older items are automatically removed when the {cacheLimit}MB limit is reached.
          </div>
        </CardContent>
      </Card>

      {/* Cloud Storage Meter (if not local-only mode) */}
      {!localOnlyMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4" />
              Cloud Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Tool specs stored</span>
                <span className="tabular-nums">-- MB</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Plan limit</span>
                <span className="tabular-nums">1 GB</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <strong>Cloud features:</strong> Tool spec sync, favorites, and cross-device access. 
              {!localOnlyMode && " Requires Supabase configuration."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local-only mode notice */}
      {localOnlyMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              Cloud Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Cloud className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Local-only mode enabled</p>
              <p className="text-xs">Cloud storage and sync are disabled</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}