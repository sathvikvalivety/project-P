import { useState } from 'react';
import { Loader2, Scissors } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';

export function SplitWorkspace() {
  const files = usePDFStore(state => state.files);
  const status = usePDFStore(state => state.status);
  
  const setStatus = usePDFStore(state => state.setStatus);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);
  const setOutputs = usePDFStore(state => state.setOutputs);

  const [ranges, setRanges] = useState("");

  const toolDef = TOOL_REGISTRY.find(t => t.id === 'pdf-split');
  const validFiles = files.filter(f => Object.keys(toolDef!.accept).includes(f.file.type));

  const handleExecute = async () => {
    if (validFiles.length !== 1 || !ranges.trim()) return;
    
    setStatus('running');
    setErrorMessage(null);
    setOutputs(null, null);

    try {
      const fileObjects = [validFiles[0].file];
      // Note: any notices from parsing are not easily surfaced here since execute abstracts it,
      // but the tool executes normalize on reversed ranges silently as requested.
      const splitPdfBytesArray = await toolDef!.execute(fileObjects, { ranges }) as Uint8Array[];
      
      const blobs: Blob[] = [];
      const filenames: string[] = [];
      
      splitPdfBytesArray.forEach((bytes, index) => {
        blobs.push(new Blob([bytes as any], { type: 'application/pdf' }));
        const baseName = validFiles[0].file.name.replace(/\.pdf$/i, '');
        filenames.push(`${baseName}-split-${index + 1}.pdf`);
      });
      
      setOutputs(blobs, filenames);
      setStatus('done');
    } catch (error: any) {
      console.error("Execute failed:", error);
      setErrorMessage(error.message || "An unknown error occurred.");
      setStatus('error');
    }
  };

  const isReady = validFiles.length === 1 && ranges.trim().length > 0;
  const isRunning = status === 'running';

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pages to Extract
        </label>
        <input
          type="text"
          value={ranges}
          onChange={e => setRanges(e.target.value)}
          placeholder="e.g., 1-3, 5, 8-10"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Note: Reversed ranges (like 5-2) will be automatically normalized to 2-5.
        </p>
      </div>

      <div>
        {status === 'idle' && validFiles.length !== 1 && (
          <p className="text-center text-sm text-gray-500 mb-3">
            Please add exactly 1 PDF file to split.
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
              Splitting PDF...
            </>
          ) : (
            <>
              <Scissors className="mr-2" size={24} />
              Split PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
