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
    regex: /\b(pdf|document|read|view|preview)\b.*\b(pdf|document)\b/i,
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
    regex: /\b(image|photo|picture|jpg|png|gif|jpeg)\b.*\b(view|preview|show|display)\b/i,
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
    regex: /\b(video|movie|mp4|avi|mov)\b.*\b(view|play|preview|watch)\b/i,
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
    regex: /\b(csv|table|spreadsheet|data)\b.*\b(view|preview|show|display)\b/i,
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
    regex: /\b(json|data|api)\b.*\b(view|preview|show|display|explore)\b/i,
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

const fallbackSpec: Omit<ToolSpec, 'id'> = {
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
};

export function generateToolFromText(input: string): ToolSpec {
  // Check viewer templates first (for live preview tools)
  for (const template of viewerTemplates) {
    if (template.regex.test(input)) {
      return {
        id: generateToolId(input + template.spec.name),
        ...template.spec,
      };
    }
  }

  // Find matching processing template
  for (const template of toolTemplates) {
    if (template.regex.test(input)) {
      return {
        id: generateToolId(input + template.spec.name),
        ...template.spec,
      };
    }
  }

  // Return fallback if no match
  return {
    id: generateToolId(input + fallbackSpec.name),
    ...fallbackSpec,
  };
}

function generateToolId(input?: string): string {
  if (input) {
    // Generate consistent ID based on input text for better deduplication
    const hash = input.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    return `tool_${hash.slice(0, 12)}_${Math.abs(hashCode(input)).toString(36)}`;
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
