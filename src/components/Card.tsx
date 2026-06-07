import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <section className={`glass-panel rounded-5xl p-5 shadow-card ${className}`}>{children}</section>
);

export const SectionHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-lg font-semibold text-ink">{title}</h2>
    {action}
  </div>
);

export const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-5xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
    <p className="font-semibold text-ink">{title}</p>
    <p className="mt-2 text-sm text-muted">{text}</p>
  </div>
);
