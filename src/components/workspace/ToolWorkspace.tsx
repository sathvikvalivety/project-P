import { useState, useEffect } from 'react';
import { usePDFStore } from '../../store/usePDFStore';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { RecipeStrip } from '../recipe/RecipeStrip';
import { StepOptionsPanel } from '../recipe/StepOptionsPanel';
import { RecipeToolbar } from '../recipe/RecipeToolbar';
import { EmptyState } from '../recipe/EmptyState';
import { runPipeline } from '../../tools/pipeline';
import { Loader2, Play, AlertCircle, Sparkles } from 'lucide-react';
import { decodeRecipe } from '../../utils/encodeRecipe';
import { TOOL_REGISTRY } from '../../tools/registry';

export function ToolWorkspace() {
  const recipe = usePDFStore(state => state.activeRecipe);
  const files = usePDFStore(state => state.files);
  const status = usePDFStore(state => state.status);
  const errorMessage = usePDFStore(state => state.errorMessage);
  const loadRecipe = usePDFStore(state => state.loadRecipe);

  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showShareBanner, setShowShareBanner] = useState(false);

  // Handle URL share links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('recipe');
    const hasBeenLoaded = sessionStorage.getItem('sharedRecipeLoaded');

    if (encoded && !hasBeenLoaded) {
      const decoded = decodeRecipe(encoded);
      if (decoded) {
        // Hydrate the recipe into the store
        loadRecipe(decoded, TOOL_REGISTRY);
        setShowShareBanner(true);
        sessionStorage.setItem('sharedRecipeLoaded', 'true');
        
        // Clean URL without reloading page
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [loadRecipe]);

  const handleRun = () => {
    if (files.length === 0 || recipe.steps.length === 0) return;
    const fileObjects = files.map(f => f.file);
    runPipeline(fileObjects, recipe);
  };

  const isRunning = status === 'running';
  const hasSteps = recipe.steps.length > 0;
  const hasFiles = files.length > 0;

  const activeStep = recipe.steps.find(s => s.id === activeStepId);

  return (
    <div className="flex flex-col flex-grow min-h-0 space-y-6">
      {/* Share Banner */}
      {showShareBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-100 animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles size={20} className="text-blue-100" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight leading-none">Shared Workflow Loaded</p>
              <p className="text-xs text-blue-100 mt-1 font-medium opacity-80">"{recipe.name}" is ready for your files.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowShareBanner(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
            title="Dismiss"
          >
            <AlertCircle size={20} className="rotate-45 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      <RecipeToolbar />

      <div className="flex-grow flex flex-col min-h-0 space-y-8 overflow-y-auto no-scrollbar pb-12 pr-1">
        <DropZone />
        {hasFiles && <FileList />}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Workflow Pipeline</h3>
              {isRunning && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </div>
            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter">
              {recipe.steps.length} {recipe.steps.length === 1 ? 'Step' : 'Steps'}
            </span>
          </div>
          
          {hasSteps ? (
            <div className="space-y-2">
              <RecipeStrip 
                activeStepId={activeStepId} 
                onSetActiveStep={setActiveStepId} 
              />
              {activeStep && <StepOptionsPanel step={activeStep} />}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Global Run Button */}
        {hasSteps && (
          <div className="pt-4 sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pb-4">
            <button
              onClick={handleRun}
              disabled={!hasFiles || isRunning}
              className={`w-full py-5 rounded-3xl flex items-center justify-center font-black text-xl transition-all duration-300 group
                ${(!hasFiles || isRunning) 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-200/50 hover:shadow-blue-300/60 active:scale-[0.98]'}`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={24} strokeWidth={3} />
                  Executing Chain...
                </>
              ) : (
                <>
                  <Play className={`mr-3 transition-transform duration-300 ${hasFiles ? 'group-hover:translate-x-1' : ''}`} size={24} fill="currentColor" strokeWidth={3} />
                  Run Recipe Workflow
                </>
              )}
            </button>
            {!hasFiles && (
              <p className="text-center text-[10px] font-black text-amber-500 mt-4 uppercase tracking-widest bg-amber-50 py-2 rounded-xl border border-amber-100">
                Drop files at the top to process this recipe
              </p>
            )}
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="p-6 rounded-[2rem] bg-red-50 border border-red-100 text-red-700 animate-in shake duration-500">
             <div className="flex items-center gap-3 mb-3">
               <div className="bg-red-100 p-2 rounded-xl text-red-600">
                 <AlertCircle size={20} />
               </div>
               <p className="font-black uppercase tracking-tight text-lg">Process Aborted</p>
             </div>
             <p className="font-bold opacity-80 leading-relaxed text-sm bg-white/50 p-4 rounded-2xl border border-red-100/50">
               {errorMessage}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
