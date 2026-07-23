import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof CheckCircle2; border: string; icon_color: string }> = {
  success: { icon: CheckCircle2, border: "border-green-600/30", icon_color: "text-green-600" },
  error: { icon: AlertTriangle, border: "border-red-600/30", icon_color: "text-red-600" },
  info: { icon: Info, border: "border-safety-500/30", icon_color: "text-safety-500" },
};

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, border, icon_color } = VARIANT_STYLES[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-md border bg-white px-4 py-3 text-sm text-charcoal-900 shadow-lg ${border}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon_color}`} />
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 text-steel-400 hover:text-charcoal-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
