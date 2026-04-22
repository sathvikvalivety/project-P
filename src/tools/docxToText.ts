import mammoth from 'mammoth';

export async function docxToText(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return new TextEncoder().encode(result.value);
}
