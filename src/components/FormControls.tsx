import type { ReactNode } from "react";

export const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
    {children}
  </label>
);

export const inputClass =
  "w-full rounded-[calc(var(--radius-card)-10px)] border border-[var(--border-glass)] bg-white/10 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-blue-300/60 focus:bg-white/15 focus:ring-4 focus:ring-blue-300/10";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius-card)-10px)] bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-blue-400";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius-card)-10px)] border border-[var(--border-glass)] bg-white/10 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white/15";
