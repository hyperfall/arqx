import React, { Suspense, useState, useEffect } from 'react';
import { WidgetProps, getWidgetComponent } from './registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WidgetHostProps {
  widget: {
    id: string;
    type: string;
    title?: string;
    bindings?: Record<string, string>;
    options?: Record<string, any>;
  };
  inputMapping: Record<string, File | undefined>;
  sessionState: Record<string, any>;
  onStateChange: (key: string, value: any) => void;
  onEvent: (event: string, payload?: any) => void;
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

export default function WidgetHost({ 
  widget, 
  inputMapping, 
  sessionState, 
  onStateChange, 
  onEvent 
}: WidgetHostProps) {
  const [eventListeners] = useState<Record<string, ((payload: any) => void)[]>>(() => ({}));
  const WidgetComponent = getWidgetComponent(widget.type);

  if (!WidgetComponent) {
    return <WidgetError error={`Unknown widget type: ${widget.type}`} title={widget.title} />;
  }

  // Create widget context
  const widgetContext = {
    getInput: (id: string): File | undefined => {
      // Resolve bindings (@inputId -> actual input)
      const resolvedId = id.startsWith('@') ? id.slice(1) : id;
      return inputMapping[resolvedId];
    },
    
    onInputChange: (id: string, cb: (file?: File) => void) => {
      // Set up input change subscription - simplified for now
      const resolvedId = id.startsWith('@') ? id.slice(1) : id;
      cb(inputMapping[resolvedId]);
      return () => {}; // unsubscribe function
    },
    
    getState: <T = any>(key: string, fallback: T): T => {
      return sessionState[key] !== undefined ? sessionState[key] : fallback;
    },
    
    setState: (key: string, value: any) => {
      onStateChange(key, value);
    },
    
    emit: (event: string, payload?: any) => {
      onEvent(event, payload);
      const listeners = eventListeners[event] || [];
      listeners.forEach(listener => listener(payload));
    },
    
    on: (event: string, cb: (payload: any) => void) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(cb);

      return () => {
        const listeners = eventListeners[event];
        if (listeners) {
          const index = listeners.indexOf(cb);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      };
    }
  };

  const widgetProps: WidgetProps = {
    id: widget.id,
    title: widget.title,
    bindings: widget.bindings || {},
    options: widget.options || {},
    ctx: widgetContext,
  };

  return (
    <Suspense fallback={<WidgetFallback title={widget.title} />}>
      <div className="widget-host" data-widget-id={widget.id} data-widget-type={widget.type}>
        <WidgetComponent {...widgetProps} />
      </div>
    </Suspense>
  );
}