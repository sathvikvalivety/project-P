import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, MoveRight } from 'lucide-react';

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('doccraft:onboardingSeen');
    if (!hasSeen) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('doccraft:onboardingSeen', 'true');
  };

  if (!isVisible) return null;

  const tours = [
    {
      title: "Welcome to DocCraft",
      desc: "DocCraft is a powerful, offline-first PDF toolkit. Everything stays in your browser.",
      target: null // Center
    },
    {
      title: "Add your files",
      desc: "Drag and drop any PDF, image, or document here to start.",
      target: "drop-zone"
    },
    {
      title: "Build your workflow",
      desc: "Chain multiple tools together to create a reusable recipe.",
      target: "sidebar-tools"
    },
    {
      title: "Run your recipe",
      desc: "Click 'Run' to execute the entire chain of tools on your files.",
      target: "run-button"
    }
  ];

  const current = tours[step];

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={dismiss} />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-4 pointer-events-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-50 animate-in zoom-in-95 duration-300">
          <div className="bg-blue-600 p-8 text-white relative">
            <Sparkles className="absolute top-4 right-4 opacity-30" size={64} />
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl font-black">{step + 1}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">{current.title}</h2>
          </div>
          
          <div className="p-8">
            <p className="text-gray-600 leading-relaxed font-medium mb-8">
              {current.desc}
            </p>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={dismiss}
                className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-widest"
              >
                Skip Tour
              </button>
              
              <button 
                onClick={() => {
                  if (step < tours.length - 1) setStep(step + 1);
                  else dismiss();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
              >
                {step < tours.length - 1 ? (
                  <>
                    Next <MoveRight size={18} />
                  </>
                ) : "Get Started"}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center gap-1.5">
            {tours.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
