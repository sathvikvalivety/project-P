import { create } from 'zustand';
import { temporal } from 'zundo';
import { setFile, removeFileFromMap, clearFilesFromMap } from './fileStore';

export type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  hash: string;
  pageCount?: number;
  dimensions?: { w: number; h: number };
};

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';
export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export type RecipeStep = {
  id: string;
  toolId: string;
  options: Record<string, unknown>;
};

export type Recipe = {
  id: string;
  name: string;
  steps: RecipeStep[];
};

interface PDFStore {
  files: FileMetadata[];
  activeRecipe: Recipe;
  status: PipelineStatus;
  stepStatuses: Record<string, StepStatus>;
  stepErrors: Record<string, string>;
  intermediateOutputs: Record<string, File[]>;
  errorMessage: string | null;
  outputBlobs: Blob[] | null;
  outputFilenames: string[] | null;
  lastActionLabel: string | null;
  
  // File Actions
  addFiles: (newFiles: FileMetadata[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  clearFiles: () => void;
  updateFileMetadata: (id: string, updates: Partial<FileMetadata>) => void;
  
  // Recipe Actions
  setRecipeName: (name: string) => void;
  addStep: (toolId: string, toolName: string, defaultOptions?: Record<string, unknown>) => void;
  removeStep: (stepId: string, toolName?: string) => void;
  duplicateStep: (stepId: string, toolName?: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  updateStepOptions: (stepId: string, toolName: string, options: Partial<Record<string, unknown>>) => void;
  loadRecipe: (recipe: Partial<Recipe>, toolRegistry: any[]) => void;
  loadTemplate: (template: Partial<Recipe>, toolRegistry: any[], force?: boolean) => void;
  
  // Pipeline Actions
  setStatus: (status: PipelineStatus) => void;
  setStepStatus: (stepId: string, status: StepStatus) => void;
  setStepError: (stepId: string, error: string | null) => void;
  setIntermediateOutput: (stepId: string, files: File[]) => void;
  setErrorMessage: (msg: string | null) => void;
  setOutputs: (blobs: Blob[] | null, filenames: string[] | null) => void;
  resetProcessingState: () => void;
}

export const usePDFStore = create<PDFStore>()(
  temporal(
    (set, get) => ({
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
      lastActionLabel: null,
      
      addFiles: (newFiles: FileMetadata[]) => set((state) => {
        return { 
          files: [...state.files, ...newFiles], 
          status: 'idle', 
          errorMessage: null, 
          outputBlobs: null, 
          outputFilenames: null,
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Add ${newFiles.length} file(s)`
        };
      }),
      
      removeFile: (id: string) => set((state) => {
        const fileToRemove = state.files.find(f => f.id === id);
        const updatedFiles = state.files.filter(f => f.id !== id);
        removeFileFromMap(id);
        return { 
          files: updatedFiles,
          status: 'idle',
          outputBlobs: null,
          outputFilenames: null,
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Remove ${fileToRemove?.name || 'file'}`
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
          intermediateOutputs: {},
          lastActionLabel: `Reorder files`
        };
      }),

      clearFiles: () => {
        clearFilesFromMap();
        set({ 
          files: [], 
          status: 'idle', 
          outputBlobs: null, 
          outputFilenames: null,
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Clear all files`
        });
      },

      updateFileMetadata: (id: string, updates: Partial<FileMetadata>) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, ...updates } : f)
        // Does not set lastActionLabel because metadata update is usually background
      })),

      setRecipeName: (name: string) => set((state) => ({
        activeRecipe: { ...state.activeRecipe, name },
        lastActionLabel: `Rename recipe to ${name}`
      })),

      addStep: (toolId: string, toolName: string, defaultOptions = {}) => set((state) => {
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
          status: 'idle',
          lastActionLabel: `Add ${toolName} step`
        };
      }),

      removeStep: (stepId: string, toolName = 'tool') => set((state) => {
        const steps = state.activeRecipe.steps.filter(s => s.id !== stepId);
        return {
          activeRecipe: { ...state.activeRecipe, steps },
          status: 'idle',
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Remove ${toolName} step`
        };
      }),

      duplicateStep: (stepId: string, toolName = 'tool') => set((state) => {
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
          intermediateOutputs: {},
          lastActionLabel: `Duplicate ${toolName} step`
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
          intermediateOutputs: {},
          lastActionLabel: `Reorder steps`
        };
      }),

      updateStepOptions: (stepId: string, toolName: string, options: Partial<Record<string, unknown>>) => set((state) => {
        const stepIndex = state.activeRecipe.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return state;

        const newSteps = state.activeRecipe.steps.map((step, index) => {
          if (index === stepIndex) {
            return { ...step, options: { ...step.options, ...options } };
          }
          return step;
        });

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
          status: 'idle',
          lastActionLabel: `Edit ${toolName} options`
        };
      }),

      loadRecipe: (recipe: Partial<Recipe>, toolRegistry: any[]) => set(() => {
        const validatedSteps = (recipe.steps || []).map(step => {
          const tool = toolRegistry.find(t => t.id === step.toolId);
          const defaults = tool?.defaultOptions || {};
          return {
            ...step,
            id: step.id || crypto.randomUUID(),
            options: { ...defaults, ...step.options }
          };
        }).filter(step => toolRegistry.some(t => t.id === step.toolId));

        return {
          activeRecipe: {
            id: recipe.id || crypto.randomUUID(),
            name: recipe.name || 'Untitled Recipe',
            steps: validatedSteps
          },
          status: 'idle',
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Load recipe ${recipe.name || ''}`
        };
      }),

      loadTemplate: (template: Partial<Recipe>, toolRegistry: any[], force?: boolean) => {
        const state = get();
        if (!force && state.activeRecipe.steps.length > 0) {
          if (!window.confirm("Loading this template will replace your current recipe. Continue?")) {
            return;
          }
        }
        
        const validatedSteps = (template.steps || []).map(step => {
          const tool = toolRegistry.find(t => t.id === step.toolId);
          const defaults = tool?.defaultOptions || {};
          return {
            ...step,
            id: step.id || crypto.randomUUID(),
            options: { ...defaults, ...step.options }
          };
        }).filter(step => toolRegistry.some(t => t.id === step.toolId));

        set({
          activeRecipe: {
            id: crypto.randomUUID(),
            name: template.name || 'Template Recipe',
            steps: validatedSteps
          },
          status: 'idle',
          stepStatuses: {},
          stepErrors: {},
          intermediateOutputs: {},
          lastActionLabel: `Load template ${template.name || ''}`
        });
      },
      
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
    }),
    {
      partialize: (state) => ({
        files: state.files,
        activeRecipe: state.activeRecipe,
        lastActionLabel: state.lastActionLabel
      }),
      limit: 50,
      equality: (pastState, currentState) => {
        // Simple optimization to avoid tracking identical states if partialize output matches
        return JSON.stringify(pastState) === JSON.stringify(currentState);
      }
    }
  )
);
