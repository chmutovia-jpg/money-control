import { BarChart3, Lock, LogIn, ShieldCheck, TrendingDown, UserPlus, Wallet } from "lucide-react";
import { useState } from "react";
import { Card } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { AppTheme } from "../hooks/useTheme";
import { clearMoneyControlStorage } from "../utils/storage";

interface AuthPageProps {
  theme: AppTheme;
  error: string;
  onLogin: (data: { email: string; password: string }) => boolean | Promise<boolean>;
  onRegister: (data: { name: string; email: string; password: string }) => boolean | Promise<boolean>;
  onLoginWithPin: (pin: string) => boolean | Promise<boolean>;
  onDemoLogin: () => void | Promise<void>;
  onClearError: () => void;
}

export const AuthPage = ({ theme, error, onLogin, onRegister, onLoginWithPin, onDemoLogin, onClearError }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pin, setPin] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await (
      mode === "login"
        ? onLogin({ email: form.email, password: form.password })
        : onRegister({ name: form.name, email: form.email, password: form.password })
    );
    if (ok) setForm({ name: "", email: "", password: "" });
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    onClearError();
  };

  return (
    <div className="app-shell min-h-screen px-4 py-8 text-ink sm:py-10" data-theme={theme}>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <section className="premium-hero relative overflow-hidden rounded-[36px] p-6 sm:p-8 lg:p-10">
          <div className="relative z-10">
            <img className="h-20 w-20 rounded-[26px] shadow-[0_0_42px_rgba(96,165,250,0.25)]" src="./icon.svg" alt="Money Control" />
            <h1 className="mt-7 text-4xl font-semibold leading-tight sm:text-6xl">Money Control</h1>
            <p className="mt-4 text-2xl font-semibold text-ink">Твои деньги под контролем</p>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">Локально. Приватно. Без банковских подключений.</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-muted"><ShieldCheck size={16} /> Это локальный профиль, данные не уходят на сервер.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className={`${buttonClass} min-h-[52px] px-6`} type="button" onClick={onDemoLogin}>
                Попробовать демо
              </button>
              <button className={ghostButtonClass} type="button" onClick={() => switchMode("register")}>
                <UserPlus size={17} />
                Создать локальный профиль
              </button>
              <button className={ghostButtonClass} type="button" onClick={() => switchMode("login")}>
                <Lock size={17} />
                Войти
              </button>
            </div>

            <div className="mt-9 rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Сегодня можно потратить</p>
                  <p className="mt-2 text-4xl font-semibold">12 500 ₽</p>
                </div>
                <div className="rounded-3xl bg-emerald-400/10 p-3 text-emerald-200"><Wallet size={24} /></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <PreviewMetric icon={BarChart3} label="Прогноз" value="84 500 ₽" />
                <PreviewMetric icon={TrendingDown} label="Расходы" value="38 200 ₽" />
                <PreviewMetric icon={ShieldCheck} label="Статус" value="Спокойно" />
              </div>
            </div>
          </div>
        </section>

        <div className="w-full">
          <Card>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-3xl bg-white/5 p-1">
            <button
              type="button"
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "login" ? "bg-white/90 text-slate-950" : "text-muted hover:bg-white/10"}`}
              onClick={() => switchMode("login")}
            >
              Вход
            </button>
            <button
              type="button"
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === "register" ? "bg-white/90 text-slate-950" : "text-muted hover:bg-white/10"}`}
              onClick={() => switchMode("register")}
            >
              Регистрация
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" ? (
              <Field label="Имя">
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Алексей" required />
              </Field>
            ) : null}
            <Field label="Email">
              <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" required />
            </Field>
            <Field label="Пароль">
              <input className={inputClass} type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Минимум 6 символов" required />
            </Field>
            {error ? <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">{error}</div> : null}
            <button className={`${buttonClass} w-full`} type="submit">
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === "login" ? "Войти" : "Создать локальный профиль"}
            </button>
          </form>
          </Card>

          <Card className="mt-4">
          <p className="mb-3 text-sm font-semibold text-ink">Быстрый локальный вход по PIN</p>
          <p className="mb-3 text-xs text-muted">PIN работает только на этом устройстве и в этом браузере.</p>
          <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); await onLoginWithPin(pin); }}>
            <input className={inputClass} inputMode="numeric" placeholder="PIN-код" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className={ghostButtonClass} type="submit">PIN</button>
          </form>
          </Card>

          <button
            className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-white/10"
            type="button"
            onClick={() => {
              clearMoneyControlStorage();
              window.location.reload();
            }}
          >
            Сбросить данные приложения
          </button>
        </div>
      </div>
    </div>
  );
};

const PreviewMetric = ({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) => (
  <div className="rounded-3xl bg-slate-50 p-3">
    <Icon className="text-blue-300" size={17} />
    <p className="mt-2 text-[11px] text-muted">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
  </div>
);
