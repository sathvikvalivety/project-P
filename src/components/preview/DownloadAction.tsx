import { useState } from 'react';
import { Download, FileArchive } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';
import { formatBytes } from '../../utils/formatBytes';
import { zipFiles } from '../../utils/zipFiles';

export function DownloadAction() {
  const outputBlobs = usePDFStore(state => state.outputBlobs);
  const outputFilenames = usePDFStore(state => state.outputFilenames);
  const status = usePDFStore(state => state.status);
  
  const [downloadIndex, setDownloadIndex] = useState(-1);
  const [isZipping, setIsZipping] = useState(false);

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
        
        setTimeout(() => {
          downloadNext(idx + 1);
        }, 200);
      };
      
      downloadNext(0);
    } else {
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

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await zipFiles(outputBlobs, outputFilenames);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doccraft-export-${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP creation failed:", error);
    } finally {
      setIsZipping(false);
    }
  };

  const totalSize = outputBlobs.reduce((acc, b) => acc + b.size, 0);
  const isBusy = downloadIndex >= 0 || isZipping;

  return (
    <div className="mt-auto pt-4 border-t border-gray-100">
      <div className="mb-3 text-center">
        <span className="text-sm text-gray-500 font-medium">
          Ready to download ({formatBytes(totalSize)}{isMultiple ? `, ${outputBlobs.length} files` : ''})
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleDownload}
          disabled={isBusy}
          className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-sm
            ${isBusy 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md active:transform active:scale-[0.99]'}`}
        >
          <Download className="mr-2" size={24} />
          {downloadIndex >= 0 
            ? `Downloading ${downloadIndex + 1}...`
            : isMultiple ? `Download All Files` : `Download Output`
          }
        </button>

        {isMultiple && (
          <button
            onClick={handleDownloadZip}
            disabled={isBusy}
            className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-sm
              ${isBusy 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:transform active:scale-[0.99]'}`}
          >
            <FileArchive className="mr-2" size={24} />
            {isZipping ? `Creating Archive...` : `Download as ZIP`}
          </button>
        )}
      </div>
    </div>
  );
}
