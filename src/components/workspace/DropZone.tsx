import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { usePDFStore } from '../../store/usePDFStore';


export function DropZone() {
  const addFiles = usePDFStore(state => state.addFiles);
  const setErrorMessage = usePDFStore(state => state.setErrorMessage);
  const acceptedTypes = undefined;

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setErrorMessage("Some files were rejected. Ensure they match the accepted formats for this tool.");
    }
    
    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles);
    }
  }, [addFiles, setErrorMessage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-[3px] border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-md
        ${isDragActive ? 'border-blue-400 bg-blue-50/80 text-blue-700 shadow-xl scale-[1.02]' : 'border-white/60 bg-white/40 hover:bg-white/60 hover:border-white/80 hover:shadow-lg hover:scale-[1.01] text-gray-500'}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 mb-3 text-gray-400" />
      {
        isDragActive ?
          <p className="text-lg font-medium">Drop the files here ...</p> :
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-700">Drag & drop files here</p>
            <p className="text-sm">or click to select files</p>
          </div>
      }
    </div>
  );
}
