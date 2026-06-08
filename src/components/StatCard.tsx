import type { LucideIcon } from "lucide-react";
import { AnimatedCard, AnimatedNumber } from "./motion";

interface StatCardProps {
  label: string;
  value: string;
  numericValue?: number;
  currency?: boolean;
  suffix?: string;
  delay?: number;
  icon: LucideIcon;
  tone: "green" | "red" | "blue" | "violet" | "slate";
  hint?: string;
}

const toneClasses = {
  green: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20",
  red: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-300/20",
  blue: "bg-blue-400/10 text-blue-300 ring-1 ring-blue-300/20",
  violet: "bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-300/20",
  slate: "bg-white/10 text-slate-300 ring-1 ring-white/15",
};

export const StatCard = ({ label, value, numericValue, currency = true, suffix = "", delay = 0, icon: Icon, tone, hint }: StatCardProps) => (
  <AnimatedCard className="liquid-hover p-4 sm:p-5" delay={delay}>
    <div className="flex items-start justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <p className="text-xs text-muted sm:text-sm">{label}</p>
        <p className="mt-2 break-words text-xl font-bold leading-tight text-ink sm:text-2xl">
          {typeof numericValue === "number" ? <AnimatedNumber value={numericValue} currency={currency} suffix={suffix} /> : value}
        </p>
        {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
      </div>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${toneClasses[tone]}`}>
        <Icon size={19} />
      </div>
    </div>
  </AnimatedCard>
);
