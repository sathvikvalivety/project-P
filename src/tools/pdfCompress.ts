import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is configured natively for compression rendering
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function compressPDF(file: File, deepMode: boolean): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();

  if (!deepMode) {
    // Safe mode: drop metadata, rebuild streams natively using pdf-lib
    try {
      const doc = await PDFDocument.load(arrayBuffer);
      // Removed metadata implicitly if we create new and copy, or just save with useObjectStreams
      // Wait, a deeper safe compression is copying all pages to a new doc:
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => newDoc.addPage(page));

      return await newDoc.save({ useObjectStreams: false });
    } catch (err) {
      throw new Error(`File ${file.name} is encrypted or corrupted.`);
    }
  } else {
    // Deep mode: rasterizing
    const newDoc = await PDFDocument.create();
    
    let loadingTask;
    try {
      loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        // Using standard scale (quality) 1.5 is okay for deep compression but maintaining some readability
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not acquire canvas context");

        await page.render({ canvasContext: ctx, viewport: viewport } as any).promise;

        // Compress as low quality JPEG
        const imgData = canvas.toDataURL('image/jpeg', 0.6);
        const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
        
        const embeddedImage = await newDoc.embedJpg(imgBytes);
        const newPage = newDoc.addPage([viewport.width, viewport.height]);
        
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      return await newDoc.save();
    } catch (err) {
      throw new Error(`Failed to perform deep compression: ${err}`);
    } finally {
      if (loadingTask && !loadingTask.destroyed) {
        loadingTask.destroy();
      }
    }
  }
}
