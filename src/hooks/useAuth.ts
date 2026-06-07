import { useEffect, useMemo, useState } from "react";
import type { User } from "../types";

const USERS_KEY = "money-control-users";
const SESSION_KEY = "money-control-session";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const loadUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as User[];
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const useAuth = () => {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [error, setError] = useState("");

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUserId]);

  const api = useMemo(
    () => ({
      register: ({ name, email, password }: { name: string; email: string; password: string }) => {
        const cleanName = name.trim();
        const cleanEmail = normalizeEmail(email);
        setError("");
        if (cleanName.length < 2) {
          setError("Укажи имя от 2 символов.");
          return false;
        }
        if (!cleanEmail.includes("@")) {
          setError("Укажи корректный email.");
          return false;
        }
        if (password.length < 6) {
          setError("Пароль должен быть не короче 6 символов.");
          return false;
        }
        if (users.some((user) => user.email === cleanEmail)) {
          setError("Пользователь с таким email уже есть.");
          return false;
        }
        const user: User = {
          id: createId(),
          name: cleanName,
          email: cleanEmail,
          password,
          createdAt: new Date().toISOString(),
        };
        setUsers((current) => [user, ...current]);
        setCurrentUserId(user.id);
        return true;
      },
      login: ({ email, password }: { email: string; password: string }) => {
        const cleanEmail = normalizeEmail(email);
        setError("");
        const user = users.find((item) => item.email === cleanEmail && item.password === password);
        if (!user) {
          setError("Неверный email или пароль.");
          return false;
        }
        setCurrentUserId(user.id);
        return true;
      },
      logout: () => {
        setError("");
        setCurrentUserId(null);
      },
      updateProfile: (profile: Pick<User, "name" | "avatar">) => {
        if (!currentUserId) return;
        setUsers((current) =>
          current.map((user) =>
            user.id === currentUserId ? { ...user, name: profile.name.trim() || user.name, avatar: profile.avatar } : user,
          ),
        );
      },
      clearError: () => setError(""),
    }),
    [currentUserId, users],
  );

  return { users, currentUser, error, ...api };
};
