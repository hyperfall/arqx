import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TelemetryEvent, AnalyticsEngine } from '@/lib/analytics';
import { TrendingUp, TrendingDown, Clock, Activity, Zap } from 'lucide-react';

interface OverviewCardsProps {
  events: TelemetryEvent[];
  dateRange: string;
}

export function OverviewCards({ events, dateRange }: OverviewCardsProps) {
  const stats = useMemo(() => {
    const totalRuns = events.filter(e => e.type === 'run_start').length;
    const successRate = AnalyticsEngine.successRate(events);
    const { p50, avg } = AnalyticsEngine.durationStats(events);
    const { local, server } = AnalyticsEngine.localVsServerSplit(events);
    
    // Calculate trends (simplified - comparing first half vs second half)
    const midpoint = Math.floor(events.length / 2);
    const firstHalf = events.slice(0, midpoint);
    const secondHalf = events.slice(midpoint);
    
    const firstHalfRuns = firstHalf.filter(e => e.type === 'run_start').length;
    const secondHalfRuns = secondHalf.filter(e => e.type === 'run_start').length;
    const runsTrend = firstHalfRuns > 0 ? ((secondHalfRuns - firstHalfRuns) / firstHalfRuns) * 100 : 0;

    return {
      totalRuns,
      successRate,
      avgDuration: avg,
      p50Duration: p50,
      localPercentage: local + server > 0 ? Math.round((local / (local + server)) * 100) : 50,
      runsTrend: Math.round(runsTrend),
    };
  }, [events]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Runs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Runs ({dateRange})</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{stats.totalRuns.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendIcon trend={stats.runsTrend} />
            <span className="ml-1">
              {stats.runsTrend > 0 ? '+' : ''}{stats.runsTrend}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{stats.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Past {dateRange.replace('d', ' days')}
          </p>
        </CardContent>
      </Card>

      {/* Average Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{formatDuration(stats.avgDuration)}</div>
          <p className="text-xs text-muted-foreground">
            p50: {formatDuration(stats.p50Duration)}
          </p>
        </CardContent>
      </Card>

      {/* Local vs Server */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Local Processing</CardTitle>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-1" />
            <div className="w-3 h-3 rounded-full bg-muted" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{stats.localPercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {100 - stats.localPercentage}% server processing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}