import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function OutputFilesWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  // This would typically show generated output files
  // For now, just show a placeholder
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title || 'Output Files'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Output files will appear here after processing
        </p>
      </CardContent>
    </Card>
  );
}