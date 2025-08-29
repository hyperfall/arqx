import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function FileDetailsWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const fileBinding = bindings?.file || '@file';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title || 'File Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No file selected</p>
        </CardContent>
      </Card>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title || 'File Details'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Name:</span>
          <p className="text-muted-foreground break-all">{file.name}</p>
        </div>
        <div>
          <span className="font-medium">Type:</span>
          <p className="text-muted-foreground">{file.type || 'Unknown'}</p>
        </div>
        <div>
          <span className="font-medium">Size:</span>
          <p className="text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <div>
          <span className="font-medium">Last Modified:</span>
          <p className="text-muted-foreground">
            {new Date(file.lastModified).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}