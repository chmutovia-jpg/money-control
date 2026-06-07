import { Component, type ReactNode } from "react";
import { clearMoneyControlStorage } from "../utils/storage";

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 text-ink" data-theme="dark">
        <div className="glass-panel w-full max-w-md rounded-5xl p-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Money Control</h1>
          <p className="mt-3 text-sm text-muted">
            Приложение не смогло открыть сохранённые данные на этом устройстве.
          </p>
          <button
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white"
            type="button"
            onClick={() => {
              clearMoneyControlStorage();
              window.location.reload();
            }}
          >
            Очистить данные и открыть заново
          </button>
        </div>
      </div>
    );
  }
}
