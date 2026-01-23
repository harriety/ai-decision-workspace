/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_PROVIDER?: 'mock' | 'openai' | 'gemini' | 'deepseek';
  readonly VITE_LLM_USE_PROXY?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
  readonly VITE_OPENAI_BASE_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  readonly VITE_GEMINI_BASE_URL?: string;
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly VITE_DEEPSEEK_MODEL?: string;
  readonly VITE_DEEPSEEK_BASE_URL?: string;
  readonly VITE_ROI_THRESHOLD_X?: string;
  readonly VITE_ROI_THRESHOLD_Y?: string;
  readonly VITE_MIN_PROBLEM_LENGTH?: string;
  readonly VITE_MAX_PROBLEM_LENGTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
