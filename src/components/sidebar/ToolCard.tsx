import { usePDFStore } from '../../store/usePDFStore';
import { type ToolDefinition } from '../../tools/registry';

interface ToolCardProps {
  tool: ToolDefinition;
}

export function ToolCard({ tool }: ToolCardProps) {
  const activeTool = usePDFStore(state => state.activeTool);
  const setActiveTool = usePDFStore(state => state.setActiveTool);

  const isActive = activeTool === tool.id;

  return (
    <button
      onClick={() => setActiveTool(tool.id)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors border ${
        isActive 
          ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' 
          : 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="font-semibold text-sm">{tool.name}</div>
      <div className={`text-xs mt-0.5 truncate ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
        {tool.description}
      </div>
    </button>
  );
}
