import React, { Suspense } from 'react';
import { WidgetProps, getWidgetComponent } from './registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWidgetContext } from './WidgetContext';

interface WidgetHostProps {
  widget: {
    id: string;
    type: string;
    title?: string;
    bindings?: Record<string, string>;
    options?: Record<string, any>;
  };
}

function WidgetFallback({ title }: { title?: string }) {
  return (
    <Card className="h-48 flex items-center justify-center">
      <CardContent>
        <div className="text-center text-muted-foreground">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Loading {title || 'widget'}...</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetError({ error, title }: { error: string; title?: string }) {
  return (
    <Card className="h-48 flex items-center justify-center">
      <CardContent>
        <div className="text-center text-destructive">
          <p className="font-medium">Failed to load {title || 'widget'}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WidgetHost({ widget }: WidgetHostProps) {
  const context = useWidgetContext();
  const WidgetComponent = getWidgetComponent(widget.type);

  // Debug context
  console.log('WidgetHost context:', { 
    hasGetInput: !!context.getInput, 
    contextKeys: Object.keys(context),
    widgetType: widget.type 
  });

  if (!WidgetComponent) {
    return <WidgetError error={`Unknown widget type: ${widget.type}`} title={widget.title} />;
  }

  const widgetProps: WidgetProps = {
    id: widget.id,
    title: widget.title,
    bindings: widget.bindings || {},
    options: widget.options || {},
    ctx: context,
  };

  return (
    <Suspense fallback={<WidgetFallback title={widget.title} />}>
      <div className="widget-host" data-widget-id={widget.id} data-widget-type={widget.type}>
        <WidgetComponent {...widgetProps} />
      </div>
    </Suspense>
  );
}