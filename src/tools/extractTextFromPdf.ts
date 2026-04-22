import * as pdfjsLib from 'pdfjs-dist';

// Use same worker as the preview panel
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export async function extractTextFromPdf(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  let fullText = '';
  let totalChars = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    totalChars += pageText.trim().length;
  }

  loadingTask.destroy();

  const arr = new TextEncoder().encode(fullText);
  
  if (numPages > 2 && totalChars < 100) {
    (arr as any).previewWarning = "This PDF appears to be scanned. Text extraction returned minimal content.";
  }

  return arr;
}
