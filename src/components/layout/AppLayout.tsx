import { useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ToolWorkspace } from '../workspace/ToolWorkspace';
import { PreviewPanel } from '../preview/PreviewPanel';
import { DownloadAction } from '../preview/DownloadAction';
import { usePDFStore } from '../../store/usePDFStore';
import { Menu, PanelRight, X } from 'lucide-react';

export function AppLayout() {
  const status = usePDFStore(state => state.status);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  
  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-gray-50 overflow-hidden text-gray-800 font-sans">
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-30 flex-shrink-0">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
            <span className="text-sm font-black">P</span>
          </div>
          <h1 className="text-base font-black tracking-tighter text-gray-800">PDF TOOLKIT</h1>
        </div>
        <button onClick={() => setIsOutputOpen(true)} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors relative">
          <PanelRight size={24} />
          {status === 'done' && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </header>

      {/* Left Sidebar Drawer / Desktop Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Center Canvas */}
      <main className="flex-grow flex flex-col p-4 lg:p-8 bg-gray-50 max-w-5xl mx-auto h-full w-full overflow-hidden">
        <ToolWorkspace />
      </main>

      {/* Right Panel Drawer / Desktop Panel */}
      {isOutputOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOutputOpen(false)}
        />
      )}
      <aside className={`
        fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOutputOpen ? 'translate-x-0' : 'translate-x-full'}
        w-[85vw] max-w-sm sm:w-96 lg:w-80 bg-white lg:border-l border-gray-200 flex-shrink-0 p-6 flex flex-col h-full shadow-2xl lg:shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.03)]
      `}>
        {/* Mobile close button for right panel */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h3 className="text-xl font-black tracking-tight">Output Result</h3>
          <button 
            onClick={() => setIsOutputOpen(false)}
            className="p-2 -mr-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {status === 'done' ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="hidden lg:block text-xl font-black mb-6 tracking-tight">Output Result</h3>
            <PreviewPanel />
            <div className="mt-auto">
              <DownloadAction />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-300">
            <div className="w-24 h-24 bg-gray-50 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl grayscale opacity-30">✨</span>
            </div>
            <p className="font-bold text-gray-400 capitalize">Ready for results</p>
            <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-50">Run sequence to preview</p>
          </div>
        )}
      </aside>
    </div>
  );
}
