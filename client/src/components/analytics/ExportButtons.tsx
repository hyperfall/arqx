import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TelemetryEvent, AnalyticsEngine } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Database } from 'lucide-react';

interface ExportButtonsProps {
  events: TelemetryEvent[];
  dateRange: string;
}

export function ExportButtons({ events, dateRange }: ExportButtonsProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const { toast } = useToast();

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const filename = `toolforge-analytics-${dateRange.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      AnalyticsEngine.exportToCsv(events, filename);
      
      toast({
        title: "CSV exported",
        description: `Analytics data exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export CSV data",
        variant: "destructive",
      });
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      const filename = `toolforge-analytics-${dateRange.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      AnalyticsEngine.exportToJson(events, filename);
      
      toast({
        title: "JSON exported",
        description: `Analytics data exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export JSON data",
        variant: "destructive",
      });
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4" />
          Export Analytics Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={isExportingCsv || events.length === 0}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isExportingCsv ? "Exporting..." : "Export as CSV"}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportJson}
            disabled={isExportingJson || events.length === 0}
            className="flex-1"
          >
            <Database className="mr-2 h-4 w-4" />
            {isExportingJson ? "Exporting..." : "Export as JSON"}
          </Button>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <p>
            <strong>Export includes:</strong> {events.length} events from {dateRange}
          </p>
          <p>
            Data contains timestamps, tool usage, performance metrics, and error information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}