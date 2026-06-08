import { motion, useReducedMotion } from "framer-motion";

export const ProgressBar = ({ value, tone = "bg-blue-500" }: { value: number; tone?: string }) => {
  const reduced = useReducedMotion();
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-3 overflow-hidden rounded-full bg-slate-100 ${value >= 100 ? "shadow-[0_0_24px_rgba(251,113,133,0.18)]" : ""}`}>
      <motion.div
        className={`h-full rounded-full ${tone}`}
        initial={{ width: reduced ? `${width}%` : "0%" }}
        animate={{ width: `${width}%` }}
        transition={{ duration: reduced ? 0.12 : 0.65, ease: "easeOut" }}
      />
    </div>
  );
};
