import { Download } from 'lucide-react';
import { usePDFStore } from '../store/usePDFStore';
import { formatBytes } from '../utils/formatBytes';

export function DownloadButton() {
  const outputBlob = usePDFStore(state => state.outputBlob);
  const status = usePDFStore(state => state.status);

  if (status !== 'done' || !outputBlob) {
    return null;
  }

  const handleDownload = () => {
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-auto">
      <div className="mb-3 text-center">
        <span className="text-sm text-gray-500 font-medium">
          Ready to download ({formatBytes(outputBlob.size)})
        </span>
      </div>
      <button
        onClick={handleDownload}
        className="w-full py-4 rounded-xl flex items-center justify-center font-semibold text-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-sm hover:shadow-md active:transform active:scale-[0.99]"
      >
        <Download className="mr-2" size={24} />
        Download Merged PDF
      </button>
    </div>
  );
}
