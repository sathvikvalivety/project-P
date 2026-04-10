import { PDFDocument } from 'pdf-lib';
import { parsePageRanges } from '../utils/parsePageRanges';

export async function splitPDF(file: File, rangesStr: string): Promise<Uint8Array[]> {
  let sourceDoc: PDFDocument;

  try {
    const arrayBuffer = await file.arrayBuffer();
    sourceDoc = await PDFDocument.load(arrayBuffer);
  } catch (err) {
    throw new Error(`File ${file.name} is password-protected, encrypted, or corrupted.`);
  }

  const totalPages = sourceDoc.getPageCount();
  const { pages } = parsePageRanges(rangesStr, totalPages);

  const outPdfs: Uint8Array[] = [];

  for (const pageNum of pages) {
    try {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourceDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
      const bytes = await newPdf.save();
      outPdfs.push(bytes);
    } catch (err) {
      throw new Error(`Failed to extract page ${pageNum}.`);
    }
  }

  return outPdfs;
}
