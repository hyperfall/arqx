import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function AudioViewerWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const fileBinding = bindings?.file || '@audio';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  if (!file || !file.type.startsWith('audio/')) {
    return (
      <Card className="h-48 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              🎵
            </div>
            <p className="font-medium">No audio file selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const audioUrl = URL.createObjectURL(file);

  return (
    <Card>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              🎵
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{file.type}</p>
            </div>
          </div>
          
          <audio
            src={audioUrl}
            controls
            className="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      </CardContent>
    </Card>
  );
}