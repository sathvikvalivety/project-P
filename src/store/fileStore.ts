/**
 * Module-level store for File objects.
 * We keep Files out of Zustand state so that zundo (undo/redo middleware)
 * doesn't snapshot massive File/Blob objects and cause memory leaks.
 */

export const fileMap = new Map<string, File>();

export function getFile(id: string): File | undefined {
  return fileMap.get(id);
}

export function setFile(id: string, file: File): void {
  fileMap.set(id, file);
}

export function removeFileFromMap(id: string): void {
  fileMap.delete(id);
}

export function clearFilesFromMap(): void {
  fileMap.clear();
}
