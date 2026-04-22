import { AlertCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { usePDFStore, type RecipeStep } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';

/**
 * StepOptionsPanel
 * Inline expansion component that renders tool-specific configuration controls.
 * Also handles sequence compatibility validation and helpful warnings.
 */
export function StepOptionsPanel({ step }: { step: RecipeStep }) {
  const [showTechnical, setShowTechnical] = useState(false);
  const steps = usePDFStore(state => state.activeRecipe.steps);
  const updateStepOptions = usePDFStore(state => state.updateStepOptions);
  
  const tool = TOOL_REGISTRY.find(t => t.id === step.toolId);
  if (!tool) return null;

  const stepIndex = steps.findIndex(s => s.id === step.id);
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const prevTool = prevStep ? TOOL_REGISTRY.find(t => t.id === prevStep.toolId) : null;

  // Compatibility Logic
  // Initial input is considered 'single-pdf' if it's a PDF tool, or 'image' if first tool is image-to-pdf
  const initialInputType = tool.id === 'image-to-pdf' ? 'image' : 'single-pdf';
  const effectiveInputType = prevTool ? prevTool.outputType : initialInputType;
  
  const isCompatible = tool.acceptsInput.includes(effectiveInputType);

  const getFriendlyWarning = () => {
    if (isCompatible) return null;
    
    if (effectiveInputType === 'multi-pdf' && !tool.acceptsInput.includes('multi-pdf')) {
      return `${tool.name} expects a single PDF, but the previous step outputs multiple files. Try adding a Merge step first.`;
    }
    
    return `This sequence might not work. ${tool.name} typically doesn't follow ${prevTool?.name || 'the current input'}.`;
  };

  return (
    <div className="mt-2 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
              Configuration
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-800 tracking-tight">{tool.name}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mt-1">{tool.description}</p>
        </div>
        
        {!isCompatible && (
          <div className="flex-shrink-0 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 leading-tight">Sequence Warning</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {getFriendlyWarning()}
                </p>
                
                <button 
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="mt-2 text-[10px] font-bold text-amber-600/60 hover:text-amber-600 flex items-center gap-1 transition-colors capitalize"
                >
                  <HelpCircle size={10} />
                  {showTechnical ? 'simple view' : 'technical details'}
                </button>
                
                {showTechnical && (
                  <div className="mt-2 p-3 bg-white/50 rounded-xl border border-amber-100 text-[10px] text-amber-800/70 font-mono leading-tight">
                    Input type "{effectiveInputType}" is not accepted by this tool. <br/>
                    Accepted: [{tool.acceptsInput.join(', ')}]
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-50">
        {/* Tool-specific Options Rendering */}
        {step.toolId === 'pdf-split' && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 tracking-tight ml-1">Pages to Extract</label>
            <div className="relative">
              <input 
                type="text"
                value={(step.options.ranges as string) || ''}
                onChange={(e) => updateStepOptions(step.id, { ranges: e.target.value })}
                placeholder="e.g. 1-3, 5, 8-10"
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-medium"
              />
            </div>
            <p className="text-[11px] text-gray-400 px-1">
              Separate ranges with commas. Use a dash for sequences (e.g., <strong>1-5</strong>).
            </p>
          </div>
        )}

        {step.toolId === 'pdf-compress' && (
          <div className="space-y-6">
            <div 
              className={`p-5 rounded-2xl border transition-all cursor-pointer select-none
                ${step.options.deepMode ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'}`}
              onClick={() => updateStepOptions(step.id, { deepMode: !step.options.deepMode })}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all 
                  ${step.options.deepMode ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                  {Boolean(step.options.deepMode) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </div>
                <div>
                  <span className="block text-[15px] font-bold text-gray-800">Deep Compression Mode</span>
                  <span className="block text-xs text-gray-500 mt-0.5">Converts entire pages to images for significant size reduction.</span>
                </div>
              </div>
            </div>

            {Boolean(step.options.deepMode) && (
              <div className="p-5 bg-white rounded-2xl border border-blue-100/50 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Quality</span>
                    <span className="block text-2xl font-black text-blue-600 leading-none">
                      {(step.options.quality as number) || 60}<span className="text-sm font-bold opacity-50 ml-0.5">%</span>
                    </span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={(step.options.quality as number) || 60}
                  onChange={(e) => updateStepOptions(step.id, { quality: parseInt(e.target.value) })}
                  className="w-full h-2.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5">
                  <span>SMALLEST FILE</span>
                  <span>BEST QUALITY</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for tools without options */}
        {['pdf-merge', 'image-to-pdf'].includes(step.toolId) && (
          <div className="py-10 flex flex-col items-center justify-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm mb-3">
              <Settings size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400 tracking-tight uppercase">Automatic Tool</p>
            <p className="text-xs text-gray-400 mt-1 italic">No configuration required for this step.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Settings } from 'lucide-react';
