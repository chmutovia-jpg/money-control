import { AnimatedProgress } from "./motion";

export const ProgressBar = ({ value, tone = "bg-blue-500" }: { value: number; tone?: string }) => {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-3 overflow-hidden rounded-full bg-slate-100 ${value >= 100 ? "shadow-[0_0_24px_rgba(251,113,133,0.18)]" : ""}`}>
      <AnimatedProgress
        className={`h-full rounded-full ${tone}`}
        value={width}
      />
    </div>
  );
};
