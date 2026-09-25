/**
 * Groq exposes every model on the account (chat, STT, TTS, guards).
 * The assistant UI should only offer chat-capable LLMs.
 */

/** Groq no longer serves these ids. They must not be offered in Fast / Smart. */
const RETIRED_CHAT_MODELS = new Set([
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama-3.3-70b-specdec',
  'meta-llama/llama-4-scout-17b-16e-instruct',
]);

const NON_CHAT_PATTERNS = [
  /whisper/i,
  /transcri/i,
  /speech/i,
  /tts/i,
  /orpheus/i,
  /audio/i,
  /prompt-guard/i,
  /safeguard/i,
  /guard[-_]?2/i,
  /embed/i,
  /rerank/i,
];

export type ModelPace = 'fast' | 'smart';

/** Smaller, quicker chat models. First available id is used for Fast. */
const FAST_CHAT_MODELS = [
  'openai/gpt-oss-20b',
  'groq/compound-mini',
  'allam-2-7b',
] as const;

/** Larger chat models. First available id is used for Smart. */
const SMART_CHAT_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
  'groq/compound',
] as const;

/** Preferred order for the chat model picker (first match wins for default). */
export const PREFERRED_CHAT_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
  'openai/gpt-oss-20b',
  'groq/compound',
  'groq/compound-mini',
  'allam-2-7b',
] as const;

export function isChatModel(modelId: string): boolean {
  const id = modelId.trim();
  if (!id || RETIRED_CHAT_MODELS.has(id)) return false;
  return !NON_CHAT_PATTERNS.some((pattern) => pattern.test(id));
}

export function filterChatModels(modelIds: string[]): string[] {
  const chat = [...new Set(modelIds.filter(isChatModel))];

  chat.sort((a, b) => {
    const ai = PREFERRED_CHAT_MODELS.indexOf(a as (typeof PREFERRED_CHAT_MODELS)[number]);
    const bi = PREFERRED_CHAT_MODELS.indexOf(b as (typeof PREFERRED_CHAT_MODELS)[number]);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.localeCompare(b);
  });

  return chat;
}

export function pickDefaultChatModel(available: string[], fallback = 'openai/gpt-oss-120b'): string {
  for (const preferred of PREFERRED_CHAT_MODELS) {
    if (available.includes(preferred)) return preferred;
  }
  return available[0] || fallback;
}

/** Map the Fast / Smart picker onto a real chat model the account can run. */
export function resolvePaceModel(pace: ModelPace, available: string[]): string {
  const preferred = pace === 'fast' ? FAST_CHAT_MODELS : SMART_CHAT_MODELS;
  const choices = available.length ? available : [...preferred];
  for (const id of preferred) {
    if (choices.includes(id)) return id;
  }
  return choices[0] || preferred[0];
}
