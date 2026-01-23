import type { LLMProvider } from './adapter';

const SETTINGS_KEY = 'ai-decision-workspace:settings';

interface SettingsPayload {
  llmProvider?: LLMProvider;
}

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readSettings = (): SettingsPayload => {
  try {
    const storage = getStorage();
    if (!storage) return {};
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SettingsPayload;
  } catch {
    return {};
  }
};

export const readStoredProvider = (): LLMProvider | null => {
  const settings = readSettings();
  return settings.llmProvider || null;
};

export const writeStoredProvider = (provider: LLMProvider) => {
  try {
    const storage = getStorage();
    if (!storage) return;
    const settings = readSettings();
    storage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        ...settings,
        llmProvider: provider,
      })
    );
  } catch {
    // Ignore storage failures.
  }
};
