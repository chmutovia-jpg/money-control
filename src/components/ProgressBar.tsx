export const ProgressBar = ({ value, tone = "bg-blue-500" }: { value: number; tone?: string }) => (
  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
    <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);
