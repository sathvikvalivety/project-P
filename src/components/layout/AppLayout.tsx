import { useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ToolWorkspace } from '../workspace/ToolWorkspace';
import { PreviewPanel } from '../preview/PreviewPanel';
import { DownloadAction } from '../preview/DownloadAction';
import { usePDFStore } from '../../store/usePDFStore';
import { Menu, PanelRight, X, Undo2, Redo2, Settings, WifiOff, Download } from 'lucide-react';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

export function AppLayout() {
  const status = usePDFStore(state => state.status);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { isOnline, isSWActive } = useOnlineStatus();
  const { canInstall, showPrompt, dismissPrompt } = useInstallPrompt();

  const pastStates = usePDFStore.temporal.getState().pastStates;
  const futureStates = usePDFStore.temporal.getState().futureStates;
  const undo = usePDFStore.temporal.getState().undo;
  const redo = usePDFStore.temporal.getState().redo;

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;
  const undoLabel = canUndo ? pastStates[pastStates.length - 1].lastActionLabel : '';
  const redoLabel = canRedo ? futureStates[0].lastActionLabel : '';

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 overflow-hidden text-gray-800 font-sans">
      
      {/* Installation Banner */}
      {canInstall && (
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Download size={14} />
            <span>Install DocCraft for a faster, offline experience</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={showPrompt} className="bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">Install</button>
            <button onClick={dismissPrompt} className="opacity-70 hover:opacity-100"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Global Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
              <span className="text-sm font-black">P</span>
            </div>
            <h1 className="text-base font-black tracking-tighter text-gray-800 hidden sm:block">PDF TOOLKIT</h1>
          </div>

          {/* Offline Indicator */}
          {!isOnline && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              isSWActive 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <WifiOff size={12} />
              <span>
                {isSWActive ? 'Offline — All tools work' : 'Offline — Install for access'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo Toolbar */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => undo()}
              disabled={!canUndo}
              title={canUndo ? `Undo: ${undoLabel}` : 'Nothing to undo'}
              className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <Undo2 size={18} />
            </button>
            <div className="w-[1px] h-4 bg-gray-300" />
            <button
              onClick={() => redo()}
              disabled={!canRedo}
              title={canRedo ? `Redo: ${redoLabel}` : 'Nothing to redo'}
              className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="w-[1px] h-6 bg-gray-200 mx-2" />

          {/* Settings Button */}
          <button 
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} />
          </button>

          {/* Mobile Right Panel Toggle */}
          <button onClick={() => setIsOutputOpen(true)} className="lg:hidden p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors relative">
            <PanelRight size={24} />
            {status === 'done' && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-grow min-h-0 relative">
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

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
