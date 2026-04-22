import { usePDFStore, type Recipe } from '../store/usePDFStore';
import { TOOL_REGISTRY } from './registry';
import { normalizeOutput } from '../utils/normalizeOutput';

/**
 * Pipeline Execution Engine
 * Iterates through recipe steps, executes tools sequentially,
 * manages intermediate outputs, and updates progress statuses.
 */
export async function runPipeline(files: File[], recipe: Recipe) {
  const store = usePDFStore.getState();
  
  // Reset global state for new run if not resuming
  store.setStatus('running');
  store.setErrorMessage(null);
  store.setOutputs(null, null);

  let currentInput: File[] = [...files];

  try {
    for (let i = 0; i < recipe.steps.length; i++) {
      const step = recipe.steps[i];
      
      // Resume Logic: 
      // If step is already 'done' and has cached output, skip execution
      if (store.stepStatuses[step.id] === 'done' && store.intermediateOutputs[step.id]) {
        currentInput = store.intermediateOutputs[step.id];
        continue;
      }

      const tool = TOOL_REGISTRY.find(t => t.id === step.toolId);
      if (!tool) {
        throw new Error(`Registry error: Tool "${step.toolId}" not found.`);
      }

      // Mark step as running
      store.setStepStatus(step.id, 'running');
      store.setStepError(step.id, null);

      try {
        // Execute tool with current input and step-specific options
        const output = await tool.execute(currentInput, step.options);
        
        // Normalize output (Uint8Array | Uint8Array[]) -> File[]
        const outputFiles = normalizeOutput(output, i);
        
        // Update store with intermediate results
        store.setIntermediateOutput(step.id, outputFiles);
        store.setStepStatus(step.id, 'done');
        
        // Pass output of this step as input to the next
        currentInput = outputFiles;
      } catch (error: any) {
        // Mark step as errored and stop the pipeline
        store.setStepStatus(step.id, 'error');
        const msg = error?.message || 'Unexpected error during step execution.';
        store.setStepError(step.id, msg);
        throw new Error(`Step ${i + 1} (${tool.name}) failed: ${msg}`);
      }
    }

    // Pipeline completed successfully
    const finalBlobs = currentInput.map(file => file);
    const finalNames = currentInput.map(file => file.name);
    
    store.setOutputs(finalBlobs, finalNames);
    store.setStatus('done');

  } catch (error: any) {
    // Global error handler
    store.setStatus('error');
    store.setErrorMessage(error.message || 'An unknown error occurred during pipeline execution.');
  }
}
