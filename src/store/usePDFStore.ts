import { create } from 'zustand'

export interface PDFFileItem {
  id: string
  file: File
}

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error'
export type StepStatus = 'pending' | 'running' | 'done' | 'error'

export type RecipeStep = {
  id: string
  toolId: string
  options: Record<string, unknown>
}

export type Recipe = {
  id: string
  name: string
  steps: RecipeStep[]
}

interface PDFStore {
  files: PDFFileItem[]
  activeRecipe: Recipe
  status: PipelineStatus
  stepStatuses: Record<string, StepStatus>
  stepErrors: Record<string, string>
  intermediateOutputs: Record<string, File[]>
  errorMessage: string | null
  outputBlobs: Blob[] | null
  outputFilenames: string[] | null
  
  // File Actions
  addFiles: (newFiles: File[]) => void
  removeFile: (id: string) => void
  reorderFiles: (fromIndex: number, toIndex: number) => void
  clearFiles: () => void
  
  // Recipe Actions
  setRecipeName: (name: string) => void
  addStep: (toolId: string, defaultOptions?: Record<string, unknown>) => void
  removeStep: (stepId: string) => void
  duplicateStep: (stepId: string) => void
  reorderSteps: (fromIndex: number, toIndex: number) => void
  updateStepOptions: (stepId: string, options: Partial<Record<string, unknown>>) => void
  loadRecipe: (recipe: Partial<Recipe>, toolRegistry: any[]) => void
  
  // Pipeline Actions
  setStatus: (status: PipelineStatus) => void
  setStepStatus: (stepId: string, status: StepStatus) => void
  setStepError: (stepId: string, error: string | null) => void
  setIntermediateOutput: (stepId: string, files: File[]) => void
  setErrorMessage: (msg: string | null) => void
  setOutputs: (blobs: Blob[] | null, filenames: string[] | null) => void
  resetProcessingState: () => void
}

export const usePDFStore = create<PDFStore>((set) => ({
  files: [],
  activeRecipe: {
    id: crypto.randomUUID(),
    name: 'Untitled Recipe',
    steps: []
  },
  status: 'idle',
  stepStatuses: {},
  stepErrors: {},
  intermediateOutputs: {},
  errorMessage: null,
  outputBlobs: null,
  outputFilenames: null,
  
  addFiles: (newFiles: File[]) => set((state) => {
    const newItems = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    return { 
      files: [...state.files, ...newItems], 
      status: 'idle', 
      errorMessage: null, 
      outputBlobs: null, 
      outputFilenames: null,
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),
  
  removeFile: (id: string) => set((state) => {
    const updatedFiles = state.files.filter(f => f.id !== id);
    return { 
      files: updatedFiles,
      status: 'idle',
      outputBlobs: null,
      outputFilenames: null,
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),

  reorderFiles: (fromIndex: number, toIndex: number) => set((state) => {
    const updated = [...state.files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return { 
      files: updated,
      status: 'idle',
      outputBlobs: null,
      outputFilenames: null,
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),

  clearFiles: () => set({ 
    files: [], 
    status: 'idle', 
    outputBlobs: null, 
    outputFilenames: null,
    stepStatuses: {},
    stepErrors: {},
    intermediateOutputs: {}
  }),

  setRecipeName: (name: string) => set((state) => ({
    activeRecipe: { ...state.activeRecipe, name }
  })),

  addStep: (toolId: string, defaultOptions = {}) => set((state) => {
    const newStep: RecipeStep = {
      id: crypto.randomUUID(),
      toolId,
      options: defaultOptions
    };
    return {
      activeRecipe: {
        ...state.activeRecipe,
        steps: [...state.activeRecipe.steps, newStep]
      },
      status: 'idle'
    };
  }),

  removeStep: (stepId: string) => set((state) => {
    const steps = state.activeRecipe.steps.filter(s => s.id !== stepId);
    
    // Invalidate everything if a step is removed to be safe
    return {
      activeRecipe: { ...state.activeRecipe, steps },
      status: 'idle',
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),

  duplicateStep: (stepId: string) => set((state) => {
    const index = state.activeRecipe.steps.findIndex(s => s.id === stepId);
    if (index === -1) return state;
    
    const stepToCopy = state.activeRecipe.steps[index];
    const newStep: RecipeStep = {
      ...stepToCopy,
      id: crypto.randomUUID(),
      options: JSON.parse(JSON.stringify(stepToCopy.options))
    };
    
    const steps = [...state.activeRecipe.steps];
    steps.splice(index + 1, 0, newStep);
    
    return {
      activeRecipe: { ...state.activeRecipe, steps },
      status: 'idle',
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),

  reorderSteps: (fromIndex: number, toIndex: number) => set((state) => {
    const steps = [...state.activeRecipe.steps];
    const [moved] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, moved);
    
    return {
      activeRecipe: { ...state.activeRecipe, steps },
      status: 'idle',
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),

  updateStepOptions: (stepId: string, options: Partial<Record<string, unknown>>) => set((state) => {
    const stepIndex = state.activeRecipe.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return state;

    const newSteps = state.activeRecipe.steps.map((step, index) => {
      if (index === stepIndex) {
        return { ...step, options: { ...step.options, ...options } };
      }
      return step;
    });

    // Cache Invalidation Logic:
    // When a step's options change, invalidate that step's cached output and all subsequent steps' outputs.
    const newIntermediateOutputs = { ...state.intermediateOutputs };
    const newStepStatuses = { ...state.stepStatuses };
    const newStepErrors = { ...state.stepErrors };

    for (let i = stepIndex; i < state.activeRecipe.steps.length; i++) {
      const id = state.activeRecipe.steps[i].id;
      delete newIntermediateOutputs[id];
      delete newStepStatuses[id];
      delete newStepErrors[id];
    }

    return {
      activeRecipe: { ...state.activeRecipe, steps: newSteps },
      intermediateOutputs: newIntermediateOutputs,
      stepStatuses: newStepStatuses,
      stepErrors: newStepErrors,
      status: 'idle'
    };
  }),

  loadRecipe: (recipe: Partial<Recipe>, toolRegistry: any[]) => set(() => {
    // Merge saved options with current defaultOptions
    const validatedSteps = (recipe.steps || []).map(step => {
      const tool = toolRegistry.find(t => t.id === step.toolId);
      const defaults = tool?.defaultOptions || {};
      return {
        ...step,
        id: step.id || crypto.randomUUID(),
        options: { ...defaults, ...step.options }
      };
    }).filter(step => toolRegistry.some(t => t.id === step.toolId)); // Skip unknown tools

    return {
      activeRecipe: {
        id: recipe.id || crypto.randomUUID(),
        name: recipe.name || 'Untitled Recipe',
        steps: validatedSteps
      },
      status: 'idle',
      stepStatuses: {},
      stepErrors: {},
      intermediateOutputs: {}
    };
  }),
  
  setStatus: (status: PipelineStatus) => set({ status }),
  
  setStepStatus: (stepId: string, status: StepStatus) => set((state) => ({
    stepStatuses: { ...state.stepStatuses, [stepId]: status }
  })),

  setStepError: (stepId: string, error: string | null) => set((state) => {
    const newErrors = { ...state.stepErrors };
    if (error === null) {
      delete newErrors[stepId];
    } else {
      newErrors[stepId] = error;
    }
    return { stepErrors: newErrors };
  }),

  setIntermediateOutput: (stepId: string, files: File[]) => set((state) => ({
    intermediateOutputs: { ...state.intermediateOutputs, [stepId]: files }
  })),
  
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
  
  setOutputs: (blobs: Blob[] | null, filenames: string[] | null) => set({ 
    outputBlobs: blobs, 
    outputFilenames: filenames 
  }),
  
  resetProcessingState: () => set({ 
    status: 'idle', 
    errorMessage: null, 
    outputBlobs: null, 
    outputFilenames: null,
    stepStatuses: {},
    stepErrors: {},
    intermediateOutputs: {}
  })
}));
