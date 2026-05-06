import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  isLoading = false
}: ConfirmDialogProps) {
  const themes = {
    danger: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      button: 'bg-red-500 hover:bg-red-600',
      light: 'bg-red-500/10'
    },
    warning: {
      icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
      button: 'bg-yellow-500 hover:bg-yellow-600',
      light: 'bg-yellow-500/10'
    },
    info: {
      icon: <AlertCircle className="w-12 h-12 text-brand-accent" />,
      button: 'bg-brand-accent hover:bg-blue-600',
      light: 'bg-brand-accent/10'
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      button: 'bg-green-500 hover:bg-green-600',
      light: 'bg-green-500/10'
    }
  };

  const theme = themes[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
          >
            {!isLoading && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className={`mx-auto w-20 h-20 rounded-full ${theme.light} flex items-center justify-center mb-6`}>
              {theme.icon}
            </div>

            <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{message}</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                disabled={isLoading}
                onClick={onConfirm}
                className={`px-4 py-3 rounded-xl text-white font-bold transition-all text-sm flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
