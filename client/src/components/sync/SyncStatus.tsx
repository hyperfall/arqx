import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Loader2
} from 'lucide-react';
import { syncService, SyncState, SyncStatus } from '../../../../src/services/SyncService';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  compact?: boolean;
  showControls?: boolean;
}

export function SyncStatusComponent({ compact = false, showControls = true }: SyncStatusProps) {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setSyncState);
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!isAuthenticated) return;
    
    setIsManualSyncing(true);
    try {
      await syncService.sync();
    } catch (error) {
      // Error is handled by sync service
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleImportLocalDrafts = async () => {
    if (!isAuthenticated) return;
    
    try {
      const imported = await syncService.importLocalDrafts();
      if (imported > 0) {
        // Could show a toast here
        console.log(`Imported ${imported} local drafts to cloud`);
      }
    } catch (error) {
      // Error is handled by sync service
    }
  };

  const getSyncStatusDisplay = (status: SyncStatus) => {
    switch (status) {
      case 'idle':
        return {
          icon: Cloud,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Ready to sync'
        };
      case 'syncing':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          label: 'Syncing...',
          spin: true
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900',
          label: 'Synced'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900',
          label: 'Sync failed'
        };
      case 'conflict':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          label: 'Conflicts found'
        };
      default:
        return {
          icon: CloudOff,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Offline'
        };
    }
  };

  if (!isAuthenticated) {
    if (compact) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CloudOff className="h-3 w-3" />
              {!compact && "Local Only"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in to enable cloud sync</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return null;
  }

  const statusDisplay = getSyncStatusDisplay(syncState.status);
  const Icon = statusDisplay.icon;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSync}
            disabled={syncState.status === 'syncing' || isManualSyncing}
            className="flex items-center gap-2 px-2"
            data-testid="sync-status-compact"
          >
            <Icon 
              className={`h-4 w-4 ${statusDisplay.color} ${statusDisplay.spin ? 'animate-spin' : ''}`} 
            />
            {!compact && statusDisplay.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{statusDisplay.label}</p>
            {syncState.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last sync: {formatDistanceToNow(syncState.lastSync, { addSuffix: true })}
              </p>
            )}
            {syncState.error && (
              <p className="text-xs text-red-500">{syncState.error}</p>
            )}
            <p className="text-xs">Click to sync now</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card className="w-full" data-testid="sync-status-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${statusDisplay.bgColor}`}>
                <Icon 
                  className={`h-4 w-4 ${statusDisplay.color} ${statusDisplay.spin ? 'animate-spin' : ''}`} 
                />
              </div>
              <div>
                <h3 className="font-medium">{statusDisplay.label}</h3>
                {syncState.lastSync && (
                  <p className="text-sm text-muted-foreground">
                    Last sync: {formatDistanceToNow(syncState.lastSync, { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            
            <Badge variant={syncState.isAutoSyncEnabled ? "default" : "secondary"}>
              {syncState.isAutoSyncEnabled ? "Auto-sync ON" : "Auto-sync OFF"}
            </Badge>
          </div>

          {/* Error Display */}
          {syncState.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {syncState.error}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => syncService.clearError()}
                  className="ml-2 p-0 h-auto"
                  data-testid="clear-sync-error"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Sync Results */}
          {syncState.result && syncState.status === 'success' && (
            <div className="text-sm text-muted-foreground">
              <p>✓ Merged {syncState.result.merged} tools</p>
              {syncState.result.conflicts > 0 && (
                <p className="text-yellow-600">⚠ {syncState.result.conflicts} conflicts detected</p>
              )}
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleManualSync}
                disabled={syncState.status === 'syncing' || isManualSyncing}
                size="sm"
                data-testid="manual-sync-button"
              >
                {(syncState.status === 'syncing' || isManualSyncing) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleImportLocalDrafts}
                disabled={syncState.status === 'syncing'}
                size="sm"
                data-testid="import-drafts-button"
              >
                <Cloud className="mr-2 h-4 w-4" />
                Import Local Tools
              </Button>

              <Button
                variant="outline"
                onClick={() => syncService.setAutoSync(!syncState.isAutoSyncEnabled)}
                size="sm"
                data-testid="toggle-auto-sync"
              >
                <Clock className="mr-2 h-4 w-4" />
                {syncState.isAutoSyncEnabled ? 'Disable' : 'Enable'} Auto-sync
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}