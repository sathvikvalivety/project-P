import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
            <div className="bg-red-600 p-8 flex justify-center">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <AlertCircle size={48} className="text-white" />
              </div>
            </div>
            
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                The application encountered an unexpected error. This might be due to corrupted local data.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200"
                >
                  <RefreshCcw size={18} />
                  Reload Page
                </button>
                
                <button 
                  onClick={this.handleReset}
                  className="w-full bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-100"
                >
                  <Trash2 size={18} />
                  Clear Local Data & Reset
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">
                DocCraft Recovery Console
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
