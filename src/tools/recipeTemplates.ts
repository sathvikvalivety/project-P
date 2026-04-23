import { Recipe } from '../store/usePDFStore';

export const RECIPE_TEMPLATES: Partial<Recipe>[] = [
  {
    name: "Standard PDF Cleanup",
    steps: [
      { id: 't1', toolId: 'pdf-compress', options: { deepMode: true, quality: 50 } },
      { id: 't2', toolId: 'hash-file', options: {} }
    ]
  },
  {
    name: "Document Archival",
    steps: [
      { id: 'a1', toolId: 'extract-text-from-pdf', options: {} },
      { id: 'a2', toolId: 'json-format', options: {} }
    ]
  },
  {
    name: "Web Assets Optimizer",
    steps: [
      { id: 'i1', toolId: 'image-resize', options: { width: 800, maintainAspectRatio: true } },
      { id: 'i2', toolId: 'image-grayscale', options: { sepia: false } },
      { id: 'i3', toolId: 'image-to-pdf', options: {} }
    ]
  }
];
