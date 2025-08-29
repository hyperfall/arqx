import { useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TelemetryEvent, AnalyticsEngine } from '@/lib/analytics';

// Lazy load chart components to reduce bundle size
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));

interface ChartsProps {
  events: TelemetryEvent[];
}

export function Charts({ events }: ChartsProps) {
  const chartData = useMemo(() => {
    const dailyBuckets = AnalyticsEngine.bucketByDay(events);
    const { local, server } = AnalyticsEngine.localVsServerSplit(events);
    
    // Line chart data (runs per day)
    const lineData = dailyBuckets.map(bucket => ({
      date: new Date(bucket.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      runs: bucket.runs,
      successes: bucket.successes,
      errors: bucket.errors,
    }));

    // Stacked bar data (bytes processed)
    const barData = dailyBuckets.map(bucket => ({
      date: new Date(bucket.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bytesIn: Math.round(bucket.bytesIn / (1024 * 1024) * 10) / 10, // MB
      bytesOut: Math.round(bucket.bytesOut / (1024 * 1024) * 10) / 10, // MB
    }));

    // Pie chart data (local vs server)
    const pieData = [
      { name: 'Local', value: local, color: 'hsl(var(--primary))' },
      { name: 'Server', value: server, color: 'hsl(var(--muted))' },
    ].filter(item => item.value > 0);

    return { lineData, barData, pieData };
  }, [events]);

  const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => (
    <div className={`${height} bg-muted animate-pulse rounded flex items-center justify-center`}>
      <div className="text-muted-foreground">Loading chart...</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Runs per Day */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Runs per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.lineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="runs" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successes" 
                    stroke="hsl(var(--green))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--green))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </CardContent>
      </Card>

      {/* Local vs Server Split */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processing Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '200px', overflow: 'hidden' }}>
            <Suspense fallback={<ChartSkeleton height="h-48" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="hsl(var(--primary))"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2" />
              <span>Local</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-muted mr-2" />
              <span>Server</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bytes Processed */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Data Processed (MB per day)</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="bytesIn" fill="hsl(var(--primary))" name="Input (MB)" />
                  <Bar dataKey="bytesOut" fill="hsl(var(--muted))" name="Output (MB)" />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}