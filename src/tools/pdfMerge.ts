import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error("No files provided for merging.");
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    let pdfDoc: PDFDocument;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      pdfDoc = await PDFDocument.load(arrayBuffer);
    } catch (err: any) {
      console.error(`Error loading ${file.name}:`, err);
      // Surface clear error, especially handling encrypted/corrupted files
      throw new Error(`File ${file.name} is password-protected, encrypted, or corrupted and cannot be merged.`);
    }

    try {
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err: any) {
      console.error(`Error copying pages from ${file.name}:`, err);
      throw new Error(`Failed to process pages from File ${file.name}.`);
    }
  }

  return await mergedPdf.save();
}
