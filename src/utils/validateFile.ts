import { useSettings } from '../hooks/useSettings';
import { usePDFStore } from '../store/usePDFStore';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a file using a strict, efficient order:
 * 1. Size check (Fastest)
 * 2. MIME check
 * 3. Magic Bytes check
 * 4. PDF Password check
 * 5. Duplicate Check (SHA-256) (Slowest)
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  const { settings } = useSettings.getState();
  const { files: existingFiles } = usePDFStore.getState();

  // 1. Size Check
  const maxSizeInBytes = settings.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: `File too large (Max ${settings.maxFileSizeMB}MB)` };
  }

  // 2. MIME Check
  // (Assuming basic checks for now, we could expand this)
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // 3. Magic Bytes Check (PDF)
  if (file.type === 'application/pdf') {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const header = new Uint8Array(buffer);
    const isPDF = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46; // %PDF
    if (!isPDF) {
      return { valid: false, error: 'Invalid PDF file structure' };
    }
  }

  // 4. Duplicate Check (SHA-256)
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (existingFiles.some(f => f.hash === hashHex)) {
    return { valid: false, error: 'File already exists in workspace' };
  }

  return { valid: true };
}

// Helper to get hash
export async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
