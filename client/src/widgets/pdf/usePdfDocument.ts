import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface PdfDocumentHook {
  document: any | null;
  pages: HTMLCanvasElement[];
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(file: File | undefined): PdfDocumentHook {
  const [document, setDocument] = useState<any | null>(null);
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setDocument(null);
      setPages([]);
      setError(null);
      return;
    }

    let cancelled = false;
    
    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      setPages([]);

      try {
        const arrayBuffer = await file!.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdfDoc = await loadingTask.promise;

        if (cancelled) return;

        setDocument(pdfDoc);

        // Pre-render pages for thumbnails and main view
        const renderedPages: HTMLCanvasElement[] = [];
        
        for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 20); pageNum++) {
          if (cancelled) break;
          
          try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) continue;
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            };

            await page.render(renderContext).promise;
            renderedPages[pageNum - 1] = canvas;
          } catch (pageError) {
            console.warn(`Failed to render page ${pageNum}:`, pageError);
          }
        }

        if (!cancelled) {
          setPages(renderedPages);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PDF loading error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return {
    document,
    pages,
    isLoading,
    error,
  };
}