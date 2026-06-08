import { X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AnimatedToast } from "./motion";

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
        <AnimatedToast
          key={toast.id}
        >
        <div
          className="glass-panel pointer-events-auto flex items-center gap-3 rounded-3xl px-4 py-3 shadow-soft"
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
        </div>
        </AnimatedToast>
      ))}
    </AnimatePresence>
  </div>
);
