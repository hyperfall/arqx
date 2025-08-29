import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function TextViewerWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fileBinding = bindings?.file || '@text';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  useEffect(() => {
    if (!file) {
      setContent('');
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string || '');
      setIsLoading(false);
    };
    reader.onerror = () => {
      setContent('Error reading file');
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
              📄
            </div>
            <p className="font-medium">No text file selected</p>
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
          <pre className="h-full overflow-auto p-4 text-sm font-mono whitespace-pre-wrap bg-muted/10">
            {content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}