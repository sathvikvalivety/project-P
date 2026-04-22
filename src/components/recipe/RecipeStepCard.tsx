import { Settings, Copy, X, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePDFStore, type RecipeStep } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';

export function RecipeStepCard({ 
  step, 
  index, 
  isActive, 
  onToggleSettings,
  isLast 
}: { 
  step: RecipeStep, 
  index: number,
  isActive: boolean,
  onToggleSettings: () => void,
  isLast: boolean
}) {
  const tool = TOOL_REGISTRY.find(t => t.id === step.toolId);
  const status = usePDFStore(state => state.stepStatuses[step.id] || 'pending');
  const removeStep = usePDFStore(state => state.removeStep);
  const duplicateStep = usePDFStore(state => state.duplicateStep);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1
  };

  const renderStatus = () => {
    switch (status) {
      case 'running':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      case 'done':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-200" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <div 
        className={`relative w-40 h-24 p-3 rounded-xl border-2 transition-all duration-200 bg-white flex flex-col justify-between shadow-sm group
          ${isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'}`}
      >
        {/* Status Indicator */}
        <div className="absolute top-2 right-2">
          {renderStatus()}
        </div>

        {/* Drag Handle & Name */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-grow">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Step {index + 1}</p>
          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight pr-4">
            {tool?.name || 'Unknown Tool'}
          </h4>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSettings(); }}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            title="Step Settings"
          >
            <Settings size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); duplicateStep(step.id); }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            title="Duplicate Step"
          >
            <Copy size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto opacity-0 group-hover:opacity-100"
            title="Remove Step"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Connector Arrow */}
      {!isLast && (
        <div className="px-2 text-gray-300 flex-shrink-0">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
}
