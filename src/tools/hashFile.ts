export async function hashFile(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const arr = new TextEncoder().encode(hashHex);
  
  // Attach the hash to the array so the preview panel can use the HashDisplay component
  (arr as any).fileHash = hashHex;
  
  return arr;
}
