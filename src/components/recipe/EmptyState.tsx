import { Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-blue-500">
        <Plus size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Build your recipe</h3>
      <p className="text-gray-500 text-center max-w-sm">
        Add tools from the sidebar to create a powerful workflow. 
        Chain them together to process your documents exactly how you need.
      </p>
      
      <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span>Add tools</span>
        </div>
        <div className="w-8 h-[1px] bg-gray-200"></div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span>Configure</span>
        </div>
        <div className="w-8 h-[1px] bg-gray-200"></div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span>Run</span>
        </div>
      </div>
    </div>
  );
}
