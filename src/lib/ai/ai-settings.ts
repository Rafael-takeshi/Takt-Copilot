import { useEffect, useState } from "react";

export type AiModelId =
  | "google/gemini-3-flash-preview"
  | "google/gemini-2.5-pro"
  | "google/gemini-2.5-flash"
  | "openai/gpt-5"
  | "openai/gpt-5-mini";

export type AiSettings = {
  primaryModel: AiModelId;
  models: {
    claude: boolean;
    gpt: boolean;
    gemini: boolean;
  };
  copilot: {
    autoSuggest: boolean;
    coverImage: boolean;
    weeklyDigest: boolean;
  };
  temperature: number;
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  primaryModel: "google/gemini-3-flash-preview",
  models: { claude: true, gpt: true, gemini: true },
  copilot: { autoSuggest: true, coverImage: false, weeklyDigest: true },
  temperature: 0.7,
};

export const AI_MODEL_OPTIONS: { id: AiModelId; label: string; desc: string }[] = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Padrão)", desc: "Rápido e equilibrado" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Raciocínio avançado" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Baixo custo, alta velocidade" },
  { id: "openai/gpt-5", label: "GPT-5", desc: "Premium OpenAI" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini", desc: "OpenAI econômico" },
];

const STORAGE_KEY = "takt.ai-settings.v1";

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAiSettings(s: AiSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);

  useEffect(() => {
    setSettings(loadAiSettings());
  }, []);

  const update = (patch: Partial<AiSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveAiSettings(next);
      return next;
    });
  };

  return { settings, setSettings, update };
}
