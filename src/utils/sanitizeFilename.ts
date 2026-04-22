export function sanitizeFilename(name: string): string {
  // Replace characters invalid in filenames (/, \, :, *, ?, ", <, >, |) with underscores
  return name.replace(/[\\/:*?"<>|]/g, '_');
}
