import { Sidebar } from '../sidebar/Sidebar';
import { ToolWorkspace } from '../workspace/ToolWorkspace';
import { PreviewPanel } from '../preview/PreviewPanel';
import { DownloadAction } from '../preview/DownloadAction';
import { usePDFStore } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';

export function AppLayout() {
  const status = usePDFStore(state => state.status);
  const activeToolId = usePDFStore(state => state.activeTool);
  
  const activeToolDef = TOOL_REGISTRY.find(t => t.id === activeToolId);
  
  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden text-gray-800 font-sans">
      
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Canvas */}
      <main className="flex-grow flex flex-col p-8 bg-gray-50 max-w-4xl mx-auto h-full overflow-hidden">
        <header className="mb-8 pl-4">
          <h2 className="text-2xl font-bold text-gray-800">{activeToolDef?.name || 'Tool'}</h2>
          <p className="text-gray-500 mt-1">{activeToolDef?.description}</p>
        </header>

        {/* Remount whenever activeToolId changes to isolate state properly */}
        <ToolWorkspace key={activeToolId} />
      </main>

      {/* Right Panel */}
      <aside className="w-80 bg-white border-l border-gray-200 flex-shrink-0 p-6 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        {status === 'done' ? (
          <>
            <h3 className="text-lg font-bold mb-4">Output Result</h3>
            <PreviewPanel />
            <DownloadAction />
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl rotate-45">✨</span>
            </div>
            <p>Your result preview</p>
            <p className="text-sm">will appear here.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
