const PREFIX = 'pokequiz_';

export const saveData = (key: string, value: unknown) => {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
};

export const loadData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

export const clearData = (key: string) => {
  try { localStorage.removeItem(PREFIX + key); } catch {}
};