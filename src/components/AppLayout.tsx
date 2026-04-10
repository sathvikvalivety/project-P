import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { MergeAction } from './MergeAction';
import { PreviewPanel } from './PreviewPanel';
import { DownloadButton } from './DownloadButton';
import { usePDFStore } from '../store/usePDFStore';

export function AppLayout() {
  const status = usePDFStore(state => state.status);
  
  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden text-gray-800 font-sans">
      
      {/* Left Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col items-center py-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
          PDF
        </div>
        <h1 className="font-bold text-lg tracking-tight">Merge Tool</h1>
        {/* Placeholder for future tools */}
      </aside>

      {/* Center Canvas */}
      <main className="flex-grow flex flex-col p-8 bg-gray-50 max-w-4xl mx-auto h-full overflow-hidden">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Combine PDFs</h2>
          <p className="text-gray-500 mt-1">Drop multiple PDF files below to merge them into a single document.</p>
        </header>

        <div className="flex flex-col flex-grow min-h-0">
          <DropZone />
          <FileList />
          <MergeAction />
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-80 bg-white border-l border-gray-200 flex-shrink-0 p-6 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        {status === 'done' ? (
          <>
            <h3 className="text-lg font-bold mb-4">Output Result</h3>
            <PreviewPanel />
            <DownloadButton />
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl rotate-45">📄</span>
            </div>
            <p>Your merged PDF preview</p>
            <p className="text-sm">will appear here.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
