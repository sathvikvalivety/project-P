import { useState, useEffect } from 'react';
import { X, FileText, Trash2, Image as ImageIcon, Table, FileCode, File, Menu } from 'lucide-react';
import { usePDFStore, type PDFFileItem } from '../../store/usePDFStore';
import { formatBytes } from '../../utils/formatBytes';
import * as pdfjsLib from 'pdfjs-dist';


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
  const [meta, setMeta] = useState<string>('');

  useEffect(() => {
    const file = fileItem.file;
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      file.arrayBuffer().then(buffer => {
        pdfjsLib.getDocument({ data: buffer }).promise
          .then(pdf => setMeta(`${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`))
          .catch(() => setMeta('Unknown pages'));
      });
    } else if (type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setMeta(`${img.width}x${img.height} px`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (type === 'text/csv' || name.endsWith('.csv')) {
      file.text().then(text => {
        const rows = text.split('\n').filter(r => r.trim().length > 0).length;
        setMeta(`${rows} row${rows !== 1 ? 's' : ''}`);
      });
    } else if (type === 'application/json' || name.endsWith('.json')) {
      file.text().then(text => {
        try {
          const j = JSON.parse(text);
          setMeta(Array.isArray(j) ? `${j.length} items` : '1 object');
        } catch {
          setMeta('Invalid JSON');
        }
      });
    }
  }, [fileItem.file]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  let typeColor = 'bg-gray-100 text-gray-500 border-gray-200';
  let leftBorder = 'border-l-gray-300';
  let TypeIcon = File;
  let typeLabel = 'FILE';

  const type = fileItem.file.type;
  const name = fileItem.file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    typeColor = 'bg-red-50 text-red-600 border-red-200';
    leftBorder = 'border-l-red-500';
    TypeIcon = FileText;
    typeLabel = 'PDF';
  } else if (type.startsWith('image/')) {
    typeColor = 'bg-blue-50 text-blue-600 border-blue-200';
    leftBorder = 'border-l-blue-500';
    TypeIcon = ImageIcon;
    typeLabel = 'IMG';
  } else if (name.endsWith('.docx') || type.includes('wordprocessingml')) {
    typeColor = 'bg-purple-50 text-purple-600 border-purple-200';
    leftBorder = 'border-l-purple-500';
    TypeIcon = FileText;
    typeLabel = 'DOCX';
  } else if (type === 'text/csv' || type.includes('spreadsheetml') || name.endsWith('.csv') || name.endsWith('.xlsx')) {
    typeColor = 'bg-green-50 text-green-600 border-green-200';
    leftBorder = 'border-l-green-500';
    TypeIcon = Table;
    typeLabel = name.endsWith('.csv') ? 'CSV' : 'XLSX';
  } else if (name.endsWith('.md') || type === 'text/markdown') {
    typeColor = 'bg-amber-50 text-amber-600 border-amber-200';
    leftBorder = 'border-l-amber-500';
    TypeIcon = FileCode;
    typeLabel = 'MD';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${leftBorder} border-l-[4px] ${
        !isAccepted ? 'opacity-50 grayscale' : ''
      } ${isDragging ? 'ring-2 ring-blue-400 shadow-xl scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between p-3 w-full">
        <div className="flex items-center gap-3 overflow-hidden flex-grow">
          
          {showGrip && (
            <div 
              {...listeners} 
              {...attributes} 
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }} 
              className="text-gray-300 hover:text-gray-600 outline-none p-1 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <Menu size={18} />
            </div>
          )}

          <div className="flex-shrink-0 relative">
            <div className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center ${typeColor}`}>
              <TypeIcon size={16} className="mb-0.5" />
              <span className="text-[9px] font-black tracking-tighter uppercase leading-none">{typeLabel}</span>
            </div>
            <span className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
              {index + 1}
            </span>
          </div>
          
          <div className="min-w-0 flex-grow pl-1 pr-2">
            <p className="text-sm font-bold text-gray-800 truncate" title={fileItem.file.name}>
              {fileItem.file.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 truncate">
              <span className="font-medium">{formatBytes(fileItem.file.size)}</span>
              {meta && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">{meta}</span>
                </>
              )}
              {!isAccepted && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-red-500 font-medium">Unsupported</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
          title="Remove file"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function FileList() {
  const files = usePDFStore(state => state.files);
  const removeFile = usePDFStore(state => state.removeFile);
  const reorderFiles = usePDFStore(state => state.reorderFiles);
  const clearFiles = usePDFStore(state => state.clearFiles);
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('hideReorderHint'));
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
    if (showHint) {
      setShowHint(false);
      localStorage.setItem('hideReorderHint', 'true');
    }
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
    <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-grow flex flex-col min-h-0">
      <div className="px-5 py-4 border-b border-white/50 bg-white/30 flex justify-between items-center backdrop-blur-lg">
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
      
      <div className="flex-grow min-h-0 overflow-y-auto w-full custom-scrollbar p-3">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={files.map(f => f.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 pb-2">
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
            </div>
          </SortableContext>
        </DndContext>
      </div>
      
      <div className="px-5 py-4 bg-white/30 border-t border-white/50 flex justify-between items-center backdrop-blur-lg">
        <div className="text-xs font-medium text-gray-500">
          <span className="text-gray-700 font-bold">{files.length}</span> {files.length === 1 ? 'file' : 'files'}
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-700 font-bold">{formatBytes(files.reduce((acc, f) => acc + f.file.size, 0))}</span> total
        </div>
        {showGrip && showHint && (
          <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wide bg-blue-50 px-3 py-1 rounded-full animate-pulse">
            Drag to reorder
          </div>
        )}
      </div>
    </div>
  );
}
