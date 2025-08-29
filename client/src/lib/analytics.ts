// Telemetry storage using IndexedDB directly
import Dexie, { Table } from 'dexie';

// Telemetry database
export class TelemetryDB extends Dexie {
  telemetryEvents!: Table<TelemetryEvent>;

  constructor() {
    super('ToolForgeTelemetry');
    this.version(1).stores({
      telemetryEvents: 'id, ts, type, toolId, venue'
    });
  }
}

// Global telemetry database instance
export const telemetryDB = new TelemetryDB();

// Telemetry event types for usage analytics
export interface TelemetryEvent {
  id: string;
  ts: number;
  user?: string | null;
  type: 'run_start' | 'run_success' | 'run_error' | 'save_tool' | 'open_tool' | 'export_spec' | 'import_spec' | 'prefetch' | 'gallery_view';
  toolId?: string;
  toolName?: string;
  bytesIn?: number;
  bytesOut?: number;
  venue?: 'browser' | 'server';
  durationMs?: number;
  errorCode?: string;
}

export interface UsageStats {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  p50Duration: number;
  p95Duration: number;
  localVsServerRatio: { local: number; server: number };
  bytesProcessed: { in: number; out: number };
}

export interface DayBucket {
  day: string;
  runs: number;
  successes: number;
  errors: number;
  bytesIn: number;
  bytesOut: number;
  avgDuration: number;
}

export interface TopTool {
  toolId: string;
  toolName: string;
  runs: number;
  successRate: number;
  avgDuration: number;
  bytesIn: number;
  bytesOut: number;
}

// Analytics aggregation functions
export class AnalyticsEngine {
  // Get events within a date range
  static async getRange(from: Date, to: Date): Promise<TelemetryEvent[]> {
    try {
      const events = await telemetryDB.telemetryEvents
        .where('ts')
        .between(from.getTime(), to.getTime())
        .toArray();
      return events;
    } catch (error) {
      console.warn('Failed to fetch telemetry events:', error);
      return [];
    }
  }

  // Bucket events by day
  static bucketByDay(events: TelemetryEvent[]): DayBucket[] {
    const buckets = new Map<string, DayBucket>();

    events.forEach(event => {
      const day = new Date(event.ts).toISOString().split('T')[0];
      
      if (!buckets.has(day)) {
        buckets.set(day, {
          day,
          runs: 0,
          successes: 0,
          errors: 0,
          bytesIn: 0,
          bytesOut: 0,
          avgDuration: 0,
        });
      }

      const bucket = buckets.get(day)!;
      
      if (event.type === 'run_start') {
        bucket.runs++;
      } else if (event.type === 'run_success') {
        bucket.successes++;
        if (event.durationMs) {
          bucket.avgDuration = (bucket.avgDuration * (bucket.successes - 1) + event.durationMs) / bucket.successes;
        }
      } else if (event.type === 'run_error') {
        bucket.errors++;
      }

      bucket.bytesIn += event.bytesIn || 0;
      bucket.bytesOut += event.bytesOut || 0;
    });

    return Array.from(buckets.values()).sort((a, b) => a.day.localeCompare(b.day));
  }

  // Calculate duration statistics
  static durationStats(events: TelemetryEvent[]): { p50: number; p95: number; avg: number } {
    const durations = events
      .filter(e => e.type === 'run_success' && e.durationMs)
      .map(e => e.durationMs!)
      .sort((a, b) => a - b);

    if (durations.length === 0) {
      return { p50: 0, p95: 0, avg: 0 };
    }

    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    return {
      p50: durations[p50Index] || 0,
      p95: durations[p95Index] || 0,
      avg: Math.round(avg),
    };
  }

  // Calculate success rate
  static successRate(events: TelemetryEvent[]): number {
    const runEvents = events.filter(e => e.type === 'run_success' || e.type === 'run_error');
    if (runEvents.length === 0) return 0;
    
    const successes = events.filter(e => e.type === 'run_success').length;
    return Math.round((successes / runEvents.length) * 100);
  }

  // Get top tools by usage
  static topTools(events: TelemetryEvent[], limit = 20): TopTool[] {
    const toolStats = new Map<string, {
      toolId: string;
      toolName: string;
      runs: number;
      successes: number;
      errors: number;
      totalDuration: number;
      bytesIn: number;
      bytesOut: number;
    }>();

    events.forEach(event => {
      if (!event.toolId || !event.toolName) return;

      if (!toolStats.has(event.toolId)) {
        toolStats.set(event.toolId, {
          toolId: event.toolId,
          toolName: event.toolName,
          runs: 0,
          successes: 0,
          errors: 0,
          totalDuration: 0,
          bytesIn: 0,
          bytesOut: 0,
        });
      }

      const stats = toolStats.get(event.toolId)!;
      
      if (event.type === 'run_start') {
        stats.runs++;
      } else if (event.type === 'run_success') {
        stats.successes++;
        stats.totalDuration += event.durationMs || 0;
      } else if (event.type === 'run_error') {
        stats.errors++;
      }

      stats.bytesIn += event.bytesIn || 0;
      stats.bytesOut += event.bytesOut || 0;
    });

    return Array.from(toolStats.values())
      .map(stats => ({
        toolId: stats.toolId,
        toolName: stats.toolName,
        runs: stats.runs,
        successRate: stats.runs > 0 ? Math.round((stats.successes / stats.runs) * 100) : 0,
        avgDuration: stats.successes > 0 ? Math.round(stats.totalDuration / stats.successes) : 0,
        bytesIn: stats.bytesIn,
        bytesOut: stats.bytesOut,
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, limit);
  }

  // Get local vs server execution split
  static localVsServerSplit(events: TelemetryEvent[]): { local: number; server: number } {
    const runEvents = events.filter(e => e.type === 'run_success' || e.type === 'run_error');
    const local = runEvents.filter(e => e.venue === 'browser').length;
    const server = runEvents.filter(e => e.venue === 'server').length;
    
    return { local, server };
  }

  // Calculate size of artifacts in IndexedDB (using existing artifact storage)
  static async sizeOfArtifacts(): Promise<number> {
    try {
      // Import using the correct path to ArtifactStorage
      const { artifactStorage } = await import('../../../src/repositories/local/ArtifactStorage');
      const stats = await artifactStorage.getStats();
      return Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100; // MB
    } catch (error) {
      console.warn('Failed to calculate artifacts size:', error);
      return 0;
    }
  }

  // Clear cache and artifacts
  static async clearCache(): Promise<void> {
    try {
      // Clear artifacts using the existing artifact storage
      const { artifactStorage } = await import('../../../src/repositories/local/ArtifactStorage');
      await artifactStorage.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // Get error code distribution
  static getErrorStats(events: TelemetryEvent[]): Array<{ code: string; count: number; message: string }> {
    const errorEvents = events.filter(e => e.type === 'run_error' && e.errorCode);
    const errorCounts = new Map<string, number>();

    errorEvents.forEach(event => {
      const code = event.errorCode!;
      errorCounts.set(code, (errorCounts.get(code) || 0) + 1);
    });

    const errorMessages: Record<string, string> = {
      'FILE_TOO_LARGE': 'File exceeds size limit',
      'UNSUPPORTED_FORMAT': 'File format not supported',
      'PROCESSING_FAILED': 'Processing failed',
      'NETWORK_ERROR': 'Network connection error',
      'TIMEOUT': 'Request timed out',
      'UNKNOWN': 'Unknown error occurred',
    };

    return Array.from(errorCounts.entries())
      .map(([code, count]) => ({
        code,
        count,
        message: errorMessages[code] || 'Unknown error',
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Export data to CSV
  static exportToCsv(events: TelemetryEvent[], filename: string): void {
    const headers = ['Timestamp', 'Type', 'Tool ID', 'Tool Name', 'Duration (ms)', 'Bytes In', 'Bytes Out', 'Venue', 'Error Code'];
    const rows = events.map(event => [
      new Date(event.ts).toISOString(),
      event.type,
      event.toolId || '',
      event.toolName || '',
      event.durationMs || '',
      event.bytesIn || '',
      event.bytesOut || '',
      event.venue || '',
      event.errorCode || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export data to JSON
  static exportToJson(events: TelemetryEvent[], filename: string): void {
    const jsonContent = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Telemetry tracking functions
export class TelemetryTracker {
  static async track(event: Omit<TelemetryEvent, 'id' | 'ts'>): Promise<void> {
    try {
      const telemetryEvent: TelemetryEvent = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        ...event,
      };

      await telemetryDB.telemetryEvents.add(telemetryEvent);
    } catch (error) {
      console.warn('Failed to track telemetry event:', error);
    }
  }

  static async trackRunStart(toolId: string, toolName: string, bytesIn?: number): Promise<string> {
    const runId = crypto.randomUUID();
    await this.track({
      type: 'run_start',
      toolId,
      toolName,
      bytesIn,
      venue: 'browser',
    });
    return runId;
  }

  static async trackRunSuccess(toolId: string, toolName: string, durationMs: number, bytesOut?: number): Promise<void> {
    await this.track({
      type: 'run_success',
      toolId,
      toolName,
      durationMs,
      bytesOut,
      venue: 'browser',
    });
  }

  static async trackRunError(toolId: string, toolName: string, errorCode: string, durationMs?: number): Promise<void> {
    await this.track({
      type: 'run_error',
      toolId,
      toolName,
      errorCode,
      durationMs,
      venue: 'browser',
    });
  }

  static async trackToolAction(action: 'save_tool' | 'open_tool' | 'export_spec' | 'import_spec', toolId?: string, toolName?: string): Promise<void> {
    await this.track({
      type: action,
      toolId,
      toolName,
    });
  }

  static async trackGalleryView(): Promise<void> {
    await this.track({
      type: 'gallery_view',
    });
  }
}

// Demo data seeding for development
export class DemoDataSeeder {
  static async seedIfEmpty(): Promise<void> {
    try {
      const existingEvents = await telemetryDB.telemetryEvents.limit(1).toArray();
      if (existingEvents.length > 0) {
        return; // Data already exists
      }

      console.log('Seeding demo analytics data...');
      
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const toolNames = [
        'PNG to JPEG Converter',
        'PDF Viewer',
        'Image Resizer',
        'Video Compressor',
        'CSV Table Viewer',
        'JSON Formatter',
        'Text Processor',
        'Audio Converter',
      ];

      const events: TelemetryEvent[] = [];

      // Generate 30 days of realistic usage data
      for (let day = 0; day < 30; day++) {
        const dayStart = thirtyDaysAgo + (day * 24 * 60 * 60 * 1000);
        const runsToday = Math.floor(Math.random() * 15) + 5; // 5-20 runs per day

        for (let run = 0; run < runsToday; run++) {
          const toolIndex = Math.floor(Math.random() * toolNames.length);
          const toolName = toolNames[toolIndex];
          const toolId = `tool_${toolIndex}_demo`;
          const runTime = dayStart + Math.floor(Math.random() * 24 * 60 * 60 * 1000);
          const duration = Math.floor(Math.random() * 5000) + 500; // 0.5-5.5s
          const bytesIn = Math.floor(Math.random() * 5000000) + 100000; // 100KB-5MB
          const bytesOut = Math.floor(bytesIn * (0.3 + Math.random() * 0.4)); // 30-70% of input
          const isSuccess = Math.random() > 0.1; // 90% success rate

          // Run start event
          events.push({
            id: crypto.randomUUID(),
            ts: runTime,
            type: 'run_start',
            toolId,
            toolName,
            bytesIn,
            venue: Math.random() > 0.7 ? 'server' : 'browser',
          });

          // Run result event
          events.push({
            id: crypto.randomUUID(),
            ts: runTime + duration,
            type: isSuccess ? 'run_success' : 'run_error',
            toolId,
            toolName,
            durationMs: duration,
            bytesOut: isSuccess ? bytesOut : undefined,
            errorCode: !isSuccess ? ['FILE_TOO_LARGE', 'PROCESSING_FAILED', 'NETWORK_ERROR'][Math.floor(Math.random() * 3)] : undefined,
            venue: Math.random() > 0.7 ? 'server' : 'browser',
          });

          // Occasional other events
          if (Math.random() > 0.8) {
            const actionTypes = ['save_tool', 'export_spec', 'import_spec'] as const;
            events.push({
              id: crypto.randomUUID(),
              ts: runTime + duration + Math.floor(Math.random() * 60000),
              type: actionTypes[Math.floor(Math.random() * actionTypes.length)],
              toolId,
              toolName,
            });
          }
        }

        // Gallery views
        const galleryViews = Math.floor(Math.random() * 3);
        for (let i = 0; i < galleryViews; i++) {
          events.push({
            id: crypto.randomUUID(),
            ts: dayStart + Math.floor(Math.random() * 24 * 60 * 60 * 1000),
            type: 'gallery_view',
          });
        }
      }

      // Bulk insert all events
      await telemetryDB.telemetryEvents.bulkAdd(events);
      console.log(`Seeded ${events.length} demo telemetry events`);
    } catch (error) {
      console.error('Failed to seed demo data:', error);
    }
  }
}