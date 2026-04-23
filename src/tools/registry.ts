export type ToolCategory = 'pdf' | 'image' | 'word' | 'markdown' | 'spreadsheet' | 'text';
export type ToolOutputType = 'single-pdf' | 'multi-pdf' | 'image' | 'text' | 'html' | 'csv' | 'json' | 'excel' | 'base64';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  accept: Record<string, string[]>;
  outputType: ToolOutputType;
  acceptsInput: ToolOutputType[];
  defaultOptions: Record<string, unknown>;
  load: () => Promise<(
    input: File[], 
    options: Record<string, unknown>,
    onProgress?: (p: number) => void
  ) => Promise<Uint8Array | Uint8Array[]>>;
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: 'pdf-merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDFs into a single file',
    category: 'pdf',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'single-pdf',
    acceptsInput: ['single-pdf', 'multi-pdf'],
    defaultOptions: {},
    load: async () => {
      const { mergePDFs } = await import('./pdfMerge');
      return (files) => mergePDFs(files);
    }
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract specific pages into separate files',
    category: 'pdf',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'multi-pdf',
    acceptsInput: ['single-pdf'],
    defaultOptions: { ranges: "1" },
    load: async () => {
      const { splitPDF } = await import('./pdfSplit');
      return (files, options) => splitPDF(files[0], options.ranges as string);
    }
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce file size and remove metadata',
    category: 'pdf',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'single-pdf',
    acceptsInput: ['single-pdf'],
    defaultOptions: { deepMode: false, quality: 60 },
    load: async () => {
      const { compressPDF } = await import('./pdfCompress');
      return (files, options) => compressPDF(files[0], options.deepMode as boolean);
    }
  },
  {
    id: 'image-to-pdf',
    name: 'Images to PDF',
    description: 'Convert PNG, JPG, or WebP to a PDF document',
    category: 'image',
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp']
    },
    outputType: 'single-pdf',
    acceptsInput: ['image'],
    defaultOptions: {},
    load: async () => {
      const { imagesToPDF } = await import('./imagesToPDF');
      return (files) => imagesToPDF(files);
    }
  },
  {
    id: 'docx-to-html',
    name: 'DOCX to HTML',
    description: 'Convert Word documents to clean HTML',
    category: 'word',
    outputType: 'html',
    acceptsInput: [],
    defaultOptions: {},
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    load: async () => {
      const { docxToHtml } = await import('./docxToHtml');
      return (files) => docxToHtml(files[0]);
    }
  },
  {
    id: 'docx-to-text',
    name: 'DOCX to Text',
    description: 'Extract raw text from Word documents',
    category: 'word',
    outputType: 'text',
    acceptsInput: [],
    defaultOptions: {},
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    load: async () => {
      const { docxToText } = await import('./docxToText');
      return (files) => docxToText(files[0]);
    }
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to styled HTML',
    category: 'markdown',
    outputType: 'html',
    acceptsInput: ['text'],
    defaultOptions: {},
    accept: { 'text/markdown': ['.md'] },
    load: async () => {
      const { markdownToHtml } = await import('./markdownToHtml');
      return (files) => markdownToHtml(files[0]);
    }
  },
  {
    id: 'markdown-to-pdf',
    name: 'Markdown to PDF',
    description: 'Convert Markdown to a PDF document',
    category: 'markdown',
    outputType: 'single-pdf',
    acceptsInput: ['text'],
    defaultOptions: {},
    accept: { 'text/markdown': ['.md'] },
    load: async () => {
      const { markdownToPdf } = await import('./markdownToPdf');
      return (files) => markdownToPdf(files[0]);
    }
  },
  {
    id: 'csv-to-excel',
    name: 'CSV to Excel',
    description: 'Combine CSV files into an Excel workbook',
    category: 'spreadsheet',
    outputType: 'excel',
    acceptsInput: ['csv'],
    defaultOptions: {},
    accept: { 'text/csv': ['.csv'] },
    load: async () => {
      const { csvToExcel } = await import('./csvToExcel');
      return (files) => csvToExcel(files);
    }
  },
  {
    id: 'excel-to-csv',
    name: 'Excel to CSV',
    description: 'Extract sheets from Excel into CSV files',
    category: 'spreadsheet',
    outputType: 'csv',
    acceptsInput: ['excel'],
    defaultOptions: {},
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    load: async () => {
      const { excelToCsv } = await import('./excelToCsv');
      return (files) => excelToCsv(files[0]);
    }
  },
  {
    id: 'json-to-excel',
    name: 'JSON to Excel',
    description: 'Convert a JSON array to an Excel spreadsheet',
    category: 'spreadsheet',
    outputType: 'excel',
    acceptsInput: ['json'],
    defaultOptions: {},
    accept: { 'application/json': ['.json'] },
    load: async () => {
      const { jsonToExcel } = await import('./jsonToExcel');
      return (files) => jsonToExcel(files[0]);
    }
  },
  {
    id: 'extract-text-from-pdf',
    name: 'Extract Text',
    description: 'Extract text content from a PDF document',
    category: 'text',
    outputType: 'text',
    acceptsInput: ['single-pdf'],
    defaultOptions: {},
    accept: { 'application/pdf': ['.pdf'] },
    load: async () => {
      const { extractTextFromPdf } = await import('./extractTextFromPdf');
      return (files) => extractTextFromPdf(files[0]);
    }
  },
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    description: 'Encode any file to a Base64 text file',
    category: 'text',
    outputType: 'base64',
    acceptsInput: ['single-pdf', 'multi-pdf', 'image', 'text', 'html', 'csv', 'json', 'excel'],
    defaultOptions: {},
    accept: { '*/*': ['.*'] },
    load: async () => {
      const { base64Encode } = await import('./base64Encode');
      return (files) => base64Encode(files[0]);
    }
  },
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    description: 'Decode a Base64 text file back to binary',
    category: 'text',
    outputType: 'single-pdf',
    acceptsInput: ['base64', 'text'],
    defaultOptions: {},
    accept: { 'text/plain': ['.txt'] },
    load: async () => {
      const { base64Decode } = await import('./base64Decode');
      return (files) => base64Decode(files[0]);
    }
  },
  {
    id: 'json-format',
    name: 'Format JSON',
    description: 'Pretty-print and validate JSON files',
    category: 'text',
    outputType: 'json',
    acceptsInput: ['json', 'text'],
    defaultOptions: {},
    accept: { 'application/json': ['.json'] },
    load: async () => {
      const { jsonFormat } = await import('./jsonFormat');
      return (files) => jsonFormat(files[0]);
    }
  },
  {
    id: 'hash-file',
    name: 'Hash File (SHA-256)',
    description: 'Calculate the SHA-256 hash of any file',
    category: 'text',
    outputType: 'text',
    acceptsInput: ['single-pdf', 'multi-pdf', 'image', 'text', 'html', 'csv', 'json', 'excel', 'base64'],
    defaultOptions: {},
    accept: { '*/*': ['.*'] },
    load: async () => {
      const { hashFile } = await import('./hashFile');
      return (files) => hashFile(files[0]);
    }
  },
  {
    id: 'image-resize',
    name: 'Resize Image',
    description: 'Resize an image by dimensions',
    category: 'image',
    outputType: 'image',
    acceptsInput: ['image'],
    defaultOptions: { width: '', height: '', maintainAspectRatio: true },
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp']
    },
    load: async () => {
      const { imageResize } = await import('./imageResize');
      return (files, options) => imageResize(files[0], options);
    }
  },
  {
    id: 'image-crop',
    name: 'Crop Image',
    description: 'Crop an image from an anchor point',
    category: 'image',
    outputType: 'image',
    acceptsInput: ['image'],
    defaultOptions: { width: '', height: '', anchor: 'center' },
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp']
    },
    load: async () => {
      const { imageCrop } = await import('./imageCrop');
      return (files, options) => imageCrop(files[0], options);
    }
  },
  {
    id: 'image-grayscale',
    name: 'Grayscale / Sepia',
    description: 'Convert an image to grayscale or sepia',
    category: 'image',
    outputType: 'image',
    acceptsInput: ['image'],
    defaultOptions: { sepia: false },
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp']
    },
    load: async () => {
      const { imageToGrayscale } = await import('./imageToGrayscale');
      return (files, options) => imageToGrayscale(files[0], options);
    }
  }
];
