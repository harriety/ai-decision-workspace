// ============================================
// LLM Adapter - Provider Agnostic AI Service
// ============================================

import { generateText as generateMockText } from './mock';
import { readStoredProvider } from './provider';

export type LLMProvider = 'mock' | 'openai' | 'gemini' | 'deepseek';

export interface LLMRequest {
  provider: LLMProvider;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
}

// ============================================
// Configuration
// ============================================

const CONFIG = {
  DEFAULT_PROVIDER: (import.meta.env.VITE_LLM_PROVIDER || 'mock') as LLMProvider,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 1000,
  USE_PROXY: import.meta.env.VITE_LLM_USE_PROXY === 'true',

  // Provider-specific configurations
  PROVIDERS: {
    openai: {
      apiKey: (import.meta.env.VITE_OPENAI_API_KEY || '').trim() || undefined,
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
    gemini: {
      apiKey: (import.meta.env.VITE_GEMINI_API_KEY || '').trim() || undefined,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-pro',
      baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com',
    },
    deepseek: {
      apiKey: (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim() || undefined,
      model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      baseUrl: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    },
  },
};

const getBaseUrl = (provider: LLMProvider, fallback: string) => {
  if (!CONFIG.USE_PROXY) return fallback;

  switch (provider) {
    case 'openai':
      return '/api/openai';
    case 'gemini':
      return '/api/gemini';
    case 'deepseek':
      return '/api/deepseek';
    default:
      return fallback;
  }
};

const resolveProvider = (requested?: LLMProvider): LLMProvider => {
  if (requested) return requested;
  const stored = readStoredProvider();
  return stored || CONFIG.DEFAULT_PROVIDER;
};

// ============================================
// Provider Detection
// ============================================

/**
 * Check if a provider is available (has API key)
 */
export const isProviderAvailable = (provider: LLMProvider): boolean => {
  if (provider === 'mock') return true;

  const providerConfig = CONFIG.PROVIDERS[provider];
  return !!providerConfig?.apiKey;
};

/**
 * Get the best available provider
 */
export const getBestAvailableProvider = (): LLMProvider => {
  // Check providers in order of preference
  const preferredOrder: LLMProvider[] = ['openai', 'gemini', 'deepseek', 'mock'];

  for (const provider of preferredOrder) {
    if (isProviderAvailable(provider)) {
      return provider;
    }
  }

  return 'mock';
};

// ============================================
// Provider Implementations
// ============================================

/**
 * OpenAI implementation
 */
async function generateWithOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const config = CONFIG.PROVIDERS.openai;
  const startTime = Date.now();
  const baseUrl = getBaseUrl('openai', config.baseUrl);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        temperature: request.temperature || CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: request.maxTokens || CONFIG.DEFAULT_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      text: data.choices[0]?.message?.content || '',
      provider: 'openai',
      model: config.model,
      usage: data.usage && {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      latencyMs,
    };
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    throw error;
  }
}

/**
 * Gemini implementation
 */
async function generateWithGemini(request: LLMRequest): Promise<LLMResponse> {
  const config = CONFIG.PROVIDERS.gemini;
  const startTime = Date.now();
  const baseUrl = getBaseUrl('gemini', config.baseUrl);
  const keyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
  const modelPath = (() => {
    const trimmed = (config.model || '').trim();
    if (!trimmed) return 'models/gemini-1.5-pro';
    if (trimmed.includes('/')) return trimmed.replace(/^\//, '');
    return `models/${trimmed}`;
  })();

  try {
    const response = await fetch(
      `${baseUrl}/v1beta/${modelPath}:generateContent${keyParam}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: request.userPrompt }],
            },
          ],
          generationConfig: {
            temperature: request.temperature || CONFIG.DEFAULT_TEMPERATURE,
            maxOutputTokens: request.maxTokens || CONFIG.DEFAULT_MAX_TOKENS,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: 'gemini',
      model: config.model,
      latencyMs,
    };
  } catch (error) {
    console.error('Gemini generation failed:', error);
    throw error;
  }
}

/**
 * DeepSeek implementation
 */
async function generateWithDeepSeek(request: LLMRequest): Promise<LLMResponse> {
  const config = CONFIG.PROVIDERS.deepseek;
  const startTime = Date.now();
  const baseUrl = getBaseUrl('deepseek', config.baseUrl);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        temperature: request.temperature || CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: request.maxTokens || CONFIG.DEFAULT_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      text: data.choices[0]?.message?.content || '',
      provider: 'deepseek',
      model: config.model,
      usage: data.usage && {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      latencyMs,
    };
  } catch (error) {
    console.error('DeepSeek generation failed:', error);
    throw error;
  }
}

// ============================================
// Main Generation Function
// ============================================

/**
 * Generate text using specified provider
 */
export async function generateText(request: Partial<LLMRequest> = {}): Promise<LLMResponse> {
  const provider = resolveProvider(request.provider);
  const systemPrompt = request.systemPrompt || 'You are a helpful AI assistant.';
  const userPrompt = request.userPrompt || '';

  // Validate provider availability
  if (!isProviderAvailable(provider)) {
    console.warn(`Provider ${provider} not available, falling back to mock`);
    return generateMockText({
      provider: 'mock',
      systemPrompt,
      userPrompt,
    });
  }

  const fullRequest: LLMRequest = {
    provider,
    systemPrompt,
    userPrompt,
    temperature: request.temperature,
    maxTokens: request.maxTokens,
  };

  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(fullRequest);
      case 'gemini':
        return await generateWithGemini(fullRequest);
      case 'deepseek':
        return await generateWithDeepSeek(fullRequest);
      case 'mock':
      default:
        return await generateMockText(fullRequest);
    }
  } catch (error) {
    console.error(`Generation with ${provider} failed:`, error);

    // Fallback to mock if real provider fails
    if (provider !== 'mock') {
      console.log('Falling back to mock provider');
      return generateMockText(fullRequest);
    }

    throw error;
  }
}

/**
 * Batch generate text for multiple requests
 */
export async function generateTextBatch(
  requests: Partial<LLMRequest>[]
): Promise<LLMResponse[]> {
  const results: LLMResponse[] = [];

  for (const request of requests) {
    try {
      const result = await generateText(request);
      results.push(result);
    } catch (error) {
      console.error('Batch generation failed for request:', request, error);
      // Continue with other requests even if one fails
      results.push({
        text: 'Generation failed',
        provider: request.provider || 'mock',
      });
    }
  }

  return results;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English
  // For Chinese: 1 token ≈ 2 characters
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;

  return Math.ceil((chineseChars / 2) + (otherChars / 4));
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  let currentTokens = estimateTokens(text);

  if (currentTokens <= maxTokens) {
    return text;
  }

  // Simple truncation (in production, use proper tokenization)
  const ratio = maxTokens / currentTokens;
  const targetLength = Math.floor(text.length * ratio * 0.9); // 10% buffer

  return text.substring(0, targetLength) + '...';
}
