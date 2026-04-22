export async function base64Encode(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  // 524286 is a multiple of 3, close to 512KB. Avoids padding in the middle of base64 chunks.
  const CHUNK_SIZE = 524286;

  let base64String = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    // Convert chunk to string, then use btoa
    // String.fromCharCode.apply can still throw call stack error if chunk is too large,
    // but 512KB (524288) elements might be too large for apply. 
    // Usually safe limit is ~65535 or ~125000. Let's process chunk to string safely.
    let chunkStr = '';
    // Process chunk string in smaller pieces (e.g. 65536) to avoid Maximum call stack size exceeded
    const STR_CHUNK = 65536;
    for (let j = 0; j < chunk.length; j += STR_CHUNK) {
      chunkStr += String.fromCharCode.apply(null, chunk.subarray(j, j + STR_CHUNK) as unknown as number[]);
    }
    base64String += btoa(chunkStr);
  }

  return new TextEncoder().encode(base64String);
}
