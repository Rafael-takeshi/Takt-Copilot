import { useEffect, useState } from "react";

export type Client = {
  id: string;
  // básico
  name: string;
  segment: string;
  cityUf: string;
  site: string;
  instagram: string;
  whatsapp: string;
  responsible: string;
  // estratégico
  products: string;
  audience: string;
  pains: string;
  differentials: string;
  contentGoal: string;
  tone: string;
  avoidWords: string;
  defaultCtas: string;
  // identidade visual
  colors: string;
  fonts: string;
  visualStyle: string;
  designNotes: string;
  // meta
  status: "ativo" | "inativo";
  createdAt: number;
};

export const EMPTY_CLIENT: Omit<Client, "id" | "createdAt"> = {
  name: "", segment: "", cityUf: "", site: "", instagram: "", whatsapp: "", responsible: "",
  products: "", audience: "", pains: "", differentials: "", contentGoal: "", tone: "",
  avoidWords: "", defaultCtas: "",
  colors: "", fonts: "", visualStyle: "", designNotes: "",
  status: "ativo",
};

const STORAGE_KEY = "takt.clients.v1";
const EVENT = "takt:clients-changed";

const SEED: Client[] = [
  {
    id: "seed-1", createdAt: Date.now() - 86_400_000,
    name: "TechCorp Inc.", segment: "SaaS B2B", cityUf: "São Paulo/SP",
    site: "techcorp.com", instagram: "@techcorp", whatsapp: "(11) 99999-0000",
    responsible: "Mariana Costa",
    products: "Plataforma de automação de fluxos",
    audience: "Gestores de operações em médias empresas",
    pains: "Processos manuais, falta de visibilidade",
    differentials: "Implementação em 7 dias, suporte 24/7",
    contentGoal: "Geração de leads qualificados",
    tone: "Profissional e direto",
    avoidWords: "barato, simples",
    defaultCtas: "Agende uma demo",
    colors: "#6366F1, #111827",
    fonts: "Inter",
    visualStyle: "Clean, minimalista, tech",
    designNotes: "Sempre usar mockups da plataforma",
    status: "ativo",
  },
  {
    id: "seed-2", createdAt: Date.now() - 2 * 86_400_000,
    name: "FinApp Solutions", segment: "Fintech", cityUf: "Rio de Janeiro/RJ",
    site: "finapp.io", instagram: "@finapp", whatsapp: "(21) 98888-1111",
    responsible: "Bruno Silva",
    products: "App de gestão financeira pessoal",
    audience: "Jovens 25-35 que querem organizar finanças",
    pains: "Falta de educação financeira, ansiedade com dinheiro",
    differentials: "Open finance integrado, sem mensalidade",
    contentGoal: "Engajamento e autoridade",
    tone: "Educativo e descontraído",
    avoidWords: "complicado, técnico",
    defaultCtas: "Baixe grátis",
    colors: "#10B981, #1F2937",
    fonts: "Manrope",
    visualStyle: "Moderno, ilustrações vibrantes",
    designNotes: "Evitar fotos de stock",
    status: "ativo",
  },
];

function read(): Client[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Client[];
  } catch {
    return SEED;
  }
}

function write(list: Client[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function listClients() { return read(); }

export function saveClient(c: Client): Client {
  const list = read();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.unshift(c);
  write(list);
  return c;
}

export function createClient(data: Omit<Client, "id" | "createdAt">): Client {
  const c: Client = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
  return saveClient(c);
}

export function deleteClient(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function useClients() {
  const [items, setItems] = useState<Client[]>([]);
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
