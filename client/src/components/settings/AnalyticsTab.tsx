import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsEngine, DemoDataSeeder } from '@/lib/analytics';
import { OverviewCards } from '../analytics/OverviewCards';
import { Charts } from '../analytics/Charts';
import { QuotaMeters } from '../analytics/QuotaMeters';
import { TopToolsTable } from '../analytics/TopToolsTable';
import { FailuresPanel } from '../analytics/FailuresPanel';
import { AuditTrail } from '../analytics/AuditTrail';
import { ExportButtons } from '../analytics/ExportButtons';
import { featureFlags } from '../../../../src/config';

type DateRange = '7d' | '30d' | '90d';

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const flags = featureFlags.get();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  useEffect(() => {
    // Seed demo data on first load if in development
    if (import.meta.env.DEV) {
      DemoDataSeeder.seedIfEmpty();
    }
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const daysBack = parseInt(dateRange.replace('d', ''));
      const from = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      const data = await AnalyticsEngine.getRange(from, now);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 30 days';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Usage & Analytics</h3>
          <div className="w-32 h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-none overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Usage & Analytics</h3>
        <div className="flex items-center gap-4">
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => DemoDataSeeder.seedIfEmpty()}
            >
              Seed Demo Data
            </Button>
          )}
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards events={events} dateRange={dateRange} />

      {/* Usage Charts */}
      <Charts events={events} />

      {/* Quotas & Storage */}
      <QuotaMeters localOnlyMode={flags.localOnlyMode} />

      {/* Top Tools Table */}
      <TopToolsTable events={events} />

      {/* Failures & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FailuresPanel events={events} />
        <AuditTrail events={events} />
      </div>

      {/* Export */}
      <ExportButtons events={events} dateRange={getRangeLabel(dateRange)} />
    </div>
  );
}