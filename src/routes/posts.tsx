import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformBadge, StatusBadge } from "@/components/ui/status-badge";
import { Calendar, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useClients } from "@/lib/clients/clients-store";

export const Route = createFileRoute("/posts")({
  head: () => ({ meta: [{ title: "Histórico de Posts — Takt Copilot" }] }),
  component: PostsPage,
});

type PostStatus = "planejado" | "producao" | "aprovado" | "publicado" | "rascunho";

type Post = {
  id: string;
  platform: string;
  format: string;
  title: string;
  excerpt: string;
  date: string;
  month: string;
  client: string;
  status: PostStatus;
};

const posts: Post[] = [
  { id: "1", platform: "Instagram", format: "Carrossel", title: "Lançamento da Nova Feature Q3", excerpt: "Anúncio oficial das novas capacidades de IA generativa integradas à plataforma principal...", date: "15 Out 2025", month: "2025-10", client: "TechCorp Inc.", status: "aprovado" },
  { id: "2", platform: "LinkedIn", format: "Artigo", title: "O Futuro das Finanças Descentralizadas", excerpt: "Uma análise profunda sobre como DeFi está moldando as novas regulações globais de mercado.", date: "10 Out 2025", month: "2025-10", client: "FinApp Solutions", status: "publicado" },
  { id: "3", platform: "Blog", format: "Post", title: "10 Dicas para uma Rotina Sustentável", excerpt: "Pequenas mudanças no dia a dia que podem reduzir significativamente sua pegada de carbono urbana.", date: "05 Out 2025", month: "2025-10", client: "EcoLife Health", status: "producao" },
  { id: "4", platform: "Instagram", format: "Reels", title: "Bastidores: Como construímos nossa API", excerpt: "Vídeo curto mostrando a equipe de engenharia durante o hackathon de final de ano.", date: "28 Set 2025", month: "2025-09", client: "TechCorp Inc.", status: "planejado" },
];

function PostsPage() {
  const clients = useClients();
  const [platform, setPlatform] = useState("all");
  const [client, setClient] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("all");
  const [format, setFormat] = useState("all");

  const filtered = useMemo(() => posts.filter((p) =>
    (platform === "all" || p.platform === platform) &&
    (client === "all" || p.client === client) &&
    (status === "all" || p.status === status) &&
    (month === "all" || p.month === month) &&
    (format === "all" || p.format === format)
  ), [platform, client, status, month, format]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Histórico de Posts</h1>
            <p className="text-muted-foreground mt-1">
              Visualize e filtre todo o conteúdo previamente publicado ou criado.
            </p>
          </div>
        </div>

        <Card className="p-3 bg-card/70 border-border/60">
          <div className="flex flex-wrap gap-2">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Blog">Blog</SelectItem>
              </SelectContent>
            </Select>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="producao">Em Produção</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Mês" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="2025-10">Outubro/25</SelectItem>
                <SelectItem value="2025-09">Setembro/25</SelectItem>
              </SelectContent>
            </Select>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Formato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os formatos</SelectItem>
                <SelectItem value="Estático">Estático</SelectItem>
                <SelectItem value="Carrossel">Carrossel</SelectItem>
                <SelectItem value="Reels">Reels</SelectItem>
                <SelectItem value="Stories">Stories</SelectItem>
                <SelectItem value="Artigo">Artigo</SelectItem>
                <SelectItem value="Post">Post</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <Card key={p.id} className={cn(
              "p-5 bg-card/70 border-border/60 shadow-card h-full flex flex-col",
              "transition hover:border-primary/50 hover:shadow-glow hover:-translate-y-0.5",
            )}>
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-2">
                  <PlatformBadge name={p.platform} />
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {p.format}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 -mr-1 -mt-1">
                      <MoreHorizontal className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="size-3.5" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="size-3.5" /> Duplicar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="size-3.5" /> Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to="/posts/$postId" params={{ postId: p.id }} className="flex-1">
                <h3 className="mt-4 text-lg font-display font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
              </Link>
              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> {p.date}</span>
                <span>{p.client}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
