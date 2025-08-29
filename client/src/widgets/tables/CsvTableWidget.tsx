import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function CsvTableWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const [data, setData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileBinding = bindings?.file || '@csv';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  useEffect(() => {
    if (!file) {
      setData([]);
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string || '';
      const lines = text.split('\n').filter(line => line.trim());
      const parsed = lines.map(line => line.split(',').map(cell => cell.trim()));
      setData(parsed);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setData([]);
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
            <p className="font-medium">No CSV file selected</p>
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
        ) : (
          <div className="h-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                {data[0] && (
                  <tr>
                    {data[0].map((header, index) => (
                      <th key={index} className="p-2 text-left border-b">
                        {header}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-muted/50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}