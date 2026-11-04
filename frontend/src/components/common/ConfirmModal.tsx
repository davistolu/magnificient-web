import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white border border-stone max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-stone-muted hover:text-espresso-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : variant === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-espresso-900 text-champagne'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-xl text-espresso-900 font-medium leading-snug">
              {title}
            </h3>
            <p className="text-xs text-charcoal leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-stone/60 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 border border-stone text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900 hover:bg-ivory-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-xs uppercase tracking-editorial font-semibold transition-colors disabled:opacity-50 shadow-sm ${
              variant === 'danger'
                ? 'bg-red-700 hover:bg-red-800 text-ivory-100'
                : variant === 'warning'
                ? 'bg-amber-700 hover:bg-amber-800 text-ivory-100'
                : 'bg-espresso-900 hover:bg-espresso-800 text-ivory-100'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
