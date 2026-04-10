import { create } from 'zustand'

export interface PDFFileItem {
  id: string
  file: File
}

export type MergeStatus = 'idle' | 'running' | 'done' | 'error'

interface PDFStore {
  files: PDFFileItem[]
  status: MergeStatus
  errorMessage: string | null
  outputBlob: Blob | null
  
  addFiles: (newFiles: File[]) => void
  removeFile: (id: string) => void
  setStatus: (status: MergeStatus) => void
  setErrorMessage: (msg: string | null) => void
  setOutputBlob: (blob: Blob | null) => void
  reset: () => void
}

export const usePDFStore = create<PDFStore>((set) => ({
  files: [],
  status: 'idle',
  errorMessage: null,
  outputBlob: null,
  
  addFiles: (newFiles: File[]) => set((state) => {
    const newItems = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    return { files: [...state.files, ...newItems], status: 'idle', errorMessage: null, outputBlob: null };
  }),
  
  removeFile: (id: string) => set((state) => {
    const updatedFiles = state.files.filter(f => f.id !== id);
    // Auto-reset if user removes files after a merge
    return { 
      files: updatedFiles,
      status: state.status === 'done' ? 'idle' : state.status,
      outputBlob: state.status === 'done' ? null : state.outputBlob
    };
  }),
  
  setStatus: (status: MergeStatus) => set({ status }),
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
  setOutputBlob: (outputBlob: Blob | null) => set({ outputBlob }),
  
  reset: () => set({ files: [], status: 'idle', errorMessage: null, outputBlob: null })
}));
