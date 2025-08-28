export interface GalleryTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  runs: number;
  saves: number;
  tags: string[];
  createdAt: string;
  public: boolean;
}

export const galleryTools: GalleryTool[] = [
  {
    id: 'png-to-jpeg',
    name: 'PNG to JPEG Converter',
    description: 'Convert PNG images to JPEG format with customizable quality settings',
    category: 'Images',
    icon: 'image',
    rating: 4.8,
    runs: 12300,
    saves: 892,
    tags: ['image', 'convert'],
    createdAt: '2024-01-15T10:30:00Z',
    public: true,
  },
  {
    id: 'pdf-merger-pro',
    name: 'PDF Merger Pro',
    description: 'Combine multiple PDF files with custom page ordering and bookmarks',
    category: 'PDF',
    icon: 'file-text',
    rating: 4.9,
    runs: 8700,
    saves: 1200,
    tags: ['pdf', 'merge'],
    createdAt: '2024-01-12T14:20:00Z',
    public: true,
  },
  {
    id: 'video-frame-extractor',
    name: 'Video Frame Extractor',
    description: 'Extract individual frames from video files in various formats',
    category: 'Video',
    icon: 'film',
    rating: 4.7,
    runs: 5400,
    saves: 623,
    tags: ['video', 'extract'],
    createdAt: '2024-01-10T09:15:00Z',
    public: true,
  },
  {
    id: 'audio-converter',
    name: 'Audio Format Converter',
    description: 'Convert between various audio formats with quality control',
    category: 'Audio',
    icon: 'music',
    rating: 4.6,
    runs: 7800,
    saves: 456,
    tags: ['audio', 'convert'],
    createdAt: '2024-01-08T16:45:00Z',
    public: true,
  },
  {
    id: 'image-resizer',
    name: 'Batch Image Resizer',
    description: 'Resize multiple images while maintaining aspect ratio',
    category: 'Images',
    icon: 'maximize',
    rating: 4.5,
    runs: 9200,
    saves: 734,
    tags: ['image', 'resize', 'batch'],
    createdAt: '2024-01-05T11:30:00Z',
    public: true,
  },
  {
    id: 'text-extractor',
    name: 'PDF Text Extractor',
    description: 'Extract text content from PDF documents',
    category: 'PDF',
    icon: 'type',
    rating: 4.4,
    runs: 4500,
    saves: 287,
    tags: ['pdf', 'text', 'extract'],
    createdAt: '2024-01-03T13:20:00Z',
    public: true,
  },
  {
    id: 'exif-stripper',
    name: 'EXIF Data Stripper',
    description: 'Remove metadata and EXIF data from images for privacy',
    category: 'Images',
    icon: 'database',
    rating: 4.7,
    runs: 3200,
    saves: 445,
    tags: ['image', 'privacy', 'metadata'],
    createdAt: '2024-01-02T08:45:00Z',
    public: true,
  },
  {
    id: 'text-formatter',
    name: 'Advanced Text Formatter',
    description: 'Format and clean text with various transformation options',
    category: 'Text',
    icon: 'type',
    rating: 4.3,
    runs: 6800,
    saves: 512,
    tags: ['text', 'format', 'clean'],
    createdAt: '2024-01-01T12:00:00Z',
    public: true,
  },
];

export const categories = ['All', 'Images', 'Video', 'PDF', 'Audio', 'Text', 'Data'];
export const sortOptions = ['Trending', 'New', 'Most Runs', 'Highest Rating'];
export const timeframes = ['Day', 'Week', 'Month'];
