import { Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

interface OutputFile {
  name: string;
  size: number;
  url: string;
}

interface OutputListProps {
  files: OutputFile[];
}

export default function OutputList({ files }: OutputListProps) {
  const handleDownload = (file: OutputFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    // In a real implementation, this would create a zip file
    files.forEach(file => handleDownload(file));
  };

  if (files.length === 0) {
    return (
      <EmptyState
        icon={Download}
        title="No output files yet"
        description="Run the tool to generate converted files"
      />
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
        >
          <div className="flex items-center space-x-3">
            <Download className="text-primary w-5 h-5" />
            <div>
              <div className="font-medium text-foreground">{file.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatBytes(file.size)} • Just now
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleDownload(file)}
            size="sm"
            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors focus-ring"
            data-testid={`download-file-${index}`}
          >
            Download
          </Button>
        </div>
      ))}
      
      {files.length > 1 && (
        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleDownloadAll}
            variant="secondary"
            className="w-full py-2 rounded-lg hover:bg-secondary/80 transition-colors focus-ring"
            data-testid="download-all-button"
          >
            <Package className="w-4 h-4 mr-2" />
            Download All (.zip)
          </Button>
        </div>
      )}
    </div>
  );
}
