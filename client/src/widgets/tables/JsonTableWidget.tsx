import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function JsonTableWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileBinding = bindings?.file || '@json';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  useEffect(() => {
    if (!file) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string || '';
        const parsed = JSON.parse(text);
        setData(parsed);
      } catch (err) {
        setError('Invalid JSON format');
        setData(null);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Error reading file');
      setData(null);
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  }, [file]);

  if (!file) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              📊
            </div>
            <p className="font-medium">No JSON file selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="viewerRoot overflow-hidden" style={{ height: 'min(75vh, 600px)' }}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0 h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-destructive">
              <p className="font-medium">Failed to parse JSON</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <pre className="h-full overflow-auto p-4 text-sm font-mono whitespace-pre-wrap bg-muted/10">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}