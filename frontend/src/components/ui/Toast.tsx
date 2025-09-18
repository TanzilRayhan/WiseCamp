import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const typeClasses = {
  success: "bg-green-500 border-green-600",
  error: "bg-red-500 border-red-600",
  info: "bg-blue-500 border-blue-600",
};

const Toast: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white border-l-4 ${
        typeClasses[toast.type]
      }`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now() + Math.random();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
