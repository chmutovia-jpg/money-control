import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

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

export const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <AnimatedEmptyState title={title} text={text} />
);

const AnimatedEmptyState = ({ title, text }: { title: string; text: string }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="rounded-5xl border border-dashed border-white/15 bg-white/5 p-8 text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: "easeOut" }}
    >
      <motion.div
        className="mx-auto mb-4 h-10 w-10 rounded-3xl bg-blue-400/10"
        animate={reduced ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </motion.div>
  );
};
