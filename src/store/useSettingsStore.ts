import { create } from 'zustand';
import type { LLMProvider } from '@/lib/llm/adapter';
import { readStoredProvider, writeStoredProvider } from '@/lib/llm/provider';

const DEFAULT_PROVIDER = (import.meta.env.VITE_LLM_PROVIDER || 'mock') as LLMProvider;

interface SettingsState {
  llmProvider: LLMProvider;
  setLlmProvider: (provider: LLMProvider) => void;
}

const initialProvider = readStoredProvider() || DEFAULT_PROVIDER;

export const useSettingsStore = create<SettingsState>(set => ({
  llmProvider: initialProvider,
  setLlmProvider: provider => {
    writeStoredProvider(provider);
    set({ llmProvider: provider });
  },
}));
