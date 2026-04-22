import { X, FileText, Trash2, GripVertical } from 'lucide-react';
import { usePDFStore, type PDFFileItem } from '../../store/usePDFStore';
import { formatBytes } from '../../utils/formatBytes';


import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableFileItemProps {
  id: string; 
  fileItem: PDFFileItem; 
  index: number;
  isAccepted: boolean;
  onRemove: (id: string) => void;
  showGrip: boolean;
}

function SortableFileItem({ id, fileItem, index, isAccepted, onRemove, showGrip }: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 transition-colors bg-white ${
        !isAccepted ? 'opacity-60 grayscale' : 'hover:bg-blue-50'
      } ${isDragging ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center space-x-3 overflow-hidden flex-grow" title={!isAccepted ? 'Not supported by this tool' : ''}>
        
        {showGrip && (
          <div 
            {...listeners} 
            {...attributes} 
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }} 
            className="text-gray-400 hover:text-gray-600 outline-none p-1 -ml-1 flex-shrink-0"
          >
            <GripVertical size={20} />
          </div>
        )}

        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-500">
          {index + 1}
        </span>

        <div className={`p-2 rounded-lg flex-shrink-0 ${isAccepted ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
          <FileText size={20} />
        </div>
        
        <div className="truncate pr-2">
          <p className={`text-sm font-medium truncate ${isAccepted ? 'text-gray-900' : 'text-gray-500'}`} title={fileItem.file.name}>
            {fileItem.file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatBytes(fileItem.file.size)} {!isAccepted && <span className="text-red-400 font-medium ml-2">Unsupported type</span>}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors flex-shrink-0 relative z-10"
        title="Remove file"
      >
        <X size={18} />
      </button>
    </li>
  );
}

export function FileList() {
  const files = usePDFStore(state => state.files);
  const removeFile = usePDFStore(state => state.removeFile);
  const reorderFiles = usePDFStore(state => state.reorderFiles);
  const clearFiles = usePDFStore(state => state.clearFiles);
  const isAccepted = (_type?: string) => true;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.id === active.id);
      const newIndex = files.findIndex(f => f.id === over.id);
      reorderFiles(oldIndex, newIndex);
    }
  };

  if (files.length === 0) {
    return null;
  }

  const isProcessing = status === 'running';
  const showGrip = files.length > 1 && !isProcessing;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6 flex-grow flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Uploaded Files</h3>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium bg-gray-200 text-gray-700 py-1 px-2 rounded-full">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
          <button 
            onClick={clearFiles}
            className="text-xs text-red-500 hover:text-red-700 flex items-center bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
          >
            <Trash2 size={14} className="mr-1" />
            Clear All
          </button>
        </div>
      </div>
      
      <div className="max-h-56 overflow-y-auto w-full custom-scrollbar">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={files.map(f => f.id)} 
            strategy={verticalListSortingStrategy}
          >
            <ul className="divide-y divide-gray-100">
              {files.map((item, index) => (
                <SortableFileItem 
                  key={item.id} 
                  id={item.id} 
                  fileItem={item} 
                  index={index}
                  isAccepted={isAccepted(item.file.type)} 
                  onRemove={removeFile}
                  showGrip={showGrip}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
