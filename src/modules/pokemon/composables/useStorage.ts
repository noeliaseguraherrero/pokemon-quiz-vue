const PREFIX = 'pokequiz_'

export const saveData = (key: string, value: unknown, characterKey = 'global') => {
  try {
    localStorage.setItem(`${PREFIX}${characterKey}_${key}`, JSON.stringify(value))
  } catch {}
}

export const loadData = <T>(key: string, fallback: T, characterKey = 'global'): T => {
  try {
    const raw = localStorage.getItem(`${PREFIX}${characterKey}_${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export const clearData = (key: string, characterKey = 'global') => {
  try {
    localStorage.removeItem(`${PREFIX}${characterKey}_${key}`)
  } catch {}
}

export const clearAllCharacterData = (characterKey: string) => {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${PREFIX}${characterKey}_`))
      .forEach(k => localStorage.removeItem(k))
  } catch {}
}