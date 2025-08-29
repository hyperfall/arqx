import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker - use local copy to avoid CDN issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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

        // Create placeholder pages array to show correct page count
        const renderedPages: HTMLCanvasElement[] = [];
        for (let i = 0; i < pdfDoc.numPages; i++) {
          renderedPages[i] = document.createElement('canvas');
        }

        if (!cancelled) {
          setPages(renderedPages);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PDF loading error:', err);
          setError(err instanceof Error ? err.message : `Failed to load PDF: ${String(err)}`);
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