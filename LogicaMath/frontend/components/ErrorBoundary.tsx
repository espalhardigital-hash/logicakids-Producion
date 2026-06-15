import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    // Opcionalmente recargar la vista o emitir evento
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 m-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Ocurrió un error inesperado al cargar este panel
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
            Un fallo interno impidió mostrar esta sección. Por favor, intenta recargar, o selecciona otra opción en el menú lateral.
          </p>
          {this.state.error && (
            <div className="bg-white dark:bg-black/20 text-left p-3 rounded-lg text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto max-w-full w-full opacity-80">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-4 py-2 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
