/**
 * Consistently converts tool outputs (single or multiple Uint8Arrays) 
 * into an array of File objects with stable naming for the pipeline.
 */
import type { ToolOutputType } from '../tools/registry';

const getMimeTypeAndExt = (outputType: ToolOutputType) => {
  switch (outputType) {
    case 'html': return { mime: 'text/html', ext: '.html' };
    case 'csv': return { mime: 'text/csv', ext: '.csv' };
    case 'json': return { mime: 'application/json', ext: '.json' };
    case 'excel': return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' };
    case 'image': return { mime: 'image/png', ext: '.png' }; // default to png
    case 'text': return { mime: 'text/plain', ext: '.txt' };
    case 'base64': return { mime: 'text/plain', ext: '.txt' };
    case 'single-pdf':
    case 'multi-pdf':
    default:
      return { mime: 'application/pdf', ext: '.pdf' };
  }
};

export function normalizeOutput(
  output: Uint8Array | Uint8Array[],
  stepIndex: number,
  outputType: ToolOutputType
): File[] {
  const arrays = Array.isArray(output) ? output : [output];
  const { mime, ext } = getMimeTypeAndExt(outputType);
  
  return arrays.map((bytes, index) => {
    const blob = new Blob([bytes as unknown as BlobPart], { type: mime });
    
    // Check if tool provided a filename hint
    const hint = (bytes as any).filenameHint;
    const filename = hint || `step-${stepIndex}-output-${index + 1}${ext}`;
    
    const file = new File([blob], filename, { 
      type: mime,
      lastModified: Date.now() 
    });

    // Copy custom properties if they exist
    if ((bytes as any).fileHash) {
      (file as any).fileHash = (bytes as any).fileHash;
    }
    if ((bytes as any).previewWarning) {
      (file as any).previewWarning = (bytes as any).previewWarning;
    }

    return file;
  });
}
