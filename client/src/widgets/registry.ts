import React from 'react';

// Widget context for sharing state and communication between widgets
export type WidgetContext = {
  // read current inputs and subscribe to changes
  getInput: (id: string) => File | Blob | undefined;
  onInputChange: (id: string, cb: (file?: File) => void) => () => void;
  // write transient UI state (page, zoom), persisted in tool session
  getState: <T = any>(key: string, fallback: T) => T;
  setState: (key: string, value: any) => void;
  // fire UI events (for bindings/signals)
  emit: (event: string, payload?: any) => void;
  on: (event: string, cb: (payload: any) => void) => () => void;
};

// Widget component props
export type WidgetProps = {
  id: string;
  title?: string;
  bindings?: Record<string, string>;
  options?: Record<string, any>;
  ctx: WidgetContext;
};

export type WidgetComponent = React.FC<WidgetProps>;

// Widget imports (lazy loaded)
const PdfViewerWidget = React.lazy(() => import('./pdf/PdfViewerWidget'));
const FileDetailsWidget = React.lazy(() => import('./panels/FileDetailsWidget'));
const OutputFilesWidget = React.lazy(() => import('./panels/OutputFilesWidget'));
const ImageViewerWidget = React.lazy(() => import('./viewers/ImageViewerWidget'));
const VideoViewerWidget = React.lazy(() => import('./viewers/VideoViewerWidget'));
const AudioViewerWidget = React.lazy(() => import('./viewers/AudioViewerWidget'));
const TextViewerWidget = React.lazy(() => import('./viewers/TextViewerWidget'));
const CsvTableWidget = React.lazy(() => import('./tables/CsvTableWidget'));
const JsonTableWidget = React.lazy(() => import('./tables/JsonTableWidget'));

// Widget Registry - maps widget type to React component  
export const WidgetRegistry: Record<string, WidgetComponent> = {
  "viewer.pdf": PdfViewerWidget,
  "viewer.image": ImageViewerWidget,
  "viewer.video": VideoViewerWidget,
  "viewer.audio": AudioViewerWidget,
  "viewer.text": TextViewerWidget,
  "table.csv": CsvTableWidget,
  "table.json": JsonTableWidget,
  "panel.fileDetails": FileDetailsWidget,
  "panel.outputFiles": OutputFilesWidget,
};

// Helper to check if a widget type is registered
export function isWidgetRegistered(type: string): boolean {
  return type in WidgetRegistry;
}

// Helper to get widget component by type
export function getWidgetComponent(type: string): WidgetComponent | null {
  return WidgetRegistry[type] || null;
}