import { useEffect, useState } from "react";

export type GenerationHistoryItem = {
  id: string;
  createdAt: number;
  // inputs
  client: string;
  theme: string;
  platform: string;
  format: string;
  objective: string;
  tone: string;
  // outputs
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  reelsScript: { time: string; text: string }[];
  artText?: string;
  visualDirection?: string;
  palette?: string;
  font?: string;
  imagePrompt?: string;
};

const STORAGE_KEY = "takt.generation-history.v1";
const MAX_ITEMS = 20;
const EVENT = "takt:generation-history-changed";
export const OPEN_NEWPOST_EVENT = "takt:open-newpost";

export type NewPostPrefill = Partial<
  Pick<GenerationHistoryItem,
    "client" | "theme" | "platform" | "format" | "objective" | "tone"
    | "hook" | "caption" | "cta" | "hashtags" | "reelsScript"
    | "artText" | "visualDirection" | "palette" | "font" | "imagePrompt">
>;

function read(): GenerationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GenerationHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: GenerationHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addGenerationToHistory(item: Omit<GenerationHistoryItem, "id" | "createdAt">) {
  const next: GenerationHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const list = [next, ...read()].slice(0, MAX_ITEMS);
  write(list);
  return next;
}

export function removeGeneration(id: string) {
  write(read().filter((g) => g.id !== id));
}

export function clearGenerationHistory() {
  write([]);
}

export function useGenerationHistory() {
  const [items, setItems] = useState<GenerationHistoryItem[]>([]);
  useEffect(() => {
    setItems(read());
    const refresh = () => setItems(read());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return items;
}

export function openNewPostWithPrefill(prefill: NewPostPrefill) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<NewPostPrefill>(OPEN_NEWPOST_EVENT, { detail: prefill }));
}
