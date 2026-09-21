import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import {
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastViewport,
  ToastClose,
} from '@/components/ui/Toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitive.Provider duration={4000}>
      {toasts.map(({ id, title, description, variant }) => (
        <ToastRoot key={id}>
          {}
          <div className="mt-1">
            {variant === 'success' ? (
              <CheckCircle2 className="text-success-500" size={20} />
            ) : (
              <AlertCircle className="text-danger-500" size={20} />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>

          <ToastClose className="absolute top-3 right-3 rounded-full p-1 text-primary-400 hover:text-primary-700 focus:outline-none">
            <X size={16} />
          </ToastClose>

          <div className="absolute bottom-0 left-0 h-1 w-full bg-primary-100">
            <div
              className={`h-full animate-toast-progress ${
                variant === 'success' ? 'bg-success-500' : 'bg-danger-500'
              }`}
            />
          </div>
        </ToastRoot>
      ))}

      <ToastViewport />
    </ToastPrimitive.Provider>
  );
}
