import React, { useEffect, useRef } from 'react';

interface PdfPageRendererProps {
  pdfDocument: any;
  pageNumber: number;
  scale?: number;
  className?: string;
}

export default function PdfPageRenderer({ 
  pdfDocument, 
  pageNumber, 
  scale = 1.0, 
  className = "" 
}: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDocument) return;

    // Cancel previous render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    async function renderPage() {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      } catch (err) {
        // Handle cancellation gracefully
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Failed to render page ${pageNumber}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDocument, pageNumber, scale]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`block max-w-full h-auto ${className}`}
    />
  );
}