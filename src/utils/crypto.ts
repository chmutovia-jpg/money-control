const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

const bufferToBase64 = (buffer: ArrayBuffer) => bytesToBase64(new Uint8Array(buffer));

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const getCrypto = () => globalThis.crypto;

export const hashSecret = async (secret: string, salt = bytesToBase64(getCrypto().getRandomValues(new Uint8Array(16)))) => {
  const keyMaterial = await getCrypto().subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await getCrypto().subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(salt),
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return { hash: bufferToBase64(bits), salt };
};

export const verifySecret = async (secret: string, hash?: string, salt?: string) => {
  if (!hash || !salt) return false;
  const next = await hashSecret(secret, salt);
  return next.hash === hash;
};

export const encryptJsonWithPassword = async (payload: unknown, password: string) => {
  const crypto = getCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return {
    moneyControlProtected: true,
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: 120_000,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bufferToBase64(encrypted),
  };
};

export const decryptJsonWithPassword = async <T>(payload: { salt: string; iv: string; data: string; iterations?: number }, password: string): Promise<T> => {
  const crypto = getCrypto();
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: base64ToBytes(payload.salt), iterations: payload.iterations ?? 120_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(payload.iv) }, key, base64ToBytes(payload.data));
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
};
