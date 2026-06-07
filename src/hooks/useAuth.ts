import { useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";

const USERS_KEY = "money-control-users";
const SESSION_KEY = "money-control-session";

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const MAX_AVATAR_LENGTH = 80_000;

const normalizeUser = (user: User): User => ({
  ...user,
  avatar: user.avatar && user.avatar.length <= MAX_AVATAR_LENGTH ? user.avatar : undefined,
});

const loadUsers = (): User[] => {
  try {
    return (JSON.parse(safeGetItem(USERS_KEY) ?? "[]") as User[]).map(normalizeUser);
  } catch {
    safeRemoveItem(USERS_KEY);
    return [];
  }
};

const writeUsers = (users: User[]) => {
  safeRemoveItem(USERS_KEY);
  if (!safeSetItem(USERS_KEY, JSON.stringify(users.map(normalizeUser)))) {
    throw new Error("storage write failed");
  }
};

const saveUsers = (users: User[]) => {
  try {
    writeUsers(users);
  } catch {
    const usersWithoutAvatars = users.map((user) => ({ ...user, avatar: undefined }));
    try {
      writeUsers(usersWithoutAvatars);
    } catch {
      safeRemoveItem(USERS_KEY);
    }
  }
};

export const useAuth = () => {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => safeGetItem(SESSION_KEY));
  const [error, setError] = useState("");

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    try {
      if (currentUserId) safeSetItem(SESSION_KEY, currentUserId);
      else safeRemoveItem(SESSION_KEY);
    } catch {
      safeRemoveItem(SESSION_KEY);
    }
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
          onboardingCompleted: false,
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
      loginWithPin: (pin: string) => {
        setError("");
        const user = users.find((item) => item.pin && item.pin === pin);
        if (!user) {
          setError("PIN не найден.");
          return false;
        }
        setCurrentUserId(user.id);
        return true;
      },
      setPin: (pin: string) => {
        if (!currentUserId || pin.length < 4) return;
        const nextUsers = users.map((user) => (user.id === currentUserId ? { ...user, pin } : user));
        saveUsers(nextUsers);
        setUsers(nextUsers);
      },
      logout: () => {
        setError("");
        setCurrentUserId(null);
      },
      demoLogin: () => {
        const demoUser: User = {
          id: "demo-user",
          name: "Демо пользователь",
          email: "demo@money-control.local",
          password: "demo123",
          createdAt: new Date().toISOString(),
          onboardingCompleted: true,
        };
        const nextUsers = [demoUser, ...users.filter((user) => user.id !== demoUser.id)];
        saveUsers(nextUsers);
        setUsers(nextUsers);
        setCurrentUserId(demoUser.id);
        setError("");
      },
      updateProfile: (profile: Pick<User, "name" | "avatar">) => {
        if (!currentUserId) return;
        setError("");
        const nextUsers = users.map((user) =>
          user.id === currentUserId ? { ...user, name: profile.name.trim() || user.name, avatar: profile.avatar } : user,
        );
        try {
          writeUsers(nextUsers);
          setUsers(nextUsers.map(normalizeUser));
        } catch {
          const withoutAvatar = nextUsers.map((user) =>
            user.id === currentUserId ? { ...user, avatar: undefined } : user,
          );
          saveUsers(withoutAvatar);
          setUsers(withoutAvatar);
          setError("Телефон не смог сохранить аватар. Фото убрано, остальные данные сохранены.");
        }
      },
      completeOnboarding: () => {
        if (!currentUserId) return;
        const nextUsers = users.map((user) => (user.id === currentUserId ? { ...user, onboardingCompleted: true } : user));
        saveUsers(nextUsers);
        setUsers(nextUsers);
      },
      clearError: () => setError(""),
    }),
    [currentUserId, users],
  );

  return { users, currentUser, error, ...api };
};
