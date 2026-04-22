import { mergePDFs } from './pdfMerge';
import { splitPDF } from './pdfSplit';
import { compressPDF } from './pdfCompress';
import { imagesToPDF } from './imagesToPDF';
import { docxToHtml } from './docxToHtml';
import { docxToText } from './docxToText';
import { markdownToHtml } from './markdownToHtml';
import { markdownToPdf } from './markdownToPdf';
import { csvToExcel } from './csvToExcel';
import { excelToCsv } from './excelToCsv';
import { jsonToExcel } from './jsonToExcel';
import { extractTextFromPdf } from './extractTextFromPdf';
import { base64Encode } from './base64Encode';
import { base64Decode } from './base64Decode';
import { jsonFormat } from './jsonFormat';
import { hashFile } from './hashFile';
import { imageResize } from './imageResize';
import { imageCrop } from './imageCrop';
import { imageToGrayscale } from './imageToGrayscale';

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
  execute: (input: File[], options: Record<string, unknown>) => Promise<Uint8Array | Uint8Array[]>;
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
    execute: async (files, _options) => {
      return await mergePDFs(files);
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
    execute: async (files, options) => {
      const ranges = options.ranges as string;
      return await splitPDF(files[0], ranges);
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
    execute: async (files, options) => {
      const deepMode = options.deepMode as boolean;
      return await compressPDF(files[0], deepMode);
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
    execute: async (files, _options) => {
      return await imagesToPDF(files);
    }
  },
  {
    id: 'docx-to-html',
    name: 'DOCX to HTML',
    description: 'Convert Word documents to clean HTML',
    category: 'word',
    outputType: 'html',
    acceptsInput: ['text', 'base64'], // technically accepts any, but let's restrict to word if we had it, wait, we don't have docx as an output type currently. So no chaining inputs usually. Actually empty array for acceptsInput since it's just a starting tool mostly. Let's use the provided acceptsInput: [] or ['base64']
    defaultOptions: {},
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    execute: async (files, _options) => await docxToHtml(files[0])
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
    execute: async (files, _options) => await docxToText(files[0])
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
    execute: async (files, _options) => await markdownToHtml(files[0])
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
    execute: async (files, _options) => await markdownToPdf(files[0])
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
    execute: async (files, _options) => await csvToExcel(files)
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
    execute: async (files, _options) => await excelToCsv(files[0])
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
    execute: async (files, _options) => await jsonToExcel(files[0])
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
    execute: async (files, _options) => await extractTextFromPdf(files[0])
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
    execute: async (files, _options) => await base64Encode(files[0])
  },
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    description: 'Decode a Base64 text file back to binary',
    category: 'text',
    outputType: 'single-pdf', // default output, or could be anything. In this architecture, we might just assume pdf or let the pipeline handle it. The user will just download it.
    acceptsInput: ['base64', 'text'],
    defaultOptions: {},
    accept: { 'text/plain': ['.txt'] },
    execute: async (files, _options) => await base64Decode(files[0])
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
    execute: async (files, _options) => await jsonFormat(files[0])
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
    execute: async (files, _options) => await hashFile(files[0])
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
    execute: async (files, options) => await imageResize(files[0], options)
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
    execute: async (files, options) => await imageCrop(files[0], options)
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
    execute: async (files, options) => await imageToGrayscale(files[0], options)
  }
];
