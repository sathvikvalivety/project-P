import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { usePDFStore } from '../../store/usePDFStore';
import { IframePreview } from '../shared/IframePreview';
import { HashDisplay } from '../shared/HashDisplay';
import { SpreadsheetPreview } from './SpreadsheetPreview';

// Configure the worker using the native bundled build
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export function PreviewPanel() {
  const outputBlobs = usePDFStore(state => state.outputBlobs);
  const status = usePDFStore(state => state.status);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  // We only preview the very first output blob
  const previewBlob = outputBlobs?.[0];

  useEffect(() => {
    if (!previewBlob || status !== 'done') return;

    if (previewBlob.type === 'application/pdf') {
      if (!canvasRef.current) return;

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
    } else if (previewBlob.type === 'text/html' || previewBlob.type === 'text/plain' || previewBlob.type === 'application/json') {
      previewBlob.text().then(setHtmlContent).catch(() => setError("Could not read text content"));
    }
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
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Preview</h3>
        {(previewBlob as any).previewWarning && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            {(previewBlob as any).previewWarning}
          </span>
        )}
      </div>
      <div className="flex-grow flex items-center justify-center overflow-auto bg-gray-100">
        {error ? (
          <div className="text-sm text-red-500 py-10 text-center">{error}</div>
        ) : (previewBlob as any).fileHash ? (
          <HashDisplay hash={(previewBlob as any).fileHash} />
        ) : previewBlob.type === 'text/html' ? (
          htmlContent ? <IframePreview htmlContent={htmlContent} /> : <div className="text-sm text-gray-500 py-10 text-center">Loading preview...</div>
        ) : previewBlob.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || previewBlob.type === 'text/csv' ? (
          <SpreadsheetPreview blob={previewBlob} />
        ) : previewBlob.type.startsWith('image/') ? (
          <img src={URL.createObjectURL(previewBlob)} alt="Preview" className="max-w-full max-h-full object-contain shadow-md bg-white" />
        ) : previewBlob.type === 'application/pdf' ? (
          <div className="p-4 flex justify-center w-full h-full overflow-auto custom-scrollbar">
            <canvas ref={canvasRef} className="shadow-md bg-white w-full h-auto max-w-full object-contain" />
          </div>
        ) : previewBlob.type === 'application/json' || previewBlob.type === 'text/plain' ? (
          <div className="w-full h-full p-4 bg-white overflow-auto custom-scrollbar">
            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">{htmlContent}</pre>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-10 text-center">Preview not available for this file type</div>
        )}
      </div>
    </div>
  );
}
