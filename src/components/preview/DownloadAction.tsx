import { useState } from 'react';
import { Download } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';
import { formatBytes } from '../../utils/formatBytes';

export function DownloadAction() {
  const outputBlobs = usePDFStore(state => state.outputBlobs);
  const outputFilenames = usePDFStore(state => state.outputFilenames);
  const status = usePDFStore(state => state.status);
  
  const [downloadIndex, setDownloadIndex] = useState(-1);

  if (status !== 'done' || !outputBlobs || !outputFilenames || outputBlobs.length === 0) {
    return null;
  }

  const isMultiple = outputBlobs.length > 1;

  const handleDownload = () => {
    if (isMultiple) {
      setDownloadIndex(0);
      
      const downloadNext = (idx: number) => {
        if (idx >= outputBlobs.length) {
          setDownloadIndex(-1); // Finished
          return;
        }
        
        setDownloadIndex(idx);
        const url = URL.createObjectURL(outputBlobs[idx]);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputFilenames[idx];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Short interval to bypass popup blockers
        setTimeout(() => {
          downloadNext(idx + 1);
        }, 200);
      };
      
      downloadNext(0);
    } else {
      // Single download
      const url = URL.createObjectURL(outputBlobs[0]);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilenames[0];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const totalSize = outputBlobs.reduce((acc, b) => acc + b.size, 0);
  const isDownloadingArray = downloadIndex >= 0;

  return (
    <div className="mt-auto pt-4 border-t border-gray-100">
      <div className="mb-3 text-center">
        <span className="text-sm text-gray-500 font-medium">
          Ready to download ({formatBytes(totalSize)}{isMultiple ? `, ${outputBlobs.length} files` : ''})
        </span>
      </div>
      <button
        onClick={handleDownload}
        disabled={isDownloadingArray}
        className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-sm
          ${isDownloadingArray 
            ? 'bg-green-400 text-white cursor-wait cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md active:transform active:scale-[0.99]'}`}
      >
        <Download className="mr-2" size={24} />
        {isDownloadingArray 
          ? `Downloading ${downloadIndex + 1} of ${outputBlobs.length}...`
          : isMultiple ? `Download All Files` : `Download Merged PDF`
        }
      </button>
    </div>
  );
}
