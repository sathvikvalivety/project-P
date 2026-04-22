import * as XLSX from 'xlsx';
import { sanitizeFilename } from '../utils/sanitizeFilename';

export async function excelToCsv(file: File): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
  
  const csvFiles: Uint8Array[] = [];
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const csvStr = XLSX.utils.sheet_to_csv(worksheet);
    
    const safeName = sanitizeFilename(sheetName);
    
    // We attach a custom property or we just return an array of Uint8Arrays.
    // The pipeline will handle multi-output by extracting them.
    // However, to pass the filename down in this architecture, we might need 
    // to attach it to the Uint8Array or just return standard buffers.
    // In Phase 2, multi-output produced generic files like output_1.csv.
    // We will augment the Uint8Array with a hint for the filename.
    const arr = new TextEncoder().encode(csvStr);
    (arr as any).filenameHint = `${safeName}.csv`;
    
    csvFiles.push(arr);
  }

  return csvFiles;
}
