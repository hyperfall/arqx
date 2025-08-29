import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProps } from '../registry';

export default function VideoViewerWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const fileBinding = bindings?.file || '@video';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  if (!file || !file.type.startsWith('video/')) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              🎥
            </div>
            <p className="font-medium">No video file selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const videoUrl = URL.createObjectURL(file);

  return (
    <Card className="viewerRoot overflow-hidden" style={{ height: 'min(75vh, 600px)' }}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-4 h-full">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain bg-black rounded"
          style={{ maxHeight: 'calc(100% - 2rem)' }}
        >
          Your browser does not support the video tag.
        </video>
      </CardContent>
    </Card>
  );
}