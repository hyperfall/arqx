import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker - use local copy to avoid CDN issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PdfDocumentHook {
  document: any | null;
  numPages: number;
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(file: File | undefined): PdfDocumentHook {
  const [document, setDocument] = useState<any | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setDocument(null);
      setNumPages(0);
      setError(null);
      return;
    }

    let cancelled = false;
    
    async function loadPdf() {
      setIsLoading(true);
      setError(null);
      setNumPages(0);

      try {
        const arrayBuffer = await file!.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdfDoc = await loadingTask.promise;

        if (cancelled) return;

        setDocument(pdfDoc);
        setNumPages(pdfDoc.numPages);
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
    numPages,
    isLoading,
    error,
  };
}