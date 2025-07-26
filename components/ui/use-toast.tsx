'use client';

import * as React from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((props: Omit<Toast, 'id'>) => {
    const id = String(toastCount++);
    const duration = props.duration ?? 5000;

    setToasts((prev) => [...prev, { ...props, id }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  // Set global toast function
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __toastFunction?: typeof toast }).__toastFunction = toast;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __toastFunction?: typeof toast }).__toastFunction;
      }
    };
  }, [toast]);

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prev) => {
      if (toastId) {
        return prev.filter((t) => t.id !== toastId);
      }
      return [];
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Export the toast function for convenience
export const toast = (props: Omit<Toast, 'id'> & { variant?: 'default' | 'destructive' }): void => {
  // Get toast function from nearest ToastProvider
  // This is a singleton pattern to access the toast function globally
  if (typeof window !== 'undefined') {
    const globalToast = (window as unknown as { __toastFunction?: typeof toast }).__toastFunction;
    if (globalToast) {
      globalToast(props);
    } else {
      console.warn('Toast called before ToastProvider is mounted');
    }
  }
};
