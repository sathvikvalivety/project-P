import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { type ToolDefinition } from '../../tools/registry';

interface CategoryGroupProps {
  category: string;
  tools: ToolDefinition[];
}

export function CategoryGroup({ category, tools }: CategoryGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`collapse-cat-${category}`);
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, [category]);

  const toggle = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem(`collapse-cat-${category}`, newVal.toString());
  };

  if (tools.length === 0) return null;

  return (
    <div className="mb-4">
      <button 
        onClick={toggle}
        className="flex items-center w-full text-left px-2 py-1 mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
      >
        {isCollapsed ? <ChevronRight size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
        {category}
      </button>
      
      {!isCollapsed && (
        <div className="space-y-1">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
