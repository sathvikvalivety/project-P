import { Loader2, GitMerge } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';

export function MergeWorkspace() {
  const files = usePDFStore(state => state.files);
  const status = usePDFStore(state => state.status);
  
  const setStatus = usePDFStore(state => state.setStatus);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);
  const setOutputs = usePDFStore(state => state.setOutputs);

  const toolDef = TOOL_REGISTRY.find(t => t.id === 'pdf-merge');

  // Filter valid files
  const validFiles = files.filter(f => Object.keys(toolDef!.accept).includes(f.file.type));

  const handleExecute = async () => {
    if (validFiles.length < 2) return;
    
    setStatus('running');
    setErrorMessage(null);
    setOutputs(null, null);

    try {
      const fileObjects = validFiles.map(f => f.file);
      const mergedPdfBytes = await toolDef!.execute(fileObjects, {}) as Uint8Array;
      
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const filename = `merged-${new Date().toISOString().split('T')[0]}.pdf`;
      
      setOutputs([blob], [filename]);
      setStatus('done');
    } catch (error: any) {
      console.error("Execute failed:", error);
      setErrorMessage(error.message || "An unknown error occurred.");
      setStatus('error');
    }
  };

  const isReady = validFiles.length >= 2;
  const isRunning = status === 'running';

  return (
    <div>
      {status === 'idle' && validFiles.length > 0 && validFiles.length < 2 && (
        <p className="text-center text-sm text-gray-500 mb-3">
          Add at least 2 PDF files to merge
        </p>
      )}
      <button
        onClick={handleExecute}
        disabled={!isReady || isRunning}
        className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-sm
          ${(!isReady || isRunning) 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:transform active:scale-[0.99]'}`}
      >
        {isRunning ? (
          <>
            <Loader2 className="animate-spin mr-2" size={24} />
            Merging PDFs...
          </>
        ) : (
          <>
            <GitMerge className="mr-2" size={24} />
            Merge {validFiles.length} PDFs
          </>
        )}
      </button>
    </div>
  );
}
