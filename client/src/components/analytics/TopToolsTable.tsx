import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TelemetryEvent, AnalyticsEngine } from '@/lib/analytics';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TopToolsTableProps {
  events: TelemetryEvent[];
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
};

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export function TopToolsTable({ events }: TopToolsTableProps) {
  const topTools = useMemo(() => {
    return AnalyticsEngine.topTools(events, 20);
  }, [events]);

  if (topTools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No tool usage data available</p>
            <p className="text-sm">Run some tools to see statistics here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Tools (by usage)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="flex-1">Tool</div>
          <div className="w-16 text-right">Runs</div>
          <div className="w-16 text-right">Success</div>
          <div className="w-20 text-right">Avg Time</div>
          <div className="w-16 text-right">Input</div>
          <div className="w-16 text-right">Output</div>
        </div>

        {/* Scrollable Table Body */}
        <ScrollArea className="h-72">
          {topTools.map((tool, index) => (
            <div 
              key={index}
              className="flex items-center px-4 py-3 border-b border-border hover:bg-muted/50 cursor-pointer"
              onClick={() => {
                console.log('Navigate to tool:', tool.toolName);
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" title={tool.toolName}>
                  {tool.toolName}
                </div>
              </div>
              <div className="w-16 text-right text-sm tabular-nums">
                {tool.runs}
              </div>
              <div className="w-16 text-right text-sm tabular-nums">
                {tool.successRate}%
              </div>
              <div className="w-20 text-right text-sm tabular-nums">
                {formatDuration(tool.avgDuration)}
              </div>
              <div className="w-16 text-right text-sm tabular-nums">
                {formatBytes(tool.bytesIn)}
              </div>
              <div className="w-16 text-right text-sm tabular-nums">
                {formatBytes(tool.bytesOut)}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}