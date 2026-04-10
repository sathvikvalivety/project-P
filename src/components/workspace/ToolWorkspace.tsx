import { usePDFStore } from '../../store/usePDFStore';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { MergeWorkspace } from './MergeWorkspace';
import { SplitWorkspace } from './SplitWorkspace';
import { CompressWorkspace } from './CompressWorkspace';
import { ImagesToPDFWorkspace } from './ImagesToPDFWorkspace';

export function ToolWorkspace() {
  const activeTool = usePDFStore(state => state.activeTool);
  const status = usePDFStore(state => state.status);
  const errorMessage = usePDFStore(state => state.errorMessage);

  const getWorkspace = () => {
    switch (activeTool) {
      case 'pdf-merge':
        return <MergeWorkspace />;
      case 'pdf-split':
        return <SplitWorkspace />;
      case 'pdf-compress':
        return <CompressWorkspace />;
      case 'image-to-pdf':
        return <ImagesToPDFWorkspace />;
      default:
        return <div>Tool not found</div>;
    }
  };

  return (
    <div className="flex flex-col flex-grow min-h-0">
      <DropZone />
      <FileList />
      
      {/* Tool specific controls and execute actions */}
      <div className="mt-auto">
        {getWorkspace()}

        {status === 'error' && errorMessage && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
            <p className="font-medium mb-1">Process failed:</p>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
