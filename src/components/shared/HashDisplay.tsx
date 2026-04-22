import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashDisplayProps {
  hash: string;
}

export function HashDisplay({ hash }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl w-full">
        <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider text-center">SHA-256 Hash</h4>
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <code className="flex-1 text-gray-800 font-mono text-sm break-all">
            {hash}
          </code>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
