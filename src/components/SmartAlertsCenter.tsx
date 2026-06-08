import { Bell, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { SmartAlert } from "../utils/smartAlerts";

const toneClass: Record<SmartAlert["tone"], string> = {
  blue: "bg-blue-400/12 text-blue-200",
  green: "bg-emerald-400/12 text-emerald-200",
  amber: "bg-amber-400/12 text-amber-200",
  rose: "bg-rose-400/12 text-rose-200",
  violet: "bg-violet-400/12 text-violet-200",
};

export const SmartAlertsCenter = ({ alerts }: { alerts: SmartAlert[] }) => {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

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
      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute right-0 top-12 z-40 w-[min(88vw,360px)] rounded-[28px] border border-white/10 bg-modal p-3 shadow-soft backdrop-blur-2xl"
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
                    className={`rounded-3xl border border-white/10 p-3 ${toneClass[alert.tone]}`}
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
              <div className="rounded-3xl bg-white/10 p-4 text-center">
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
};
