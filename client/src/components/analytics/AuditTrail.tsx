import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TelemetryEvent } from '@/lib/analytics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditTrailProps {
  events: TelemetryEvent[];
}

export function AuditTrail({ events }: AuditTrailProps) {
  const { toast } = useToast();

  const auditEvents = useMemo(() => {
    return events
      .filter(e => ['save_tool', 'import_spec', 'export_spec'].includes(e.type))
      .slice(-10)
      .reverse()
      .map(event => {
        // Generate a simple hash for the spec (in a real implementation, this would be stored)
        const specHash = event.toolId ? 
          event.toolId.slice(0, 8) + '...' : 
          'unknown';
        
        return {
          ...event,
          specHash,
        };
      });
  }, [events]);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'save_tool': return 'Tool Saved';
      case 'import_spec': return 'Spec Imported';
      case 'export_spec': return 'Spec Exported';
      default: return type;
    }
  };

  const getActionBadgeVariant = (type: string) => {
    switch (type) {
      case 'save_tool': return 'default';
      case 'import_spec': return 'secondary';
      case 'export_spec': return 'outline';
      default: return 'default';
    }
  };

  const copySpecHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast({
        title: "Copied to clipboard",
        description: "Spec hash copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {auditEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No audit events</p>
            <p className="text-xs">Tool actions will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="p-4 space-y-3">
              {auditEvents.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionBadgeVariant(event.type) as any} className="text-xs">
                        {getActionLabel(event.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.ts)}
                      </span>
                    </div>
                    
                    <div className="text-sm font-medium truncate" title={event.toolName}>
                      {event.toolName || 'Unknown Tool'}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {event.specHash}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => copySpecHash(event.specHash)}
                        title="Copy spec hash"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}