import { Lock, LogIn, PiggyBank, UserPlus } from "lucide-react";
import { useState } from "react";
import { Card } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { AppTheme } from "../hooks/useTheme";
import { clearMoneyControlStorage } from "../utils/storage";

interface AuthPageProps {
  theme: AppTheme;
  error: string;
  onLogin: (data: { email: string; password: string }) => boolean;
  onRegister: (data: { name: string; email: string; password: string }) => boolean;
  onLoginWithPin: (pin: string) => boolean;
  onDemoLogin: () => void;
  onClearError: () => void;
}

export const AuthPage = ({ theme, error, onLogin, onRegister, onLoginWithPin, onDemoLogin, onClearError }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pin, setPin] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const ok =
      mode === "login"
        ? onLogin({ email: form.email, password: form.password })
        : onRegister({ name: form.name, email: form.email, password: form.password });
    if (ok) setForm({ name: "", email: "", password: "" });
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    onClearError();
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 text-ink" data-theme={theme}>
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="brand-orb mb-4 flex h-16 w-16 items-center justify-center rounded-5xl text-white">
            <PiggyBank size={32} />
          </div>
          <h1 className="text-3xl font-bold">Money Control</h1>
          <p className="mt-2 text-sm text-muted">Войди или создай аккаунт, чтобы сохранить свой личный кабинет.</p>
          <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-muted">Данные хранятся только в этом браузере. Это локальный профиль, не облачный аккаунт.</p>
        </div>

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
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>
        </Card>

        <Card className="mt-4">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onLoginWithPin(pin); }}>
            <input className={inputClass} inputMode="numeric" placeholder="PIN-код" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className={ghostButtonClass} type="submit">PIN</button>
          </form>
        </Card>

        <button
          className={`${ghostButtonClass} mt-4 w-full`}
          type="button"
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
        >
          <Lock size={17} />
          {mode === "login" ? "У меня ещё нет аккаунта" : "У меня уже есть аккаунт"}
        </button>
        <button className={`${buttonClass} mt-3 w-full`} type="button" onClick={onDemoLogin}>
          Попробовать демо
        </button>
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
  );
};
