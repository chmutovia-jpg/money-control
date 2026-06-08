import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AppTheme } from "../hooks/useTheme";

export const AppSplash = ({ visible, theme }: { visible: boolean; theme: AppTheme }) => {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="app-shell fixed inset-0 z-[90] flex items-center justify-center px-6 text-ink"
          data-theme={theme}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.2, ease: "easeOut" }}
        >
          <motion.div
            className="text-center"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.1 : 0.28, ease: "easeOut" }}
          >
            <img className="mx-auto h-24 w-24 rounded-[28px] shadow-[0_0_48px_rgba(96,165,250,0.24)]" src="./icon.svg" alt="Money Control" />
            <h1 className="mt-5 text-3xl font-bold">Money Control</h1>
            <p className="mt-2 text-sm font-medium text-muted">Твои деньги под контролем</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
