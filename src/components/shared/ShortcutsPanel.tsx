import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsPanel({ isOpen, onClose }: ShortcutsPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'Z'], label: 'Undo previous action' },
    { keys: ['Ctrl', 'Shift', 'Z'], label: 'Redo action' },
    { keys: ['?'], label: 'Toggle this menu' },
    { keys: ['Esc'], label: 'Close modals/menus' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 p-2 rounded-xl text-gray-600">
              <Keyboard size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-gray-800">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  {shortcut.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {shortcut.keys.map((key, i) => (
                    <kbd 
                      key={i}
                      className="px-2.5 py-1.5 bg-gray-100 border border-gray-200 border-b-[3px] rounded-lg text-xs font-black text-gray-600 tracking-wider shadow-sm font-sans uppercase"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50/50 p-4 border-t border-blue-100 text-center">
          <p className="text-xs font-bold text-blue-600/80 tracking-wide uppercase">
            Work faster without the mouse
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
