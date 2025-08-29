// Widget UI types for FastLane ToolSpec
export type FastLaneWidgetSpec = {
  id: string;
  type: string;
  title?: string;
  bindings?: Record<string, string>;
  options?: Record<string, any>;
};

export type FastLaneUISpec = {
  mode?: "live" | "run";
  layout?: {
    main: string[];
    inspector?: string[];
  };
  widgets?: FastLaneWidgetSpec[];
};

export interface ToolSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  settings: {
    [key: string]: {
      type: 'slider' | 'checkbox' | 'select' | 'input';
      label: string;
      default: any;
      options?: string[];
      min?: number;
      max?: number;
    };
  };
  inputs: {
    accept: string[];
    maxSize: number;
    multiple: boolean;
  };
  ui?: FastLaneUISpec; // v1.1 extension
}

// Viewer tool templates for live preview mode
const viewerTemplates: { regex: RegExp; spec: Omit<ToolSpec, 'id'> }[] = [
  {
    regex: /\b(pdf|document|doc|read|view|preview|open)\b/i,
    spec: {
      name: 'PDF Viewer',
      description: 'View and navigate PDF documents with zoom, thumbnails, and search',
      category: 'Viewer',
      icon: 'file-text',
      settings: {},
      inputs: {
        accept: ['application/pdf', '.pdf'],
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: false,
      },
      ui: {
        mode: 'live',
        layout: {
          main: ['pdfViewer'],
          inspector: ['fileDetails'],
        },
        widgets: [
          {
            id: 'pdfViewer',
            type: 'viewer.pdf',
            title: 'PDF Viewer',
            bindings: { file: '@pdf' },
            options: { showSidebar: true, showThumbnails: true, showSearch: true },
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@file' },
          },
        ],
      },
    },
  },
  {
    regex: /\b(image|photo|picture|jpg|png|gif|jpeg|pic|img|view|preview|show|display)\b/i,
    spec: {
      name: 'Image Viewer',
      description: 'View and zoom images with detailed information',
      category: 'Viewer',
      icon: 'image',
      settings: {},
      inputs: {
        accept: ['image/*'],
        maxSize: 20 * 1024 * 1024, // 20MB
        multiple: false,
      },
      ui: {
        mode: 'live',
        layout: {
          main: ['imageViewer'],
          inspector: ['fileDetails'],
        },
        widgets: [
          {
            id: 'imageViewer',
            type: 'viewer.image',
            title: 'Image Viewer',
            bindings: { file: '@image' },
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@file' },
          },
        ],
      },
    },
  },
  {
    regex: /\b(video|movie|mp4|avi|mov|film|play|watch)\b/i,
    spec: {
      name: 'Video Player',
      description: 'Play and preview video files',
      category: 'Viewer',
      icon: 'video',
      settings: {},
      inputs: {
        accept: ['video/*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: false,
      },
      ui: {
        mode: 'live',
        layout: {
          main: ['videoViewer'],
          inspector: ['fileDetails'],
        },
        widgets: [
          {
            id: 'videoViewer',
            type: 'viewer.video',
            title: 'Video Player',
            bindings: { file: '@video' },
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@file' },
          },
        ],
      },
    },
  },
  {
    regex: /\b(csv|table|spreadsheet|data|sheet|excel)\b/i,
    spec: {
      name: 'CSV Table Viewer',
      description: 'View and explore CSV data in table format',
      category: 'Viewer',
      icon: 'table',
      settings: {},
      inputs: {
        accept: ['text/csv', '.csv'],
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
      },
      ui: {
        mode: 'live',
        layout: {
          main: ['csvTable'],
          inspector: ['fileDetails'],
        },
        widgets: [
          {
            id: 'csvTable',
            type: 'table.csv',
            title: 'CSV Data',
            bindings: { file: '@csv' },
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@file' },
          },
        ],
      },
    },
  },
  {
    regex: /\b(json|api|data structure|object)\b/i,
    spec: {
      name: 'JSON Viewer',
      description: 'View and explore JSON data structures',
      category: 'Viewer',
      icon: 'code',
      settings: {},
      inputs: {
        accept: ['application/json', '.json'],
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
      },
      ui: {
        mode: 'live',
        layout: {
          main: ['jsonTable'],
          inspector: ['fileDetails'],
        },
        widgets: [
          {
            id: 'jsonTable',
            type: 'table.json',
            title: 'JSON Data',
            bindings: { file: '@json' },
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@file' },
          },
        ],
      },
    },
  },
];

const toolTemplates: { regex: RegExp; spec: Omit<ToolSpec, 'id'> }[] = [
  // Image conversion patterns
  {
    regex: /\b(convert|change|transform).*\b(png|jpg|jpeg|gif|webp|bmp|tiff|image)\b/i,
    spec: {
      name: 'Image Converter',
      description: 'Convert images between different formats with quality settings',
      category: 'Images',
      icon: 'image',
      settings: {
        format: {
          type: 'select',
          label: 'Output Format',
          default: 'jpeg',
          options: ['jpeg', 'png', 'webp', 'gif'],
        },
        quality: {
          type: 'slider',
          label: 'Quality',
          default: 85,
          min: 1,
          max: 100,
        },
        stripExif: {
          type: 'checkbox',
          label: 'Strip EXIF Data',
          default: true,
        },
      },
      inputs: {
        accept: ['image/*'],
        maxSize: 20 * 1024 * 1024, // 20MB
        multiple: true,
      },
    },
  },
  {
    regex: /convert\s+png\s+to\s+jpe?g/i,
    spec: {
      name: 'PNG to JPEG Converter',
      description: 'Convert PNG images to JPEG format with customizable quality settings',
      category: 'Images',
      icon: 'image',
      settings: {
        quality: {
          type: 'slider',
          label: 'JPEG Quality',
          default: 85,
          min: 1,
          max: 100,
        },
        stripExif: {
          type: 'checkbox',
          label: 'Strip EXIF Data',
          default: true,
        },
        resize: {
          type: 'checkbox',
          label: 'Resize Images',
          default: false,
        },
        width: {
          type: 'input',
          label: 'Width',
          default: 1920,
        },
        height: {
          type: 'input',
          label: 'Height',
          default: 1080,
        },
      },
      inputs: {
        accept: ['image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
      },
    },
  },
  // Video/Audio conversion patterns
  {
    regex: /\b(convert|extract|change).*\b(video|audio|mp4|mp3|wav|avi|mov)\b/i,
    spec: {
      name: 'Media Converter',
      description: 'Convert video and audio files between formats',
      category: 'Media',
      icon: 'film',
      settings: {
        format: {
          type: 'select',
          label: 'Output Format',
          default: 'mp3',
          options: ['mp3', 'wav', 'mp4', 'avi'],
        },
        quality: {
          type: 'select',
          label: 'Quality',
          default: 'high',
          options: ['low', 'medium', 'high'],
        },
      },
      inputs: {
        accept: ['video/*', 'audio/*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: true,
      },
    },
  },
  {
    regex: /convert\s+mp4\s+to\s+mp3/i,
    spec: {
      name: 'MP4 to MP3 Converter',
      description: 'Extract audio from MP4 videos and convert to MP3',
      category: 'Audio',
      icon: 'music',
      settings: {
        bitrate: {
          type: 'select',
          label: 'Audio Bitrate',
          default: '192',
          options: ['128', '192', '256', '320'],
        },
        normalize: {
          type: 'checkbox',
          label: 'Normalize Audio',
          default: false,
        },
      },
      inputs: {
        accept: ['video/mp4'],
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: true,
      },
    },
  },
  // PDF manipulation patterns  
  {
    regex: /\b(merge|combine|join|concat).*\b(pdf|document)\b/i,
    spec: {
      name: 'PDF Merger',
      description: 'Combine multiple PDF files into a single document',
      category: 'Documents',
      icon: 'file-text',
      settings: {
        bookmarks: {
          type: 'checkbox',
          label: 'Preserve Bookmarks',
          default: true,
        },
        metadata: {
          type: 'checkbox',
          label: 'Preserve Metadata',
          default: true,
        },
      },
      inputs: {
        accept: ['application/pdf', '.pdf'],
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: true,
      },
    },
  },
  {
    regex: /merge\s+pdf/i,
    spec: {
      name: 'PDF Merger',
      description: 'Combine multiple PDF files into a single document',
      category: 'PDF',
      icon: 'file-text',
      settings: {
        bookmarks: {
          type: 'checkbox',
          label: 'Add Bookmarks',
          default: true,
        },
        optimize: {
          type: 'checkbox',
          label: 'Optimize File Size',
          default: false,
        },
      },
      inputs: {
        accept: ['application/pdf'],
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: true,
      },
    },
  },
  {
    regex: /extract\s+(gif\s+)?frames/i,
    spec: {
      name: 'Video Frame Extractor',
      description: 'Extract individual frames from videos or GIF animations',
      category: 'Video',
      icon: 'film',
      settings: {
        interval: {
          type: 'slider',
          label: 'Extract Every N Frames',
          default: 1,
          min: 1,
          max: 30,
        },
        format: {
          type: 'select',
          label: 'Output Format',
          default: 'png',
          options: ['png', 'jpg', 'webp'],
        },
        maxWidth: {
          type: 'input',
          label: 'Max Width',
          default: 1920,
        },
      },
      inputs: {
        accept: ['image/gif', 'video/mp4', 'video/webm'],
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: false,
      },
    },
  },
  {
    regex: /(csv\s+to\s+json|json\s+to\s+csv)/i,
    spec: {
      name: 'CSV ↔ JSON Converter',
      description: 'Convert between CSV and JSON formats',
      category: 'Data',
      icon: 'database',
      settings: {
        delimiter: {
          type: 'select',
          label: 'CSV Delimiter',
          default: ',',
          options: [',', ';', '\t', '|'],
        },
        headers: {
          type: 'checkbox',
          label: 'First Row as Headers',
          default: true,
        },
        prettify: {
          type: 'checkbox',
          label: 'Pretty Print JSON',
          default: true,
        },
      },
      inputs: {
        accept: ['text/csv', 'application/json', '.csv', '.json'],
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
      },
    },
  },
  // Text processing patterns
  {
    regex: /\b(format|process|clean|transform).*\b(text|string|content)\b/i,
    spec: {
      name: 'Text Processor',
      description: 'Process and format text with various transformations',
      category: 'Text',
      icon: 'type',
      settings: {
        operation: {
          type: 'select',
          label: 'Operation',
          default: 'format',
          options: ['uppercase', 'lowercase', 'capitalize', 'trim', 'remove-duplicates', 'word-count'],
        },
        encoding: {
          type: 'select',
          label: 'Encoding',
          default: 'utf-8',
          options: ['utf-8', 'ascii', 'latin1'],
        },
      },
      inputs: {
        accept: ['text/plain', '.txt'],
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true,
      },
    },
  },
  // File compression patterns
  {
    regex: /\b(compress|zip|archive|package)\b/i,
    spec: {
      name: 'File Compressor',
      description: 'Compress files and folders into archives',
      category: 'Files',
      icon: 'database',
      settings: {
        format: {
          type: 'select',
          label: 'Archive Format',
          default: 'zip',
          options: ['zip', 'tar', 'gzip'],
        },
        level: {
          type: 'slider',
          label: 'Compression Level',
          default: 6,
          min: 1,
          max: 9,
        },
      },
      inputs: {
        accept: ['*/*'],
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: true,
      },
    },
  },
  // Data manipulation patterns
  {
    regex: /\b(parse|analyze|extract|convert).*\b(csv|json|xml|data)\b/i,
    spec: {
      name: 'Data Converter',
      description: 'Convert and transform data between different formats',
      category: 'Data',
      icon: 'database',
      settings: {
        outputFormat: {
          type: 'select',
          label: 'Output Format',
          default: 'json',
          options: ['json', 'csv', 'xml', 'yaml'],
        },
        encoding: {
          type: 'select',
          label: 'Text Encoding',
          default: 'utf-8',
          options: ['utf-8', 'ascii', 'latin1'],
        },
      },
      inputs: {
        accept: ['text/csv', 'application/json', 'text/xml', '.csv', '.json', '.xml'],
        maxSize: 25 * 1024 * 1024, // 25MB
        multiple: true,
      },
    },
  },
  // Image processing patterns
  {
    regex: /\b(resize|crop|optimize|enhance).*\b(image|photo|picture)\b/i,
    spec: {
      name: 'Image Editor',
      description: 'Edit and enhance images with various tools',
      category: 'Images',
      icon: 'image',
      settings: {
        operation: {
          type: 'select',
          label: 'Operation',
          default: 'resize',
          options: ['resize', 'crop', 'optimize', 'enhance', 'filter'],
        },
        quality: {
          type: 'slider',
          label: 'Quality',
          default: 85,
          min: 1,
          max: 100,
        },
        width: {
          type: 'input',
          label: 'Width (px)',
          default: 800,
        },
        height: {
          type: 'input',
          label: 'Height (px)',
          default: 600,
        },
      },
      inputs: {
        accept: ['image/*'],
        maxSize: 20 * 1024 * 1024, // 20MB
        multiple: true,
      },
    },
  },
  {
    regex: /strip\s+(exif|metadata)/i,
    spec: {
      name: 'EXIF Data Stripper',
      description: 'Remove metadata and EXIF data from images for privacy',
      category: 'Images',
      icon: 'database',
      settings: {
        preserveOrientation: {
          type: 'checkbox',
          label: 'Preserve Image Orientation',
          default: true,
        },
        stripAll: {
          type: 'checkbox',
          label: 'Strip All Metadata',
          default: true,
        },
        compressionLevel: {
          type: 'slider',
          label: 'Compression Level',
          default: 85,
          min: 1,
          max: 100,
        },
      },
      inputs: {
        accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'],
        maxSize: 20 * 1024 * 1024, // 20MB
        multiple: true,
      },
    },
  },
];

// Create multiple fallback options to provide variety
const fallbackSpecs: Array<Omit<ToolSpec, 'id'>> = [
  {
    name: 'Text Formatter',
    description: 'Format and process text files with various options',
    category: 'Text',
    icon: 'type',
    settings: {
      operation: {
        type: 'select',
        label: 'Operation',
        default: 'lowercase',
        options: ['lowercase', 'uppercase', 'capitalize', 'trim', 'remove-duplicates'],
      },
      encoding: {
        type: 'select',
        label: 'Text Encoding',
        default: 'utf-8',
        options: ['utf-8', 'ascii', 'latin1'],
      },
    },
    inputs: {
      accept: ['text/plain', '.txt'],
      maxSize: 5 * 1024 * 1024, // 5MB
      multiple: true,
    },
  },
  {
    name: 'File Processor',
    description: 'Process and analyze various file types',
    category: 'Files',
    icon: 'database',
    settings: {
      analysis: {
        type: 'select',
        label: 'Analysis Type',
        default: 'metadata',
        options: ['metadata', 'content', 'structure', 'summary'],
      },
      format: {
        type: 'select',
        label: 'Output Format',
        default: 'json',
        options: ['json', 'text', 'csv'],
      },
    },
    inputs: {
      accept: ['*/*'],
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: true,
    },
  },
  {
    name: 'Data Analyzer',
    description: 'Analyze and extract insights from data files',
    category: 'Data',
    icon: 'maximize',
    settings: {
      operation: {
        type: 'select',
        label: 'Operation',
        default: 'summary',
        options: ['summary', 'statistics', 'validation', 'transformation'],
      },
      detailed: {
        type: 'checkbox',
        label: 'Detailed Analysis',
        default: true,
      },
    },
    inputs: {
      accept: ['text/csv', 'application/json', '.csv', '.json', '.txt'],
      maxSize: 15 * 1024 * 1024, // 15MB
      multiple: true,
    },
  },
];

export function generateToolFromText(input: string): ToolSpec {
  console.log('🔧 Tool Generation Debug:', { input });
  
  // Check viewer templates first (for live preview tools)
  for (const template of viewerTemplates) {
    if (template.regex.test(input)) {
      const toolSpec = {
        id: generateToolId(input + template.spec.name),
        ...template.spec,
      };
      console.log('✅ Matched viewer template:', { 
        templateName: template.spec.name, 
        regex: template.regex.toString(), 
        generatedId: toolSpec.id 
      });
      return toolSpec;
    }
  }

  // Find matching processing template
  for (const template of toolTemplates) {
    if (template.regex.test(input)) {
      const toolSpec = {
        id: generateToolId(input + template.spec.name),
        ...template.spec,
      };
      console.log('✅ Matched tool template:', { 
        templateName: template.spec.name, 
        regex: template.regex.toString(), 
        generatedId: toolSpec.id 
      });
      return toolSpec;
    }
  }

  // Select a fallback based on input characteristics for better variety
  const fallbackSpec = selectFallbackSpec(input);
  const toolSpec = {
    id: generateToolId(input + fallbackSpec.name),
    ...fallbackSpec,
  };
  console.log('⚠️ Using fallback:', { 
    fallbackName: fallbackSpec.name, 
    input, 
    generatedId: toolSpec.id 
  });
  return toolSpec;
}

function selectFallbackSpec(input: string): Omit<ToolSpec, 'id'> {
  const lowerInput = input.toLowerCase();
  
  // Simple heuristics to choose appropriate fallback
  if (lowerInput.includes('data') || lowerInput.includes('analyze') || lowerInput.includes('csv') || lowerInput.includes('json')) {
    return fallbackSpecs[2]; // Data Analyzer
  }
  
  if (lowerInput.includes('file') || lowerInput.includes('process') || lowerInput.includes('analyze')) {
    return fallbackSpecs[1]; // File Processor
  }
  
  // Default to text formatter
  return fallbackSpecs[0]; // Text Formatter
}

function generateToolId(input?: string): string {
  if (input) {
    // Generate more unique ID to avoid collisions
    const cleanInput = input.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const hash = Math.abs(hashCode(input)).toString(36);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    
    const toolId = `tool_${cleanInput.slice(0, 8)}_${hash}_${timestamp}_${random}`;
    console.log('🆔 Generated ID:', { input, toolId, cleanInput: cleanInput.slice(0, 8), hash });
    return toolId;
  }
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
