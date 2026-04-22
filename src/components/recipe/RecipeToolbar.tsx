import { Save, FolderOpen, Share2, Check, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { usePDFStore } from '../../store/usePDFStore';
import { encodeRecipe } from '../../utils/encodeRecipe';
import { TOOL_REGISTRY } from '../../tools/registry';

/**
 * RecipeToolbar
 * Manages recipe-level actions: naming, persistence (JSON save/load),
 * and generating compressed share links.
 */
export function RecipeToolbar() {
  const recipe = usePDFStore(state => state.activeRecipe);
  const setRecipeName = usePDFStore(state => state.setRecipeName);
  const loadRecipe = usePDFStore(state => state.loadRecipe);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(recipe.name);
  const [isShared, setIsShared] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with store when store updates (e.g. from load)
  useEffect(() => {
    setEditedName(recipe.name);
  }, [recipe.name]);

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (trimmed) {
      setRecipeName(trimmed);
      setIsEditing(false);
    } else {
      setEditedName(recipe.name);
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    const data = JSON.stringify(recipe, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        loadRecipe(json, TOOL_REGISTRY);
      } catch (err) {
        alert("Failed to load recipe: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleShare = () => {
    const encoded = encodeRecipe(recipe);
    const url = `${window.location.origin}${window.location.pathname}?recipe=${encoded}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-1">
      <div className="flex items-center gap-3 group">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') { setEditedName(recipe.name); setIsEditing(false); }
              }}
              autoFocus
              className="bg-blue-50 px-3 py-1.5 rounded-xl font-black text-blue-900 border-2 border-blue-200 outline-none shadow-inner"
            />
            <button onClick={handleSaveName} className="p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 p-2 rounded-xl text-gray-500 flex items-center justify-center">
              <Send size={18} strokeWidth={3} className="-rotate-12" />
            </div>
            <h2 
              onDoubleClick={() => setIsEditing(true)}
              className="text-2xl font-black text-gray-800 cursor-text hover:text-blue-600 transition-all tracking-tight"
            >
              {recipe.name}
              <span className="ml-2 text-[10px] font-bold text-gray-300 uppercase opacity-0 group-hover:opacity-100 transition-opacity align-middle">
                Double-click to rename
              </span>
            </h2>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
          title="Save as JSON"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        
        <label className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
          <FolderOpen size={16} />
          <span>Load</span>
          <input type="file" className="hidden" accept=".json" onChange={handleUpload} />
        </label>

        <div className="w-[1px] h-6 bg-gray-100 mx-1" />

        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all
            ${isShared ? 'bg-green-50 text-green-600' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          <Share2 size={16} />
          <span>{isShared ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
}
