import { useState } from 'react';
import { Loader2, Minimize } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';
import { TOOL_REGISTRY } from '../../tools/registry';
import { formatBytes } from '../../utils/formatBytes';

export function CompressWorkspace() {
  const files = usePDFStore(state => state.files);
  const status = usePDFStore(state => state.status);
  const outputBlobs = usePDFStore(state => state.outputBlobs);
  
  const setStatus = usePDFStore(state => state.setStatus);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);
  const setOutputs = usePDFStore(state => state.setOutputs);

  const [deepMode, setDeepMode] = useState(false);
  const [quality, setQuality] = useState(60);

  const toolDef = TOOL_REGISTRY.find(t => t.id === 'pdf-compress');
  const validFiles = files.filter(f => Object.keys(toolDef!.accept).includes(f.file.type));

  const handleExecute = async () => {
    if (validFiles.length !== 1) return;
    
    setStatus('running');
    setErrorMessage(null);
    setOutputs(null, null);

    try {
      const fileObjects = [validFiles[0].file];
      const compressedBytes = await toolDef!.execute(fileObjects, { deepMode, quality }) as Uint8Array;
      
      const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });
      const filename = `compressed-${validFiles[0].file.name}`;
      
      setOutputs([blob], [filename]);
      setStatus('done');
    } catch (error: any) {
      console.error("Execute failed:", error);
      setErrorMessage(error.message || "An unknown error occurred.");
      setStatus('error');
    }
  };

  const isReady = validFiles.length === 1;
  const isRunning = status === 'running';

  // Calculate sizes for warnings
  const originalSize = validFiles.length === 1 ? validFiles[0].file.size : 0;
  const outputSize = outputBlobs && outputBlobs.length > 0 ? outputBlobs[0].size : 0;
  
  const isLarger = status === 'done' && outputSize > originalSize;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className="flex items-center space-x-3 mb-4 cursor-pointer">
          <input 
            type="checkbox" 
            checked={deepMode}
            onChange={(e) => setDeepMode(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <div>
            <p className="font-semibold text-gray-700">Deep Compression Mode</p>
            <p className="text-xs text-gray-500">Converts pages to images, removes selectable text.</p>
          </div>
        </label>
        
        {deepMode && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
              <span>Quality Factor</span>
              <span>{quality}%</span>
            </label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">
              Estimated: ~{formatBytes(originalSize * (quality / 100))}
            </p>
          </div>
        )}
      </div>

      {isLarger && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          <strong>Warning:</strong> The compressed output ({formatBytes(outputSize)}) is larger than the original ({formatBytes(originalSize)}). Deep compression on text-heavy files can increase size.
        </div>
      )}

      <div>
        {status === 'idle' && validFiles.length !== 1 && (
          <p className="text-center text-sm text-gray-500 mb-3">
            Please add exactly 1 PDF file to compress.
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
              Compressing PDF...
            </>
          ) : (
            <>
              <Minimize className="mr-2" size={24} />
              Compress PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
