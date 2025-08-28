import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface FileWithPreview {
  file: File;
  preview?: string;
  dimensions?: { width: number; height: number };
}

interface DropzoneProps {
  accept: string[];
  maxSize: number;
  multiple: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function Dropzone({ accept, maxSize, multiple, files, onFilesChange }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);

  // Check if this is an image/video tool based on accept types
  const isMediaTool = accept.some(type => 
    type.includes('image') || type.includes('video') || type === '.gif' || type === '.png' || type === '.jpg' || type === '.jpeg'
  );

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Maximum size is ${formatBytes(maxSize)}`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`Invalid file type. Accepted types: ${accept.join(', ')}`);
      }
      return;
    }

    if (multiple) {
      onFilesChange([...files, ...acceptedFiles]);
    } else {
      onFilesChange(acceptedFiles);
    }
  }, [files, onFilesChange, accept, maxSize, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  });

  // Generate previews for image files
  useEffect(() => {
    const generatePreviews = async () => {
      if (!isMediaTool) {
        setFilesWithPreviews(files.map(file => ({ file })));
        return;
      }

      const previews = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.gif')) {
            try {
              const preview = URL.createObjectURL(file);
              const dimensions = await getImageDimensions(preview);
              return { file, preview, dimensions };
            } catch (error) {
              return { file };
            }
          }
          return { file };
        })
      );
      setFilesWithPreviews(previews);
    };

    generatePreviews();

    // Cleanup object URLs on unmount or file change
    return () => {
      filesWithPreviews.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [files, isMediaTool]);

  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatFileTypes = (types: string[]) => {
    return types.map(type => {
      if (type.startsWith('.')) return type.toUpperCase();
      return type.split('/')[1]?.toUpperCase() || type;
    }).join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? "border-primary/50 bg-primary/5" 
            : "border-border hover:border-primary/50"
        }`}
        data-testid="file-dropzone"
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="text-primary w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {isDragActive ? "Drop files here" : `Drop your ${formatFileTypes(accept)} files here`}
        </h3>
        <p className="text-muted-foreground mb-4">or click to browse your computer</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
            {formatFileTypes(accept)}
          </span>
          <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
            Max {formatBytes(maxSize)} each
          </span>
          {multiple && (
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
              Multiple files
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* File List */}
      {filesWithPreviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files ({filesWithPreviews.length})</h4>
          <div className="space-y-3">
            {filesWithPreviews.map(({ file, preview, dimensions }, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-start justify-between p-4 bg-card rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {preview ? (
                      <div className="relative group">
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                        {file.name.toLowerCase().endsWith('.gif') && (
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">GIF</span>
                          </div>
                        )}
                      </div>
                    ) : file.type.startsWith('image/') ? (
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ImageIcon className="text-primary w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileIcon className="text-primary w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-medium text-foreground truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{file.type || 'Unknown type'}</span>
                        {dimensions && (
                          <>
                            <span>•</span>
                            <span>{dimensions.width} × {dimensions.height}px</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs">
                        Modified {new Date(file.lastModified).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive flex-shrink-0"
                  data-testid={`remove-file-${index}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

