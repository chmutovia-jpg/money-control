import { Bell, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { AppTheme } from "../hooks/useTheme";
import type { SmartAlert } from "../utils/smartAlerts";

const toneClass: Record<SmartAlert["tone"], string> = {
  blue: "notification-card-blue",
  green: "notification-card-green",
  amber: "notification-card-amber",
  rose: "notification-card-rose",
  violet: "notification-card-violet",
};

export const SmartAlertsCenter = ({ alerts, theme }: { alerts: SmartAlert[]; theme: AppTheme }) => {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const popover = (
    <div className="smart-alerts-layer" data-theme={theme}>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="notification-popover pointer-events-auto fixed left-4 top-20 z-[80] w-[calc(100vw-2rem)] max-w-none rounded-[28px] p-3 lg:bottom-6 lg:left-[17rem] lg:right-auto lg:top-auto lg:w-[380px]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduced ? 0.12 : 0.2, ease: "easeOut" }}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-bold text-ink">Уведомления</p>
              <span className="text-xs text-muted">локально</span>
            </div>
            {alerts.length ? (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`notification-card rounded-3xl p-3 ${toneClass[alert.tone]}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0.1 : 0.18, delay: reduced ? 0 : index * 0.035, ease: "easeOut" }}
                  >
                    <p className="text-sm font-bold">{alert.title}</p>
                    <p className="mt-1 text-xs opacity-85">{alert.text}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="notification-empty rounded-3xl p-4 text-center">
                <CheckCircle2 className="mx-auto text-emerald-300" size={28} />
                <p className="mt-2 text-sm font-bold text-ink">Всё спокойно</p>
                <p className="mt-1 text-xs text-muted">Сейчас нет важных предупреждений.</p>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-muted transition hover:bg-white/15"
        aria-label="Уведомления"
      >
        <Bell size={19} />
        {alerts.length ? <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{alerts.length}</span> : null}
      </button>
      {typeof document !== "undefined" ? createPortal(popover, document.body) : popover}
    </div>
  );
};
