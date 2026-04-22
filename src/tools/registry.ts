import { mergePDFs } from './pdfMerge';
import { splitPDF } from './pdfSplit';
import { compressPDF } from './pdfCompress';
import { imagesToPDF } from './imagesToPDF';

export type ToolCategory = 'PDF Tools' | 'Image Tools';
export type ToolOutputType = 'single-pdf' | 'multi-pdf' | 'image' | 'text';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  accept: Record<string, string[]>;
  outputType: ToolOutputType;
  acceptsInput: ToolOutputType[];
  defaultOptions: Record<string, unknown>;
  execute: (input: File[], options: Record<string, unknown>) => Promise<Uint8Array | Uint8Array[]>;
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: 'pdf-merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDFs into a single file',
    category: 'PDF Tools',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'single-pdf',
    acceptsInput: ['single-pdf', 'multi-pdf'],
    defaultOptions: {},
    execute: async (files, _options) => {
      return await mergePDFs(files);
    }
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract specific pages into separate files',
    category: 'PDF Tools',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'multi-pdf',
    acceptsInput: ['single-pdf'],
    defaultOptions: { ranges: "1" },
    execute: async (files, options) => {
      const ranges = options.ranges as string;
      return await splitPDF(files[0], ranges);
    }
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce file size and remove metadata',
    category: 'PDF Tools',
    accept: { 'application/pdf': ['.pdf'] },
    outputType: 'single-pdf',
    acceptsInput: ['single-pdf'],
    defaultOptions: { deepMode: false, quality: 60 },
    execute: async (files, options) => {
      const deepMode = options.deepMode as boolean;
      return await compressPDF(files[0], deepMode);
    }
  },
  {
    id: 'image-to-pdf',
    name: 'Images to PDF',
    description: 'Convert PNG, JPG, or WebP to a PDF document',
    category: 'Image Tools',
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp']
    },
    outputType: 'single-pdf',
    acceptsInput: ['image'],
    defaultOptions: {},
    execute: async (files, _options) => {
      return await imagesToPDF(files);
    }
  }
];
