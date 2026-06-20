import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface CustomDialogContextType {
  confirm: (options: ConfirmOptions) => void;
  alert: (message: string, type?: "success" | "error" | "info") => void;
}

const CustomDialogContext = createContext<CustomDialogContextType | undefined>(undefined);

export const useCustomDialog = () => {
  const context = useContext(CustomDialogContext);
  if (!context) {
    throw new Error("useCustomDialog must be used within a CustomDialogProvider");
  }
  return context;
};

export const CustomDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation actions
  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({
      isOpen: true,
      options,
    });
  }, []);

  const handleConfirmClose = useCallback((agreed: boolean) => {
    setConfirmState((prev) => {
      if (prev.options) {
        if (agreed) {
          prev.options.onConfirm();
        } else if (prev.options.onCancel) {
          prev.options.onCancel();
        }
      }
      return { isOpen: false, options: null };
    });
  }, []);

  // Toast actions
  const alert = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CustomDialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* CONFIRMATION MODAL OVERLAY */}
      {confirmState.isOpen && confirmState.options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => handleConfirmClose(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex gap-4 items-start">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                confirmState.options.isDanger
                  ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                  : "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400"
              }`}>
                {confirmState.options.isDanger ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <HelpCircle className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-black tracking-tight">{confirmState.options.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-normal">
                  {confirmState.options.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
              >
                {confirmState.options.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors ${
                  confirmState.options.isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmState.options.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-[110] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </CustomDialogContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: (id: number) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styleMap = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    },
    error: {
      bg: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
  };

  const activeStyle = styleMap[toast.type];

  return (
    <div className={`flex items-start justify-between gap-3 border p-4 rounded-xl shadow-lg transition-all animate-slide-up ${activeStyle.bg}`}>
      <div className="flex gap-2.5 items-start">
        <div className="shrink-0 mt-0.5">{activeStyle.icon}</div>
        <p className="text-sm font-semibold leading-normal">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-0.5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
