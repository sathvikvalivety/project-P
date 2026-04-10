import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { usePDFStore } from '../store/usePDFStore';

export function DropZone() {
  const addFiles = usePDFStore(state => state.addFiles);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setErrorMessage("Some files were rejected. Ensure you are only dropping PDF files.");
    }
    
    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles);
    }
  }, [addFiles, setErrorMessage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-primary bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:bg-gray-50'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 mb-3 text-gray-400" />
      {
        isDragActive ?
          <p className="text-lg font-medium">Drop the PDF files here ...</p> :
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-700">Drag & drop PDF files here</p>
            <p className="text-sm">or click to select files</p>
          </div>
      }
    </div>
  );
}
