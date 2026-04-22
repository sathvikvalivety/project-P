export async function base64Decode(file: File): Promise<Uint8Array> {
  const text = await file.text();
  const base64Str = text.replace(/\s+/g, ''); // Remove any whitespace/newlines
  
  // Decoding chunk size must be a multiple of 4
  const CHUNK_SIZE = 524288; // 512KB (multiple of 4)
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  for (let i = 0; i < base64Str.length; i += CHUNK_SIZE) {
    const chunkStr = base64Str.substring(i, i + CHUNK_SIZE);
    const binaryStr = atob(chunkStr);
    
    const chunkBytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) {
      chunkBytes[j] = binaryStr.charCodeAt(j);
    }
    
    chunks.push(chunkBytes);
    totalLength += chunkBytes.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
