import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

interface DropzoneProps {
  accept: string[];
  maxSize: number;
  multiple: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function Dropzone({ accept, maxSize, multiple, files, onFilesChange }: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);

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
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="text-primary w-5 h-5" />
                <div>
                  <div className="font-medium text-foreground truncate max-w-[200px]" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatBytes(file.size)} • Modified {new Date(file.lastModified).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive"
                data-testid={`remove-file-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

