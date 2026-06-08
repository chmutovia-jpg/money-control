import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/format";

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

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const frames = 28;
    const from = display;
    const diff = value - from;
    const animate = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      setDisplay(from + diff * progress);
      if (frame < frames) requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
    // display intentionally omitted so number animates from current rendered value only on target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, value]);

  const rounded = Math.round(display);
  return <>{currency ? formatCurrency(rounded) : `${rounded}${suffix}`}</>;
};
