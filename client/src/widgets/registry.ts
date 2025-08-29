import React from 'react';

// Widget context interface - provides access to inputs, state, and events
export interface WidgetContext {
  // Input access
  getInput(id: string): File | Blob | undefined;
  onInputChange(id: string, cb: (file?: File) => void): () => void;
  
  // State management
  getState<T = any>(key: string, fallback: T): T;
  setState(key: string, value: any): void;
  
  // Event system
  emit(event: string, payload?: any): void;
  on(event: string, cb: (payload: any) => void): () => void;
}

// Base widget props interface
export interface WidgetProps {
  id: string;
  title?: string;
  bindings?: Record<string, string>; // e.g., {file: "@pdf"}
  options?: Record<string, any>;
  ctx: WidgetContext;
}

// Widget component type
export type WidgetComponent = React.FC<WidgetProps>;

// Import widget components (lazy loaded)
const PdfViewerWidget = React.lazy(() => import('./pdf/PdfViewerWidget'));
const ImageViewerWidget = React.lazy(() => import('./viewers/ImageViewerWidget'));
const VideoPlayerWidget = React.lazy(() => import('./viewers/VideoViewerWidget')); // Use existing VideoViewerWidget
const AudioPlayerWidget = React.lazy(() => import('./viewers/AudioViewerWidget')); // Use existing AudioViewerWidget
const FileDetailsWidget = React.lazy(() => import('./panels/FileDetailsWidget'));
const OutputFilesWidget = React.lazy(() => import('./panels/OutputFilesWidget'));
const CsvTableWidget = React.lazy(() => import('./tables/CsvTableWidget'));
const MarkdownPreviewWidget = React.lazy(() => import('./viewers/TextViewerWidget')); // Use existing TextViewerWidget for markdown

// Main widget registry
export const WidgetRegistry: Record<string, WidgetComponent> = {
  'viewer.pdf': PdfViewerWidget,
  'viewer.image': ImageViewerWidget,
  'viewer.video': VideoPlayerWidget,
  'viewer.audio': AudioPlayerWidget,
  'panel.fileDetails': FileDetailsWidget,
  'panel.outputFiles': OutputFilesWidget,
  'table.csv': CsvTableWidget,
  'markdown.preview': MarkdownPreviewWidget
};

// Get widget component by type
export function getWidgetComponent(type: string): WidgetComponent | undefined {
  return WidgetRegistry[type];
}

// Get all available widget types
export function getAvailableWidgetTypes(): string[] {
  return Object.keys(WidgetRegistry);
}

// Widget type metadata for LLM planning
export interface WidgetTypeMetadata {
  id: string;
  name: string;
  description: string;
  accepts?: string[]; // MIME types or data types it works with
  bindings: Record<string, string>; // Expected binding format
  options: Record<string, any>; // Available options with defaults
  examples: string[]; // Usage examples
}

// Widget metadata registry for LLM prompts
export const WidgetMetadata: Record<string, WidgetTypeMetadata> = {
  'viewer.pdf': {
    id: 'viewer.pdf',
    name: 'PDF Viewer',
    description: 'Interactive PDF viewer with zoom, navigation, thumbnails, and search',
    accepts: ['application/pdf'],
    bindings: { file: '@inputId' },
    options: {
      showSidebar: true,
      showThumbnails: true,
      showSearch: true,
      continuous: false
    },
    examples: [
      'View PDF documents with navigation',
      'PDF preview with thumbnails',
      'Searchable PDF viewer'
    ]
  },
  
  'viewer.image': {
    id: 'viewer.image',
    name: 'Image Viewer',
    description: 'Image viewer with zoom, pan, and metadata display',
    accepts: ['image/*'],
    bindings: { file: '@inputId' },
    options: {
      showZoom: true,
      showMetadata: true,
      fitMode: 'contain'
    },
    examples: [
      'View and zoom images',
      'Image preview with metadata',
      'Photo viewer'
    ]
  },
  
  'viewer.video': {
    id: 'viewer.video',
    name: 'Video Player',
    description: 'HTML5 video player with controls',
    accepts: ['video/*'],
    bindings: { file: '@inputId' },
    options: {
      controls: true,
      autoplay: false,
      loop: false
    },
    examples: [
      'Play video files',
      'Video preview player'
    ]
  },
  
  'viewer.audio': {
    id: 'viewer.audio',
    name: 'Audio Player',
    description: 'HTML5 audio player with controls and waveform',
    accepts: ['audio/*'],
    bindings: { file: '@inputId' },
    options: {
      controls: true,
      showWaveform: false
    },
    examples: [
      'Play audio files',
      'Audio preview player'
    ]
  },
  
  'panel.fileDetails': {
    id: 'panel.fileDetails',
    name: 'File Details Panel',
    description: 'Display file metadata, size, type, and properties',
    accepts: ['*/*'],
    bindings: { file: '@inputId' },
    options: {
      showMetadata: true,
      showPreview: true
    },
    examples: [
      'Show file information',
      'File properties panel'
    ]
  },
  
  'panel.outputFiles': {
    id: 'panel.outputFiles',
    name: 'Output Files Panel',
    description: 'Display and manage processed output files',
    accepts: ['*/*'],
    bindings: { files: '@output' },
    options: {
      allowDownload: true,
      showPreview: true
    },
    examples: [
      'Show processing results',
      'Download processed files'
    ]
  },
  
  'table.csv': {
    id: 'table.csv',
    name: 'CSV Table Viewer',
    description: 'Virtualized table for viewing CSV data with search and sorting',
    accepts: ['text/csv', 'application/csv'],
    bindings: { file: '@inputId' },
    options: {
      virtualizeRows: true,
      pageSize: 100,
      searchable: true,
      sortable: true
    },
    examples: [
      'View CSV data in table',
      'Browse spreadsheet data',
      'Searchable data table'
    ]
  },
  
  'markdown.preview': {
    id: 'markdown.preview',
    name: 'Markdown Preview',
    description: 'Render markdown files with syntax highlighting',
    accepts: ['text/markdown', 'text/x-markdown'],
    bindings: { file: '@inputId' },
    options: {
      syntaxHighlight: true,
      mathSupport: false
    },
    examples: [
      'Preview markdown files',
      'Render README files'
    ]
  }
};

// Get widget metadata for LLM prompts
export function getWidgetMetadata(type: string): WidgetTypeMetadata | undefined {
  return WidgetMetadata[type];
}

// Get all widget metadata for LLM planning
export function getAllWidgetMetadata(): WidgetTypeMetadata[] {
  return Object.values(WidgetMetadata);
}

// Find suitable widgets for given MIME types
export function findSuitableWidgets(mimeTypes: string[]): WidgetTypeMetadata[] {
  return Object.values(WidgetMetadata).filter(widget => {
    if (!widget.accepts) return false;
    
    return mimeTypes.some(mime =>
      widget.accepts!.some(accept =>
        accept === mime ||
        accept === mime.split('/')[0] + '/*' ||
        accept === '*/*'
      )
    );
  });
}