import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetProps } from '../registry';
import { usePdfDocument } from './usePdfDocument';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Download,
  Maximize2,
  Sidebar,
  Grid3X3
} from 'lucide-react';

interface PdfViewerOptions {
  showSidebar?: boolean;
  showThumbnails?: boolean;
  showSearch?: boolean;
  continuous?: boolean;
}

export default function PdfViewerWidget({ id, title, bindings, options, ctx }: WidgetProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(() => options?.showSidebar ?? true);
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('single');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get PDF file from bindings
  const fileBinding = bindings?.file || '@pdf';
  const pdfFile = ctx.getInput(fileBinding.replace('@', '')) as File | undefined;
  
  const { document: pdfDoc, pages, isLoading, error } = usePdfDocument(pdfFile);

  const totalPages = pdfDoc?.numPages || 0;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!pdfDoc) return;

      // Cmd/Ctrl + F for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentPage(p => Math.min(totalPages, p + 1));
      }

      // Zoom
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(3, z * 1.2));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(0.5, z / 1.2));
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pdfDoc, totalPages]);

  // Update widget state (removed to prevent infinite loop)
  // useEffect(() => {
  //   ctx.setState('currentPage', currentPage);
  //   ctx.setState('zoom', zoom);
  //   ctx.setState('rotation', rotation);
  // }, [currentPage, zoom, rotation]);

  if (!pdfFile) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              📄
            </div>
            <p className="font-medium">No PDF file selected</p>
            <p className="text-sm mt-1">Drop a PDF file to preview it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p>Loading PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-destructive">
            <p className="font-medium">Failed to load PDF</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="viewerRoot overflow-hidden" style={{ height: 'min(75vh, 900px)' }}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            {title}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                title="Toggle Sidebar"
              >
                <Sidebar className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'single' ? 'continuous' : 'single')}
                title="Toggle View Mode"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0 h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 h-8 text-center"
                min={1}
                max={totalPages}
              />
              <span className="text-sm text-muted-foreground">of {totalPages}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.max(0.5, z / 1.2))}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.min(3, z * 1.2))}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(1)}
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {options?.showSearch && (
              <div className="flex items-center space-x-2 ml-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {showSidebar && options?.showThumbnails && (
            <div className="w-48 border-r bg-muted/20 overflow-y-auto">
              <div className="p-2 space-y-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <div
                    key={index}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      currentPage === index + 1 
                        ? 'bg-primary/20 ring-1 ring-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    <div className="aspect-[3/4] bg-white rounded border flex items-center justify-center text-xs">
                      Page {index + 1}
                    </div>
                    <p className="text-xs text-center mt-1">{index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Viewer */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto viewerScroll"
            style={{ height: '100%' }}
          >
            <div className="p-4 flex justify-center">
              {pdfDoc && (
                <div 
                  className="bg-white shadow-lg rounded"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center top',
                  }}
                >
                  <canvas
                    ref={async (canvas) => {
                      if (canvas && pdfDoc && currentPage <= totalPages) {
                        try {
                          const page = await pdfDoc.getPage(currentPage);
                          const viewport = page.getViewport({ scale: 1.0 });
                          const context = canvas.getContext('2d');
                          
                          if (context) {
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            
                            const renderContext = {
                              canvasContext: context,
                              viewport: viewport,
                            };
                            
                            await page.render(renderContext).promise;
                          }
                        } catch (err) {
                          console.warn(`Failed to render page ${currentPage}:`, err);
                        }
                      }
                    }}
                    className="block max-w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}