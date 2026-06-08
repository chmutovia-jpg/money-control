import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface ToastItem {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toasts = ({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) => (
  <div className="pointer-events-none fixed bottom-40 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 lg:bottom-6">
    <AnimatePresence>
      {items.map((toast) => (
        <motion.div
          key={toast.id}
          className="glass-panel pointer-events-auto flex items-center gap-3 rounded-3xl px-4 py-3 shadow-soft"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <p className="min-w-0 flex-1 text-sm font-semibold text-ink">{toast.message}</p>
          {toast.action ? (
            <button
              type="button"
              className="rounded-2xl bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/30"
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
          <button type="button" className="rounded-2xl p-2 text-muted transition hover:bg-white/10" onClick={() => onDismiss(toast.id)} aria-label="Закрыть уведомление">
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
