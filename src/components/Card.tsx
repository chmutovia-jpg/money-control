import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <section className={`glass-panel liquid-hover rounded-5xl p-5 shadow-card ${className}`}>{children}</section>
);

export const SectionHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-lg font-semibold text-ink">{title}</h2>
    {action}
  </div>
);

export const EmptyState = ({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) => (
  <AnimatedEmptyState title={title} text={text} actionLabel={actionLabel} onAction={onAction} />
);

const AnimatedEmptyState = ({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="rounded-5xl border border-dashed border-white/15 bg-white/5 p-8 text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: "easeOut" }}
    >
      <motion.div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-blue-400/10 text-blue-200 shadow-[0_0_28px_rgba(96,165,250,0.16)]"
        animate={reduced ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plus size={24} />
      </motion.div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{text}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-5 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-card transition hover:bg-blue-400">
          {actionLabel}
        </button>
      ) : null}
    </motion.div>
  );
};
