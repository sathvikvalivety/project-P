import JSZip from 'jszip';

/**
 * Compresses multiple Blobs into a single ZIP file.
 */
export async function zipFiles(blobs: Blob[], filenames: string[]): Promise<Blob> {
  const zip = new JSZip();
  
  blobs.forEach((blob, i) => {
    zip.file(filenames[i], blob);
  });
  
  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
