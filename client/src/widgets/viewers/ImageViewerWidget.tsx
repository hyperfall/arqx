import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WidgetProps } from '../registry';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export default function ImageViewerWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const fileBinding = bindings?.file || '@image';
  const file = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;

  if (!file || !file.type.startsWith('image/')) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              🖼️
            </div>
            <p className="font-medium">No image file selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const imageUrl = URL.createObjectURL(file);

  return (
    <Card className="viewerRoot overflow-hidden" style={{ height: 'min(75vh, 600px)' }}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0 h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.max(0.25, z / 1.2))}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.min(5, z * 1.2))}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(1)}
              title="Fit to View"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRotation(r => (r + 90) % 360)}
              title="Rotate"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Viewer */}
        <div className="flex-1 overflow-auto viewerScroll bg-muted/10">
          <div className="p-4 flex justify-center items-center min-h-full">
            <img
              ref={imgRef}
              src={imageUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
              onLoad={() => {
                // Auto-fit on load
                const img = imgRef.current;
                if (img) {
                  const container = img.parentElement;
                  if (container) {
                    const scaleX = container.clientWidth / img.naturalWidth;
                    const scaleY = container.clientHeight / img.naturalHeight;
                    setZoom(Math.min(1, Math.min(scaleX, scaleY) * 0.9));
                  }
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}