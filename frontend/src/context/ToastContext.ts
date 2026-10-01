import { createContext, useContext } from 'react';

export interface ToastOptions {
  message: string;
  tone?: 'default' | 'error';
  action?: { label: string; onClick: () => void };
}

export const ToastContext = createContext<((toast: ToastOptions) => void) | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
