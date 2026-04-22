import { TOOL_REGISTRY, type ToolCategory } from '../../tools/registry';
import { usePDFStore } from '../../store/usePDFStore';

export function Sidebar() {
  const activeRecipe = usePDFStore(state => state.activeRecipe);
  const files = usePDFStore(state => state.files);
  const addStep = usePDFStore(state => state.addStep);
  
  const categories: ToolCategory[] = ['PDF Tools', 'Image Tools'];

  // Determine the current output type to check compatibility
  const lastStep = activeRecipe.steps.length > 0 ? activeRecipe.steps[activeRecipe.steps.length - 1] : null;
  const lastToolDef = lastStep ? TOOL_REGISTRY.find(t => t.id === lastStep.toolId) : null;
  
  const currentOutputType = lastToolDef 
    ? lastToolDef.outputType 
    : (files.length > 0 && files[0].file.type.startsWith('image/') ? 'image' : 'single-pdf');

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-[4px_0_15px_-3px_rgba(0,0,0,0.02)]">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <span className="text-xl font-black">P</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-gray-800">PDF TOOLKIT</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipe Builder</p>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-8 no-scrollbar">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="px-3 text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">
              {category}
            </h3>
            <div className="space-y-1">
              {TOOL_REGISTRY.filter(t => t.category === category).map(tool => {
                const isCompatible = tool.acceptsInput.includes(currentOutputType);
                
                return (
                  <button
                    key={tool.id}
                    onClick={() => isCompatible && addStep(tool.id, tool.defaultOptions)}
                    disabled={!isCompatible}
                    className={`w-full flex flex-col items-start px-3 py-3 rounded-xl transition-all duration-200 group relative
                      ${isCompatible 
                        ? 'hover:bg-blue-50/50 text-gray-700 hover:text-blue-700' 
                        : 'opacity-40 cursor-not-allowed grayscale'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm tracking-tight">{tool.name}</span>
                      {isCompatible && (
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          +
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 group-hover:text-blue-600/60 leading-tight text-left">
                      {tool.description}
                    </span>
                    
                    {!isCompatible && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/80 rounded-xl">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-100 px-2 py-1 rounded-md shadow-sm">
                          Incompatible
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pro Tip</p>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            Click tools to chain them. Some tools require a Merge step if they follow a Split.
          </p>
        </div>
      </div>
    </aside>
  );
}
