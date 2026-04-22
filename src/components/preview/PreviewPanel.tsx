import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { usePDFStore } from '../../store/usePDFStore';

// Configure the worker using the native bundled build
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export function PreviewPanel() {
  const outputBlobs = usePDFStore(state => state.outputBlobs);
  const status = usePDFStore(state => state.status);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  // We only preview the very first output blob
  const previewBlob = outputBlobs?.[0];

  useEffect(() => {
    if (!previewBlob || status !== 'done' || !canvasRef.current) return;

    let renderTask: pdfjsLib.RenderTask | null = null;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const renderPage = async () => {
      try {
        setError(null);
        const arrayBuffer = await previewBlob.arrayBuffer();
        
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale to fit container width
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = canvas.parentElement?.clientWidth || 280;
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: ctx,
          viewport: scaledViewport
        } as any);
        
        await renderTask.promise;
      } catch (err) {
        console.error("Preview render failed:", err);
        setError("Could not render preview thumbnail");
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      if (loadingTask && !loadingTask.destroyed) {
        loadingTask.destroy();
      }
    };
  }, [previewBlob, status]);

  if (status !== 'done' || !previewBlob) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mb-4 h-64">
        <p className="text-gray-400">Preview will appear here after processing</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-min">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Preview (Page 1)</h3>
      </div>
      <div className="p-4 bg-gray-100 flex items-center justify-center overflow-auto custom-scrollbar">
        {error ? (
          <div className="text-sm text-red-500 py-10 text-center">{error}</div>
        ) : (
          <canvas ref={canvasRef} className="shadow-md bg-white w-full h-auto" />
        )}
      </div>
    </div>
  );
}
