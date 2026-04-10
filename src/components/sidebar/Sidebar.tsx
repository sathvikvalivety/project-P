import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { TOOL_REGISTRY } from '../../tools/registry';
import { CategoryGroup } from './CategoryGroup';

export function Sidebar() {
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    if (!search.trim()) return TOOL_REGISTRY;
    const lower = search.toLowerCase();
    return TOOL_REGISTRY.filter(t => 
      t.name.toLowerCase().includes(lower) || 
      t.description.toLowerCase().includes(lower)
    );
  }, [search]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    filteredTools.forEach(t => cats.add(t.category));
    return Array.from(cats);
  }, [filteredTools]);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
          PDF
        </div>
        <h1 className="font-bold text-lg tracking-tight">Toolkit Suite</h1>
      </div>
      
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto px-4 pb-6 custom-scrollbar space-y-2">
        {categories.map(cat => (
          <CategoryGroup 
            key={cat} 
            category={cat} 
            tools={filteredTools.filter(t => t.category === cat)} 
          />
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-6">No tools found.</p>
        )}
      </div>
    </aside>
  );
}
