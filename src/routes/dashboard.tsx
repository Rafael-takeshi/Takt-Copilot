import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, PlatformBadge } from "@/components/ui/status-badge";
import { GitBranch, Clock, CheckCircle2, Megaphone, Filter, Search, ArrowRight, Sparkles, RotateCcw, Trash2 } from "lucide-react";
import {
  useGenerationHistory,
  openNewPostWithPrefill,
  removeGeneration,
  clearGenerationHistory,
  type GenerationHistoryItem,
} from "@/lib/ai/generation-history";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Início — Takt Copilot" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Planejados", value: 12, icon: GitBranch, color: "text-info bg-info/15" },
  { label: "Em Produção", value: 5, icon: Clock, color: "text-warning bg-warning/15" },
  { label: "Aprovados", value: 8, icon: CheckCircle2, color: "text-success bg-success/15" },
  { label: "Publicados", value: 24, icon: Megaphone, color: "text-primary bg-primary/15" },
];

const posts = [
  { id: "1", title: "Dicas de Produtividade para 2026", platform: "LinkedIn", status: "planejado" as const },
  { id: "2", title: "Novas Funcionalidades do Produto", platform: "Instagram", status: "producao" as const },
  { id: "3", title: "Case de Sucesso: Empresa X", platform: "LinkedIn", status: "aprovado" as const },
];

function Dashboard() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold">Início</h1>
          <p className="text-muted-foreground mt-1">Visão geral da sua produção de conteúdo</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 bg-card/70 border-border/60 shadow-card">
              <div className={`size-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="size-5" />
              </div>
              <div className="mt-4 text-4xl font-display font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-card/70 border-border/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground pr-2 border-r border-border/60">
              <Filter className="size-3.5" /> Filtros
            </span>
            <Select defaultValue="mes"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mês Atual</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todas"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Redes</SelectItem>
                <SelectItem value="ig">Instagram</SelectItem>
                <SelectItem value="li">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all"><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar posts..." />
          </div>
        </Card>

        <GenerationHistorySection />

        <section>
          <h2 className="text-lg font-semibold mb-3">Posts Recentes</h2>
          <Card className="bg-card/70 border-border/60 overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/60">
                  <th className="px-5 py-3 font-medium">Título</th>
                  <th className="px-5 py-3 font-medium">Plataforma</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition">
                    <td className="px-5 py-4 font-medium">{p.title}</td>
                    <td className="px-5 py-4"><PlatformBadge name={p.platform} /></td>
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <Link to="/posts/$postId" params={{ postId: p.id }} className="inline-flex items-center gap-1 text-primary hover:underline">
                        Abrir <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <div className="size-10 rounded-full bg-gradient-primary flex items-center justify-center font-semibold text-primary-foreground">
            AS
          </div>
          <div>
            <div className="font-medium">Ana Silva</div>
            <div className="text-xs text-muted-foreground">Social Media</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GenerationHistorySection() {
  const items = useGenerationHistory();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> Últimas gerações de IA
        </h2>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => clearGenerationHistory()}
          >
            <Trash2 className="size-3.5" /> Limpar
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="p-8 bg-card/70 border-border/60 border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma geração ainda. Clique em <span className="text-foreground font-medium">Novo Post</span> e use o Copiloto para criar a primeira.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.slice(0, 6).map((it) => (
            <GenerationCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}

function GenerationCard({ item }: { item: GenerationHistoryItem }) {
  return (
    <Card className="p-4 bg-card/70 border-border/60 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <PlatformBadge name={item.platform} />
        <span className="text-[11px] text-muted-foreground">{relativeTime(item.createdAt)}</span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tema</div>
        <div className="text-sm font-medium line-clamp-1">{item.theme || "—"}</div>
      </div>
      {item.hook && (
        <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          "{item.hook}"
        </div>
      )}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-muted-foreground capitalize">
          {item.format} · {item.objective}
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeGeneration(item.id)}
            aria-label="Remover"
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary shadow-glow hover:opacity-90"
            onClick={() => openNewPostWithPrefill(item)}
          >
            <RotateCcw className="size-3.5" /> Reutilizar
          </Button>
        </div>
      </div>
    </Card>
  );
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h atrás`;
  const d = Math.floor(h / 24);
  return `${d} d atrás`;
}
