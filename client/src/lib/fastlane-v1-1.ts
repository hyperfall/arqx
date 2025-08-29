import { ToolSpecV1_1 } from '../spec/schema';

// Enhanced fast-lane templates for ToolSpec v1.1 with live mode support
const FASTLANE_TEMPLATES: Array<{ regex: RegExp; generator: (match: RegExpMatchArray) => ToolSpecV1_1 }> = [
  // PDF Viewer - Live Mode
  {
    regex: /\b(pdf|document|view\s+pdf|pdf\s+viewer|preview\s+pdf|read\s+pdf|open\s+pdf)\b/i,
    generator: () => ({
      version: '1',
      name: 'PDF Viewer',
      summary: 'Interactive PDF viewer with zoom, thumbnails, search, and navigation',
      inputs: [{
        id: 'pdf',
        label: 'PDF Document',
        type: 'file',
        accept: ['application/pdf'],
        maxMB: 100
      }],
      pipeline: [],
      output: { type: 'none' },
      ui: {
        mode: 'live',
        layout: {
          main: ['pdfViewer'],
          inspector: ['fileDetails']
        },
        widgets: [
          {
            id: 'pdfViewer',
            type: 'viewer.pdf',
            title: 'PDF Preview',
            bindings: { file: '@pdf' },
            options: {
              showSidebar: true,
              showThumbnails: true,
              showSearch: true,
              continuous: false
            }
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@pdf' }
          }
        ]
      }
    })
  },

  // Image Viewer - Live Mode
  {
    regex: /\b(image|photo|picture|view\s+image|image\s+viewer|preview\s+image|show\s+image)\b/i,
    generator: () => ({
      version: '1',
      name: 'Image Viewer',
      summary: 'Interactive image viewer with zoom, rotation, and metadata',
      inputs: [{
        id: 'image',
        label: 'Image File',
        type: 'file',
        accept: ['image/*'],
        maxMB: 50
      }],
      pipeline: [],
      output: { type: 'none' },
      ui: {
        mode: 'live',
        layout: {
          main: ['imageViewer'],
          inspector: ['fileDetails']
        },
        widgets: [
          {
            id: 'imageViewer',
            type: 'viewer.image',
            title: 'Image Preview',
            bindings: { file: '@image' },
            options: {
              showZoom: true,
              showMetadata: true,
              fitMode: 'contain'
            }
          },
          {
            id: 'fileDetails',
            type: 'panel.fileDetails',
            title: 'File Details',
            bindings: { file: '@image' }
          }
        ]
      }
    })
  },

  // PNG to JPG conversion - Run Mode
  {
    regex: /\b(png\s+to\s+jpg|png\s+to\s+jpeg|convert\s+png\s+jpg|convert\s+png\s+jpeg)\b/i,
    generator: (match) => {
      // Extract quality if mentioned
      const qualityMatch = match.input?.match(/quality\s+(\d+)/i);
      const quality = qualityMatch ? parseInt(qualityMatch[1]) / 100 : 0.9;

      return {
        version: '1',
        name: 'PNG to JPG Converter',
        summary: 'Convert PNG images to JPG format with quality control',
        inputs: [
          {
            id: 'images',
            label: 'PNG Images',
            type: 'file[]',
            accept: ['image/png'],
            maxMB: 50
          },
          {
            id: 'quality',
            label: 'Quality',
            type: 'number',
            min: 0.1,
            max: 1.0,
            step: 0.1,
            default: quality
          },
          {
            id: 'stripExif',
            label: 'Strip Metadata',
            type: 'boolean',
            default: false
          }
        ],
        pipeline: [
          {
            op: 'image.to_jpeg',
            args: {
              quality: '@quality',
              stripExif: '@stripExif'
            }
          }
        ],
        output: {
          type: 'file[]',
          naming: '{name}.jpg'
        }
      };
    }
  },

  // MP4 to MP3 conversion - Run Mode  
  {
    regex: /\b(mp4\s+to\s+mp3|video\s+to\s+audio|extract\s+audio|convert\s+mp4\s+mp3)\b/i,
    generator: (match) => {
      // Extract bitrate if mentioned
      const bitrateMatch = match.input?.match(/(\d+)\s*kbps|(\d+)\s*k/i);
      const bitrate = bitrateMatch ? parseInt(bitrateMatch[1] || bitrateMatch[2]) : 192;

      return {
        version: '1',
        name: 'MP4 to MP3 Converter',
        summary: 'Extract audio from MP4 videos and convert to MP3',
        inputs: [
          {
            id: 'videos',
            label: 'MP4 Videos',
            type: 'file[]',
            accept: ['video/mp4'],
            maxMB: 500
          },
          {
            id: 'bitrate',
            label: 'Audio Bitrate (kbps)',
            type: 'number',
            min: 64,
            max: 320,
            step: 32,
            default: bitrate
          }
        ],
        pipeline: [
          {
            op: 'video.extract_audio',
            args: {
              format: 'mp3',
              bitrate: '@bitrate'
            }
          }
        ],
        output: {
          type: 'file[]',
          naming: '{name}.mp3'
        },
        notes: ['Audio extraction using browser-compatible methods']
      };
    }
  },

  // PDF Merge - Run Mode
  {
    regex: /\b(merge\s+pdf|combine\s+pdf|join\s+pdf|pdf\s+merge)\b/i,
    generator: () => ({
      version: '1',
      name: 'PDF Merger',
      summary: 'Merge multiple PDF files into a single document',
      inputs: [{
        id: 'pdfs',
        label: 'PDF Files',
        type: 'file[]',
        accept: ['application/pdf'],
        maxMB: 200
      }],
      pipeline: [
        {
          op: 'pdf.merge',
          args: {}
        }
      ],
      output: {
        type: 'file',
        naming: 'merged.pdf'
      },
      notes: ['Stub implementation - requires PDF processing library']
    })
  },

  // CSV to JSON conversion - Run Mode
  {
    regex: /\b(csv\s+to\s+json|convert\s+csv\s+json)\b/i,
    generator: () => ({
      version: '1',
      name: 'CSV to JSON Converter',
      summary: 'Convert CSV files to JSON format with customizable options',
      inputs: [
        {
          id: 'csvFiles',
          label: 'CSV Files',
          type: 'file[]',
          accept: ['text/csv'],
          maxMB: 25
        },
        {
          id: 'hasHeader',
          label: 'Has Header Row',
          type: 'boolean',
          default: true
        },
        {
          id: 'delimiter',
          label: 'Delimiter',
          type: 'select',
          options: [
            { label: 'Comma (,)', value: ',' },
            { label: 'Semicolon (;)', value: ';' },
            { label: 'Tab', value: '\t' }
          ],
          default: ','
        }
      ],
      pipeline: [
        {
          op: 'csv.to_json',
          args: {
            hasHeader: '@hasHeader',
            delimiter: '@delimiter'
          }
        }
      ],
      output: {
        type: 'file[]',
        naming: '{name}.json'
      }
    })
  },

  // JSON to CSV conversion - Run Mode
  {
    regex: /\b(json\s+to\s+csv|convert\s+json\s+csv)\b/i,
    generator: () => ({
      version: '1',
      name: 'JSON to CSV Converter',
      summary: 'Convert JSON files to CSV format with header options',
      inputs: [
        {
          id: 'jsonFiles',
          label: 'JSON Files',
          type: 'file[]',
          accept: ['application/json'],
          maxMB: 25
        },
        {
          id: 'includeHeader',
          label: 'Include Header Row',
          type: 'boolean',
          default: true
        }
      ],
      pipeline: [
        {
          op: 'json.to_csv',
          args: {
            includeHeader: '@includeHeader'
          }
        }
      ],
      output: {
        type: 'file[]',
        naming: '{name}.csv'
      }
    })
  },

  // Image Resize - Run Mode
  {
    regex: /\b(resize\s+image|image\s+resize|scale\s+image|compress\s+image)\b/i,
    generator: (match) => {
      // Extract dimensions if mentioned
      const dimensionMatch = match.input?.match(/(\d+)x(\d+)|(\d+)\s*px|(\d+)p/i);
      const maxWidth = dimensionMatch ? parseInt(dimensionMatch[1] || dimensionMatch[3] || dimensionMatch[4]) : 1920;
      const maxHeight = dimensionMatch ? parseInt(dimensionMatch[2] || maxWidth) : 1080;

      return {
        version: '1',
        name: 'Image Resizer',
        summary: 'Resize images while maintaining aspect ratio and quality',
        inputs: [
          {
            id: 'images',
            label: 'Images',
            type: 'file[]',
            accept: ['image/*'],
            maxMB: 100
          },
          {
            id: 'maxWidth',
            label: 'Max Width (px)',
            type: 'number',
            min: 100,
            max: 4096,
            default: maxWidth
          },
          {
            id: 'maxHeight',
            label: 'Max Height (px)',
            type: 'number',
            min: 100,
            max: 4096,
            default: maxHeight
          },
          {
            id: 'fit',
            label: 'Resize Mode',
            type: 'select',
            options: [
              { label: 'Contain (preserve aspect)', value: 'contain' },
              { label: 'Cover (crop if needed)', value: 'cover' },
              { label: 'Fill (stretch)', value: 'fill' }
            ],
            default: 'contain'
          }
        ],
        pipeline: [
          {
            op: 'image.resize',
            args: {
              maxWidth: '@maxWidth',
              maxHeight: '@maxHeight',
              fit: '@fit'
            }
          }
        ],
        output: {
          type: 'file[]',
          naming: '{name}_resized{ext}'
        }
      };
    }
  }
];

// Try to match user input against fast-lane templates
export function tryFastLane(userText: string): ToolSpecV1_1 | null {
  const normalizedText = userText.toLowerCase().trim();

  for (const template of FASTLANE_TEMPLATES) {
    const match = normalizedText.match(template.regex);
    if (match) {
      return template.generator(match);
    }
  }

  return null;
}

// Get all available fast-lane template descriptions for help/autocomplete
export function getFastLaneExamples(): Array<{ description: string; example: string; mode: 'live' | 'run' }> {
  return [
    { description: 'View PDF documents interactively', example: 'pdf viewer with thumbnails', mode: 'live' },
    { description: 'Browse images with zoom and rotation', example: 'image viewer with metadata', mode: 'live' },
    { description: 'Convert PNG images to JPG', example: 'png to jpg quality 80', mode: 'run' },
    { description: 'Extract audio from videos', example: 'mp4 to mp3 192 kbps', mode: 'run' },
    { description: 'Merge multiple PDF files', example: 'merge pdf files', mode: 'run' },
    { description: 'Convert CSV data to JSON', example: 'csv to json with headers', mode: 'run' },
    { description: 'Convert JSON data to CSV', example: 'json to csv format', mode: 'run' },
    { description: 'Resize images to specific dimensions', example: 'resize images to 1920x1080', mode: 'run' }
  ];
}

// Default fallback when no templates match and no LLM available
export function getDefaultFallback(userText: string): ToolSpecV1_1 {
  return {
    version: '1',
    name: 'Text Formatter',
    summary: 'Format and process text files with various options',
    inputs: [
      {
        id: 'textFiles',
        label: 'Text Files',
        type: 'file[]',
        accept: ['text/*'],
        maxMB: 10
      },
      {
        id: 'case',
        label: 'Case Conversion',
        type: 'select',
        options: [
          { label: 'No change', value: 'none' },
          { label: 'UPPERCASE', value: 'upper' },
          { label: 'lowercase', value: 'lower' },
          { label: 'Title Case', value: 'title' }
        ],
        default: 'none'
      },
      {
        id: 'trim',
        label: 'Trim whitespace',
        type: 'boolean',
        default: true
      }
    ],
    pipeline: [
      {
        op: 'text.format',
        args: {
          case: '@case',
          trim: '@trim'
        }
      }
    ],
    output: {
      type: 'file[]',
      naming: '{name}_formatted{ext}'
    },
    notes: [
      `Default tool created for: "${userText}"`,
      'LLM planner is disabled - using template fallback',
      'Enable LLM planning for more sophisticated tool generation'
    ]
  };
}