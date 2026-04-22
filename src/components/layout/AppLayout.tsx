import { Sidebar } from '../sidebar/Sidebar';
import { ToolWorkspace } from '../workspace/ToolWorkspace';
import { PreviewPanel } from '../preview/PreviewPanel';
import { DownloadAction } from '../preview/DownloadAction';
import { usePDFStore } from '../../store/usePDFStore';

export function AppLayout() {
  const status = usePDFStore(state => state.status);
  
  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden text-gray-800 font-sans">
      
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Canvas */}
      <main className="flex-grow flex flex-col p-8 bg-gray-50 max-w-5xl mx-auto h-full overflow-hidden">
        <ToolWorkspace />
      </main>

      {/* Right Panel */}
      <aside className="w-80 bg-white border-l border-gray-200 flex-shrink-0 p-6 flex flex-col h-full shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.03)] z-20">
        {status === 'done' ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-black mb-6 tracking-tight">Output Result</h3>
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
