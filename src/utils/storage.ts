export const safeGetItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const safeRemoveItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures. The UI should keep working.
  }
};

export const clearMoneyControlStorage = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("money-control"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage failures. Reload still gives the app another chance.
  }
};
