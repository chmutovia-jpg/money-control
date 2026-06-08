import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { areAmountsHidden, formatCurrency } from "../utils/format";

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={`glass-panel rounded-5xl p-5 shadow-card ${className}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      whileHover={reduced ? undefined : { y: -4, scale: 1.01 }}
      transition={{ duration: reduced ? 0.12 : 0.26, delay: reduced ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
};

export const AnimatedNumber = ({
  value,
  currency = true,
  suffix = "",
}: {
  value: number;
  currency?: boolean;
  suffix?: string;
}) => {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const displayRef = useRef(display);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      displayRef.current = value;
      return;
    }
    let frame = 0;
    const frames = 28;
    const from = displayRef.current;
    const diff = value - from;
    const animate = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      const next = from + diff * progress;
      displayRef.current = next;
      setDisplay(next);
      if (frame < frames) requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [reduced, value]);

  const rounded = Math.round(display);
  const hidden = currency && areAmountsHidden();
  const rendered = currency ? formatCurrency(rounded) : `${rounded}${suffix}`;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={hidden ? "hidden" : "visible"}
        className="inline-block whitespace-nowrap tabular-nums"
        initial={{ opacity: 0, y: reduced ? 0 : 4, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: reduced ? 0 : -4, filter: "blur(3px)" }}
        transition={{ duration: reduced ? 0.08 : 0.18, ease: "easeOut" }}
      >
        {rendered}
      </motion.span>
    </AnimatePresence>
  );
};

export const AnimatedProgress = ({ value, className = "" }: { value: number; className?: string }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ width: reduced ? `${value}%` : "0%" }}
      animate={{ width: `${value}%` }}
      transition={{ duration: reduced ? 0.12 : 0.65, ease: "easeOut" }}
    />
  );
};

export const AnimatedModal = ({ children }: { children: ReactNode }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 14 }}
      transition={{ duration: reduced ? 0.12 : 0.24, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedToast = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.98 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
