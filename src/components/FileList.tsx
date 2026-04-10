import { X, FileText } from 'lucide-react';
import { usePDFStore } from '../store/usePDFStore';
import { formatBytes } from '../utils/formatBytes';

export function FileList() {
  const files = usePDFStore(state => state.files);
  const removeFile = usePDFStore(state => state.removeFile);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6 flex-grow">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Files to Merge</h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-700 py-1 px-2 rounded-full">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>
      <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {files.map(({ id, file }) => (
          <li key={id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <FileText size={20} />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFile(id)}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors flex-shrink-0"
              title="Remove file"
            >
              <X size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
