import { create } from 'zustand'

export interface PDFFileItem {
  id: string
  file: File
}

export type MergeStatus = 'idle' | 'running' | 'done' | 'error'

interface PDFStore {
  files: PDFFileItem[]
  activeTool: string
  status: MergeStatus
  errorMessage: string | null
  outputBlobs: Blob[] | null
  outputFilenames: string[] | null
  
  addFiles: (newFiles: File[]) => void
  removeFile: (id: string) => void
  reorderFiles: (fromIndex: number, toIndex: number) => void
  clearFiles: () => void
  setActiveTool: (toolId: string) => void
  setStatus: (status: MergeStatus) => void
  setErrorMessage: (msg: string | null) => void
  setOutputs: (blobs: Blob[] | null, filenames: string[] | null) => void
  resetProcessingState: () => void
}

export const usePDFStore = create<PDFStore>((set) => ({
  files: [],
  activeTool: 'pdf-merge',
  status: 'idle',
  errorMessage: null,
  outputBlobs: null,
  outputFilenames: null,
  
  addFiles: (newFiles: File[]) => set((state) => {
    const newItems = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    return { files: [...state.files, ...newItems], status: 'idle', errorMessage: null, outputBlobs: null, outputFilenames: null };
  }),
  
  removeFile: (id: string) => set((state) => {
    const updatedFiles = state.files.filter(f => f.id !== id);
    return { 
      files: updatedFiles,
      status: state.status === 'done' ? 'idle' : state.status,
      outputBlobs: state.status === 'done' ? null : state.outputBlobs,
      outputFilenames: state.status === 'done' ? null : state.outputFilenames
    };
  }),

  reorderFiles: (fromIndex: number, toIndex: number) => set((state) => {
    const updated = [...state.files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return { 
      files: updated,
      // Optional: Since order changes output, we probably want to reset 'done' state to 'idle'
      // so the user knows they need to re-run the tool for the new order to apply.
      status: state.status === 'done' ? 'idle' : state.status,
      outputBlobs: state.status === 'done' ? null : state.outputBlobs,
      outputFilenames: state.status === 'done' ? null : state.outputFilenames
    };
  }),

  clearFiles: () => set({ files: [] }),

  setActiveTool: (toolId: string) => set(() => {
    // We do NOT clear files here anymore (just processing states)
    return {
      activeTool: toolId,
      status: 'idle',
      errorMessage: null,
      outputBlobs: null,
      outputFilenames: null
    };
  }),
  
  setStatus: (status: MergeStatus) => set({ status }),
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
  
  setOutputs: (blobs: Blob[] | null, filenames: string[] | null) => set({ 
    outputBlobs: blobs, 
    outputFilenames: filenames 
  }),
  
  resetProcessingState: () => set({ status: 'idle', errorMessage: null, outputBlobs: null, outputFilenames: null })
}));
