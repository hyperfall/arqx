import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function MarkdownPreviewWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  // Get markdown file from bindings
  const fileBinding = bindings?.file || '@markdown';
  const markdownFile = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  if (!markdownFile) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              📝
            </div>
            <p className="font-medium">No markdown file selected</p>
            <p className="text-sm mt-1">Drop a .md file to preview it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For now, just display the raw markdown content
  // In a full implementation, this would parse and render markdown
  const [content, setContent] = React.useState<string>('');

  React.useEffect(() => {
    if (markdownFile) {
      markdownFile.text().then(setContent);
    }
  }, [markdownFile]);

  return (
    <Card className="overflow-hidden" style={{ height: 'min(75vh, 900px)' }}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-4 h-full overflow-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}