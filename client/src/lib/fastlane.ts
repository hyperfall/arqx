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
}

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
  // Find matching template
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
