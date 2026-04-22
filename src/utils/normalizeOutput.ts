/**
 * Consistently converts tool outputs (single or multiple Uint8Arrays) 
 * into an array of File objects with stable naming for the pipeline.
 */
export function normalizeOutput(
  output: Uint8Array | Uint8Array[],
  stepIndex: number,
  mimeType: string = 'application/pdf'
): File[] {
  const arrays = Array.isArray(output) ? output : [output];
  
  return arrays.map((bytes, index) => {
    const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
    const filename = `step-${stepIndex}-output-${index + 1}.pdf`;
    
    return new File([blob], filename, { 
      type: mimeType,
      lastModified: Date.now() 
    });
  });
}
