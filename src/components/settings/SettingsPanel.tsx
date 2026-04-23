import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings as SettingsIcon, Save, Cpu, HardDrive, WifiOff } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { workerPool } from '../../utils/workerPool';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const { settings, updateSettings } = useSettings();

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen || !mounted) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    if (localSettings.workerThreads !== settings.workerThreads) {
      workerPool.resize(localSettings.workerThreads);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-sm h-full relative z-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <SettingsIcon size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-gray-800">Preferences</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HardDrive size={14} /> Output Configuration
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Output Pattern</label>
              <input 
                type="text" 
                value={localSettings.outputPattern}
                onChange={(e) => setLocalSettings({...localSettings, outputPattern: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Available variables: {'{original}'}, {'{date}'}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} /> Performance & Limits
            </h3>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-bold text-gray-700">Worker Threads</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{localSettings.workerThreads}</span>
              </div>
              <input 
                type="range" 
                min="1" max="8" step="1"
                value={localSettings.workerThreads}
                onChange={(e) => setLocalSettings({...localSettings, workerThreads: parseInt(e.target.value)})}
                className="w-full accent-blue-600"
              />
              <p className="text-xs text-gray-400 mt-1">Higher numbers use more RAM but process batch jobs faster.</p>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Max File Size (MB)</label>
              <input 
                type="number" 
                min="1" max="500"
                value={localSettings.maxFileSizeMB}
                onChange={(e) => setLocalSettings({...localSettings, maxFileSizeMB: parseInt(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <WifiOff size={14} /> Offline Mode
            </h3>
            
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="pt-0.5">
                <input 
                  type="checkbox"
                  checked={localSettings.offlineMode}
                  onChange={(e) => setLocalSettings({...localSettings, offlineMode: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Cache for offline use</p>
                <p className="text-xs text-gray-500 mt-0.5">Store application assets locally to use DocCraft without an internet connection.</p>
              </div>
            </label>
          </section>

        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
          >
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
