import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Same CSS as markdownToHtml to ensure consistent rendering before PDF generation
const CSS = `
  body {
    font-family: Georgia, serif;
    line-height: 1.6;
    color: #333;
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    overflow: auto;
    border-radius: 6px;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    background-color: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  pre code {
    background-color: transparent;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #dfe2e5;
    padding: 0 1em;
    color: #6a737d;
    margin-left: 0;
  }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
  th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  th { background-color: #f6f8fa; }
  img { max-width: 100%; }
`;

export async function markdownToPdf(file: File): Promise<Uint8Array> {
  const text = await file.text();
  const htmlContent = await marked.parse(text);

  // Create a hidden iframe to render the HTML securely without affecting the main DOM
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '720px';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${htmlContent}</body></html>`;
  
  return new Promise((resolve, reject) => {
    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) throw new Error("Could not access iframe document");

        const body = doc.body;
        // Make height auto so html2canvas can measure the full content
        iframe.style.height = body.scrollHeight + 'px';

        const canvas = await html2canvas(body, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // A4 dimensions: 210 x 297 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        const arrayBuffer = pdf.output('arraybuffer');
        document.body.removeChild(iframe);
        const arr = new Uint8Array(arrayBuffer);
        (arr as any).previewWarning = "Output PDF will not have selectable text.";
        resolve(arr);
      } catch (err) {
        document.body.removeChild(iframe);
        reject(err);
      }
    };
    
    // Inject content
    iframe.srcdoc = htmlDoc;
  });
}
