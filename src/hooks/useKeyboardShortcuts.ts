import { useEffect, useState } from 'react';
import { usePDFStore } from '../store/usePDFStore';

export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        const undo = usePDFStore.temporal.getState().undo;
        if (usePDFStore.temporal.getState().pastStates.length > 0) undo();
      }

      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, Ctrl+Y, Cmd+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        const redo = usePDFStore.temporal.getState().redo;
        if (usePDFStore.temporal.getState().futureStates.length > 0) redo();
      }

      // Toggle Shortcuts Panel: ? (Shift + /)
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      
      // Close Panels: Escape
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { showShortcuts, setShowShortcuts };
}
