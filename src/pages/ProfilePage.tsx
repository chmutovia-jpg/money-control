import { Camera, Download, FileJson, LogOut, Moon, Save, Sun, Upload, UserCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Card, SectionHeader } from "../components/Card";
import { Field, buttonClass, ghostButtonClass, inputClass } from "../components/FormControls";
import type { AppTheme } from "../hooks/useTheme";
import type { FinanceState, User } from "../types";
import { formatDate } from "../utils/format";

interface ProfilePageProps {
  user: User;
  financeState: FinanceState;
  theme: AppTheme;
  authError?: string;
  onThemeChange: (theme: AppTheme) => void;
  onImportData: (state: FinanceState) => void;
  onUpdateProfile: (profile: Pick<User, "name" | "avatar">) => void;
  onSetPin: (pin: string) => void;
  onLogout: () => void;
}

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvValue = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const transactionsToCsv = (state: FinanceState) => {
  const rows = [
    ["id", "type", "amount", "category", "date", "comment", "isRecurring", "accountId"],
    ...state.transactions.map((item) => [
      item.id,
      item.type,
      item.amount,
      item.category,
      item.date,
      item.comment ?? "",
      item.isRecurring ? "yes" : "no",
      item.accountId ?? "",
    ]),
  ];
  return rows.map((row) => row.map(csvValue).join(",")).join("\n");
};

const normalizeImportedState = (state: Partial<FinanceState>): FinanceState => {
  const accounts = state.accounts?.length
    ? state.accounts.map((account, index) => ({
        ...account,
        currency: "RUB" as const,
        color: account.color ?? ["#60a5fa", "#34d399", "#a78bfa", "#fb7185"][index % 4],
      }))
    : [{ id: "main", name: "Основной", type: "card" as const, balance: 0, currency: "RUB" as const, color: "#60a5fa" }];
  const fallbackAccountId = accounts[0].id;
  return {
  transactions: (state.transactions ?? []).map((item) => ({ ...item, accountId: item.accountId ?? fallbackAccountId })),
  subscriptions: state.subscriptions ?? [],
  debts: state.debts ?? [],
  goals: state.goals ?? [],
  budgets: state.budgets ?? [],
  accounts,
  };
};

export const ProfilePage = ({ user, financeState, theme, authError, onThemeChange, onImportData, onUpdateProfile, onSetPin, onLogout }: ProfilePageProps) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [avatarStatus, setAvatarStatus] = useState("");
  const [pin, setPin] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setAvatarStatus("Готовим аватар...");
    if (!file.type.startsWith("image/")) {
      setAvatarStatus("Выбери файл изображения.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = 128;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        setAvatarStatus("Не удалось обработать изображение.");
        URL.revokeObjectURL(imageUrl);
        return;
      }

      const side = Math.min(image.width, image.height);
      const sourceX = (image.width - side) / 2;
      const sourceY = (image.height - side) / 2;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setAvatarStatus("Не удалось сжать изображение.");
            URL.revokeObjectURL(imageUrl);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result);
            if (result.length > 80_000) {
              setAvatarStatus("Фото всё ещё слишком большое. Выбери другое изображение.");
              URL.revokeObjectURL(imageUrl);
              return;
            }
            setAvatar(result);
            setAvatarStatus("Аватар готов. Нажми «Сохранить».");
            URL.revokeObjectURL(imageUrl);
          };
          reader.onerror = () => {
            setAvatarStatus("Не удалось прочитать сжатый аватар.");
            URL.revokeObjectURL(imageUrl);
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.62,
      );
    };
    image.onerror = () => {
      setAvatarStatus("Не удалось открыть изображение.");
      URL.revokeObjectURL(imageUrl);
    };
    image.src = imageUrl;
  };

  const removeAvatar = () => {
    setAvatar(undefined);
    setAvatarStatus("Аватар удалён. Нажми «Сохранить».");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onUpdateProfile({ name, avatar });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const exportJson = (backup = false) => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(
      backup ? `money-control-backup-${stamp}.json` : `money-control-data-${stamp}.json`,
      JSON.stringify(financeState, null, 2),
      "application/json",
    );
  };

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`money-control-transactions-${stamp}.csv`, transactionsToCsv(financeState), "text/csv;charset=utf-8");
  };

  const importJson = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<FinanceState>;
        onImportData(normalizeImportedState(parsed));
        setImportStatus("Данные импортированы.");
      } catch {
        setImportStatus("Не удалось импортировать JSON.");
      }
      if (importInputRef.current) importInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Личный кабинет</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">Настройки</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card>
          <SectionHeader title="Профиль" />
          <form className="space-y-5" onSubmit={submit}>
            <div className="flex flex-col items-center rounded-5xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 shadow-card">
                  {avatar ? <img src={avatar} alt="Аватар" className="h-full w-full object-cover" /> : <UserCircle size={58} className="text-muted" />}
                </div>
                <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white shadow-card transition hover:bg-blue-400">
                  <Camera size={18} />
                  <input className="sr-only" type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
                </label>
              </div>
              <p className="mt-4 font-semibold text-ink">{user.email}</p>
              <p className="mt-1 text-sm text-muted">Создан: {formatDate(user.createdAt)}</p>
            </div>

            <Field label="Имя">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>

            {saved ? <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">Профиль сохранён.</div> : null}
            {authError ? <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">{authError}</div> : null}
            {avatarStatus ? <div className="rounded-2xl border border-blue-300/20 bg-blue-400/10 px-4 py-3 text-sm font-medium text-blue-100">{avatarStatus}</div> : null}

            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} type="submit">
                <Save size={18} />
                Сохранить
              </button>
              {avatar ? <button className={ghostButtonClass} type="button" onClick={removeAvatar}>Удалить аватар</button> : null}
              <button className={ghostButtonClass} type="button" onClick={onLogout}>
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <SectionHeader title="Внешний вид" />
          <div className="grid grid-cols-2 gap-2 rounded-3xl bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onThemeChange("dark")}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${theme === "dark" ? "bg-blue-500 text-white shadow-card" : "text-muted hover:bg-white/10"}`}
            >
              <Moon size={18} />
              Тёмная
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("light")}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${theme === "light" ? "bg-blue-500 text-white shadow-card" : "text-muted hover:bg-white/10"}`}
            >
              <Sun size={18} />
              Светлая
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Данные" />
          <div className="space-y-3 text-sm text-muted">
            <div className="rounded-3xl bg-slate-50 p-4 font-semibold text-ink">Данные хранятся локально в этом браузере.</div>
            <div className="rounded-3xl bg-slate-50 p-4">Доходы, расходы, подписки, долги и цели привязаны к текущему аккаунту.</div>
            <div className="rounded-3xl bg-slate-50 p-4">Аватарка и имя хранятся локально в браузере через localStorage.</div>
            <div className="rounded-3xl bg-slate-50 p-4">Backend и внешняя отправка данных не используются.</div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Экспорт и импорт" />
          <div className="grid gap-3 sm:grid-cols-2">
            <button className={ghostButtonClass} type="button" onClick={() => exportJson(false)}>
              <FileJson size={18} />
              Экспорт JSON
            </button>
            <button className={ghostButtonClass} type="button" onClick={() => exportJson(true)}>
              <Download size={18} />
              Резервная копия
            </button>
            <button className={ghostButtonClass} type="button" onClick={exportCsv}>
              <Download size={18} />
              Операции CSV
            </button>
            <button className={ghostButtonClass} type="button" onClick={() => importInputRef.current?.click()}>
              <Upload size={18} />
              Импорт JSON
            </button>
          </div>
          <input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(e) => importJson(e.target.files?.[0])} />
          {importStatus ? <div className="mt-4 rounded-2xl border border-white/10 bg-slate-50 px-4 py-3 text-sm font-medium text-ink">{importStatus}</div> : null}
        </Card>

        <Card>
          <SectionHeader title="Безопасность" />
          <p className="text-sm text-muted">Пароль и сессия хранятся локально. Для личного ежедневного использования этого достаточно, но для синхронизации между устройствами понадобится backend.</p>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); onSetPin(pin); setPin(""); }}>
            <input className={inputClass} inputMode="numeric" minLength={4} placeholder="PIN для быстрого входа" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className={buttonClass} type="submit">Сохранить PIN</button>
          </form>
          <button className={`${ghostButtonClass} mt-4`} type="button" onClick={onLogout}>
            <LogOut size={18} />
            Выйти из аккаунта
          </button>
        </Card>
      </div>
    </div>
  );
};
