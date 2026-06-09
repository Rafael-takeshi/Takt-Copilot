import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Lightbulb, Plus, Bookmark } from "lucide-react";
import { useMemo, useState } from "react";
import { useClients } from "@/lib/clients/clients-store";
import { openNewPostWithPrefill } from "@/lib/ai/generation-history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ideas")({
  head: () => ({ meta: [{ title: "Ideias — Takt Copilot" }] }),
  component: Ideas,
});

type Idea = {
  title: string;
  description: string;
  category: "Educativo" | "Venda" | "Institucional" | "Bastidores" | "Prova Social" | "Data Comemorativa";
  platform: string;
  objective: string;
  suggestedClient?: string;
};

const ideas: Idea[] = [
  { category: "Educativo", title: "Por que automatizar fluxos repetitivos?", description: "5 minutos de leitura que economizam 5 horas por semana.", platform: "LinkedIn", objective: "geracao-valor", suggestedClient: "TechCorp Inc." },
  { category: "Venda", title: "Promo relâmpago: 48h com 30% off", description: "Comunicação direta, urgência e prova social.", platform: "Instagram", objective: "venda" },
  { category: "Bastidores", title: "Como nosso time planeja conteúdo", description: "Um olhar transparente sobre o processo da agência.", platform: "Instagram", objective: "institucional" },
  { category: "Prova Social", title: "Case: +210% de leads em 90 dias", description: "Histórico real com números e print do dashboard.", platform: "LinkedIn", objective: "prova-social", suggestedClient: "FinApp Solutions" },
  { category: "Educativo", title: "3 métricas que ninguém olha (mas deveria)", description: "Vá além do CTR. Mostre CAC, LTV e payback.", platform: "LinkedIn", objective: "geracao-valor" },
  { category: "Data Comemorativa", title: "Dia do Cliente: bastidores de uma entrega", description: "Conteúdo emocional para criar conexão.", platform: "Instagram", objective: "engajamento" },
];

const categories = ["Todas", "Educativo", "Venda", "Institucional", "Bastidores", "Prova Social", "Data Comemorativa"] as const;

const CATEGORY_STYLE: Record<string, string> = {
  Educativo: "bg-info/15 text-info border-info/30",
  Venda: "bg-success/15 text-success border-success/30",
  Institucional: "bg-primary/15 text-primary border-primary/30",
  Bastidores: "bg-warning/15 text-warning border-warning/30",
  "Prova Social": "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  "Data Comemorativa": "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function Ideas() {
  const clients = useClients();
  const [client, setClient] = useState("all");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");
  const [platform, setPlatform] = useState("all");
  const [objective, setObjective] = useState("all");

  const filtered = useMemo(() => ideas.filter((i) =>
    (category === "Todas" || i.category === category) &&
    (platform === "all" || i.platform === platform) &&
    (objective === "all" || i.objective === objective) &&
    (client === "all" || i.suggestedClient === client)
  ), [client, category, platform, objective]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Ideias</h1>
            <p className="text-muted-foreground mt-1">Brainstorm contínuo para alimentar a esteira da agência.</p>
          </div>
          <Button className="bg-gradient-primary shadow-glow hover:opacity-90">
            <Sparkles className="size-4" /> Gerar Novas Ideias
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-3 bg-card/70 border-border/60">
          <div className="flex flex-wrap gap-2">
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Plataforma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Blog">Blog</SelectItem>
              </SelectContent>
            </Select>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Objetivo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os objetivos</SelectItem>
                <SelectItem value="engajamento">Engajamento</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
                <SelectItem value="geracao-valor">Geração de Valor</SelectItem>
                <SelectItem value="prova-social">Prova Social</SelectItem>
                <SelectItem value="data-comemorativa">Data Comemorativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-10 bg-card/70 border-dashed border-border/60 text-center">
            <Lightbulb className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma ideia para os filtros selecionados.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((i) => (
              <Card key={i.title} className="p-5 bg-card/70 border-border/60 shadow-card hover:border-primary/50 transition flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold rounded-full border px-2 py-0.5", CATEGORY_STYLE[i.category])}>
                    <Lightbulb className="size-3" /> {i.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{i.platform}</span>
                </div>
                <h3 className="mt-3 text-lg font-display font-semibold leading-snug">{i.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground flex-1">{i.description}</p>
                {i.suggestedClient && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Cliente sugerido: <span className="text-foreground font-medium">{i.suggestedClient}</span>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-primary shadow-glow hover:opacity-90"
                    onClick={() => openNewPostWithPrefill({
                      theme: i.title,
                      platform: i.platform,
                      objective: i.objective,
                      client: i.suggestedClient ?? "",
                    })}
                  >
                    <Plus className="size-3.5" /> Transformar em Post
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Salvar">
                    <Bookmark className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
