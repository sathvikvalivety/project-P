import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  toolId: string;
}

interface State {
  hasError: boolean;
}

export class ToolErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Tool Error [${this.props.toolId}]:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h4 className="text-sm font-bold text-red-800 mb-1">Step Configuration Error</h4>
          <p className="text-xs text-red-600 mb-3">This tool failed to initialize properly.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={12} />
            Try Resetting
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
