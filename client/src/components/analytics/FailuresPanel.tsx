import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TelemetryEvent, AnalyticsEngine } from '@/lib/analytics';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface FailuresPanelProps {
  events: TelemetryEvent[];
}

export function FailuresPanel({ events }: FailuresPanelProps) {
  const [selectedError, setSelectedError] = useState<string | null>(null);

  const errorStats = useMemo(() => {
    return AnalyticsEngine.getErrorStats(events);
  }, [events]);

  const recentErrors = useMemo(() => {
    return events
      .filter(e => e.type === 'run_error')
      .slice(-5)
      .reverse();
  }, [events]);

  const durationBuckets = useMemo(() => {
    const durations = events
      .filter(e => e.type === 'run_success' && e.durationMs)
      .map(e => e.durationMs!);

    const buckets = [
      { label: '< 1s', min: 0, max: 1000, count: 0 },
      { label: '1-3s', min: 1000, max: 3000, count: 0 },
      { label: '3-10s', min: 3000, max: 10000, count: 0 },
      { label: '10s+', min: 10000, max: Infinity, count: 0 },
    ];

    durations.forEach(duration => {
      for (const bucket of buckets) {
        if (duration >= bucket.min && duration < bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets;
  }, [events]);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" />
          Failures & Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Distribution */}
        <div>
          <h4 className="font-medium text-sm mb-3">Top Error Codes</h4>
          {errorStats.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No errors recorded
            </div>
          ) : (
            <div className="space-y-2">
              {errorStats.slice(0, 3).map((error, index) => (
                <Dialog key={error.code}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto p-3"
                      onClick={() => setSelectedError(error.code)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{error.message}</div>
                        <div className="text-xs text-muted-foreground">{error.code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm tabular-nums">{error.count}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Error Details: {error.code}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {error.message}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Total occurrences:</span> {error.count}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recent occurrences:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {recentErrors
                            .filter(e => e.errorCode === error.code)
                            .slice(0, 5)
                            .map((e, i) => (
                              <div key={i} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                {formatTimestamp(e.ts)} - {e.toolName || 'Unknown tool'}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>

        {/* Duration Histogram */}
        <div>
          <h4 className="font-medium text-sm mb-3">Run Duration Distribution</h4>
          <div className="space-y-2">
            {durationBuckets.map((bucket, index) => {
              const maxCount = Math.max(...durationBuckets.map(b => b.count));
              const percentage = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-12 text-xs text-muted-foreground text-right">
                    {bucket.label}
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs text-muted-foreground tabular-nums">
                    {bucket.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}