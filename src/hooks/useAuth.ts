import { useEffect, useMemo, useState } from "react";
import type { User } from "../types";
import { hashSecret, verifySecret } from "../utils/crypto";
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

const sanitizeUser = ({ password: _password, pin: _pin, ...user }: User): User => user;

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
  if (!safeSetItem(USERS_KEY, JSON.stringify(users.map(normalizeUser).map(sanitizeUser)))) {
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
    const migrateUsers = async () => {
      const migrated = await Promise.all(
        users.map(async (user) => {
          let next = { ...user };
          if (next.password && (!next.passwordHash || !next.passwordSalt)) {
            const password = await hashSecret(next.password);
            next = { ...next, passwordHash: password.hash, passwordSalt: password.salt };
          }
          if (next.pin && (!next.pinHash || !next.pinSalt)) {
            const pin = await hashSecret(next.pin);
            next = { ...next, pinHash: pin.hash, pinSalt: pin.salt };
          }
          return sanitizeUser(next);
        }),
      );
      if (JSON.stringify(migrated) !== JSON.stringify(users.map(sanitizeUser))) {
        saveUsers(migrated);
        setUsers(migrated);
      }
    };
    if (users.some((user) => user.password || user.pin)) void migrateUsers();
  }, [users]);

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
      register: async ({ name, email, password }: { name: string; email: string; password: string }) => {
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
        const secret = await hashSecret(password);
        const user: User = {
          id: createId(),
          name: cleanName,
          email: cleanEmail,
          passwordHash: secret.hash,
          passwordSalt: secret.salt,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
        };
        setUsers((current) => [user, ...current]);
        setCurrentUserId(user.id);
        return true;
      },
      login: async ({ email, password }: { email: string; password: string }) => {
        const cleanEmail = normalizeEmail(email);
        setError("");
        const user = users.find((item) => item.email === cleanEmail);
        if (!user) {
          setError("Неверный email или пароль.");
          return false;
        }
        const ok = user.password
          ? user.password === password
          : await verifySecret(password, user.passwordHash, user.passwordSalt);
        if (!ok) {
          setError("Неверный email или пароль.");
          return false;
        }
        if (user.password) {
          const secret = await hashSecret(password);
          const nextUsers = users.map((item) => (item.id === user.id ? sanitizeUser({ ...item, passwordHash: secret.hash, passwordSalt: secret.salt }) : item));
          saveUsers(nextUsers);
          setUsers(nextUsers);
        }
        setCurrentUserId(user.id);
        return true;
      },
      loginWithPin: async (pin: string) => {
        setError("");
        const matches = await Promise.all(
          users.map(async (item) => ({
            user: item,
            ok: item.pin ? item.pin === pin : await verifySecret(pin, item.pinHash, item.pinSalt),
          })),
        );
        const user = matches.find((item) => item.ok)?.user;
        if (!user) {
          setError("PIN не найден.");
          return false;
        }
        if (user.pin) {
          const secret = await hashSecret(pin);
          const nextUsers = users.map((item) => (item.id === user.id ? sanitizeUser({ ...item, pinHash: secret.hash, pinSalt: secret.salt }) : item));
          saveUsers(nextUsers);
          setUsers(nextUsers);
        }
        setCurrentUserId(user.id);
        return true;
      },
      setPin: async (pin: string) => {
        if (!currentUserId || pin.length < 4) return;
        const secret = await hashSecret(pin);
        const nextUsers = users.map((user) => (user.id === currentUserId ? sanitizeUser({ ...user, pinHash: secret.hash, pinSalt: secret.salt }) : user));
        saveUsers(nextUsers);
        setUsers(nextUsers);
      },
      logout: () => {
        setError("");
        setCurrentUserId(null);
      },
      demoLogin: async () => {
        const secret = await hashSecret("demo123");
        const demoUser: User = {
          id: "demo-user",
          name: "Демо пользователь",
          email: "demo@money-control.local",
          passwordHash: secret.hash,
          passwordSalt: secret.salt,
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
