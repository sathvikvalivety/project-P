import { useState, useEffect } from 'react';
import { usePDFStore } from '../../store/usePDFStore';
import { getFile } from '../../store/fileStore';
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
    const fileObjects = files.map(f => getFile(f.id)).filter((f): f is File => f !== undefined);
    runPipeline(fileObjects, recipe);
  };

  const isRunning = status === 'running';
  const hasSteps = recipe.steps.length > 0;
  const hasFiles = files.length > 0;

  const activeStep = recipe.steps.find(s => s.id === activeStepId);

  return (
    <div className="flex flex-col flex-grow min-h-0 space-y-4 relative z-0">
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

      {/* Main Split Layout */}
      <div className="flex-grow flex flex-col lg:flex-row min-h-0 gap-6">
        
        {/* Left Pane: Files Management */}
        <div className="flex flex-col w-full lg:w-[45%] xl:w-[40%] min-h-0 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex-shrink-0 drop-shadow-sm hover:drop-shadow-md transition-all duration-300">
            <DropZone />
          </div>
          {hasFiles && (
            <div className="flex-grow flex flex-col min-h-0 drop-shadow-sm hover:drop-shadow-md transition-all duration-300">
              <FileList />
            </div>
          )}
        </div>

        {/* Right Pane: Workflow Pipeline */}
        <div className="flex flex-col w-full lg:w-[55%] xl:w-[60%] min-h-0 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex-grow animate-in fade-in slide-in-from-right-4 duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow">
          
          <div className="p-4 border-b border-white/60 bg-white/50 backdrop-blur-md">
            <RecipeToolbar />
          </div>

          <div className="flex-grow flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest drop-shadow-sm">Workflow Pipeline</h3>
                {isRunning && <Loader2 size={12} className="animate-spin text-blue-500" />}
              </div>
              <span className="text-[10px] font-black text-gray-500 bg-white shadow-sm border border-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {recipe.steps.length} {recipe.steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>

            {hasSteps ? (
              <div className="space-y-4 flex-grow flex flex-col">
                <div className="flex-shrink-0 drop-shadow-sm">
                  <RecipeStrip
                    activeStepId={activeStepId}
                    onSetActiveStep={setActiveStepId}
                  />
                </div>
                {activeStep && (
                  <div className="flex-grow">
                    <StepOptionsPanel step={activeStep} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-center">
                <EmptyState hasFiles={hasFiles} />
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div className="p-6 rounded-[2rem] bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 animate-in shake duration-500 mt-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-xl text-red-600 shadow-sm">
                    <AlertCircle size={20} />
                  </div>
                  <p className="font-black uppercase tracking-tight text-lg">Process Aborted</p>
                </div>
                <p className="font-bold opacity-80 leading-relaxed text-sm bg-white/70 p-4 rounded-2xl border border-red-100 shadow-inner">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Global Run Button Area */}
          {hasSteps && (
            <div className="p-6 bg-white/60 border-t border-white/80 backdrop-blur-xl relative z-10">
              <button
                onClick={handleRun}
                disabled={!hasFiles || isRunning}
                className={`w-full py-5 rounded-3xl flex items-center justify-center font-black text-xl transition-all duration-500 group relative overflow-hidden
                  ${(!hasFiles || isRunning)
                    ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed shadow-none border border-gray-200/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 active:translate-y-0'}`}
              >
                {/* Button background glow animation */}
                {hasFiles && !isRunning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
                
                {isRunning ? (
                  <>
                    <Loader2 className="animate-spin mr-3 relative z-10" size={24} strokeWidth={3} />
                    <span className="relative z-10">Executing Chain...</span>
                  </>
                ) : (
                  <>
                    <Play className={`mr-3 relative z-10 transition-transform duration-500 ${hasFiles ? 'group-hover:translate-x-1 group-hover:scale-110' : ''}`} size={24} fill="currentColor" strokeWidth={3} />
                    <span className="relative z-10">Run Recipe Workflow</span>
                  </>
                )}
              </button>
              {!hasFiles && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-200 shadow-sm whitespace-nowrap animate-pulse">
                  Drop files to run
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
