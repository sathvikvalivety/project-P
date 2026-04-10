import { Loader2, GitMerge } from 'lucide-react';
import { usePDFStore } from '../store/usePDFStore';
import { mergePDFs } from '../tools/pdfMerge';

export function MergeAction() {
  const files = usePDFStore(state => state.files);
  const status = usePDFStore(state => state.status);
  const errorMessage = usePDFStore(state => state.errorMessage);
  
  const setStatus = usePDFStore(state => state.setStatus);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);
  const setOutputBlob = usePDFStore(state => state.setOutputBlob);

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setStatus('running');
    setErrorMessage(null);
    setOutputBlob(null);

    try {
      const fileObjects = files.map(f => f.file);
      const mergedPdfBytes = await mergePDFs(fileObjects);
      
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setStatus('done');
    } catch (error: any) {
      console.error("Merge failed:", error);
      setErrorMessage(error.message || "An unknown error occurred while merging.");
      setStatus('error');
    }
  };

  const isReady = files.length >= 2;
  const isRunning = status === 'running';

  return (
    <div className="mt-auto">
      <button
        onClick={handleMerge}
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
            Merge {files.length} PDFs
          </>
        )}
      </button>

      {status === 'error' && errorMessage && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
          <p className="font-medium mb-1">Merge failed:</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {status === 'idle' && files.length > 0 && files.length < 2 && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Add at least 2 files to merge
        </p>
      )}
    </div>
  );
}
