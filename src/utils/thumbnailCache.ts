/**
 * Memory-efficient thumbnail cache.
 * Stores compressed Blobs instead of raw ImageData/Base64 strings.
 */
const cache = new Map<string, Blob>();

export function setThumbnail(fileId: string, blob: Blob) {
  cache.set(fileId, blob);
}

export function getThumbnail(fileId: string): string | null {
  const blob = cache.get(fileId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export function removeThumbnail(fileId: string) {
  cache.delete(fileId);
}

export function clearThumbnails() {
  cache.clear();
}
