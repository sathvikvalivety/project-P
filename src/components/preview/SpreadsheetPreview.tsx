import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface SpreadsheetPreviewProps {
  blob: Blob;
}

export function SpreadsheetPreview({ blob }: SpreadsheetPreviewProps) {
  const [htmls, setHtmls] = useState<{name: string, html: string}[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const buffer = await blob.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        const sheets = workbook.SheetNames.map(name => {
          const ws = workbook.Sheets[name];
          const html = XLSX.utils.sheet_to_html(ws, { id: 'sheet-table' });
          return { name, html };
        });
        
        setHtmls(sheets);
      } catch (err) {
        console.error("Spreadsheet preview error", err);
        setError("Could not generate spreadsheet preview.");
      }
    };
    loadExcel();
  }, [blob]);

  if (error) {
    return <div className="text-sm text-red-500 py-10 text-center w-full">{error}</div>;
  }

  if (htmls.length === 0) {
    return <div className="text-sm text-gray-500 py-10 text-center w-full">Loading preview...</div>;
  }

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; }
        table { border-collapse: collapse; width: 100%; font-size: 13px; }
        th, td { border: 1px solid #ddd; padding: 6px 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: 600; }
        tr:nth-child(even) { background-color: #fcfcfc; }
      </style>
    </head>
    <body>
      ${htmls[activeTab].html}
    </body>
    </html>
  `;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {htmls.length > 1 && (
        <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto custom-scrollbar flex-shrink-0">
          {htmls.map((sheet, idx) => (
            <button
              key={sheet.name}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-r border-gray-200 transition-colors ${
                activeTab === idx 
                  ? 'bg-white text-blue-600 border-b-2 border-b-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-grow w-full overflow-hidden relative">
        <iframe
          srcDoc={iframeHtml}
          sandbox="allow-same-origin"
          className="w-full h-full border-none absolute inset-0"
          title={`Sheet ${htmls[activeTab].name}`}
        />
      </div>
    </div>
  );
}
