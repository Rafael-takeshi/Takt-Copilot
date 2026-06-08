import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlatformBadge } from "@/components/ui/status-badge";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/posts")({
  head: () => ({ meta: [{ title: "Histórico de Posts — Takt Copilot" }] }),
  component: PostsPage,
});

type Post = {
  id: string;
  platform: string;
  format: string;
  title: string;
  excerpt: string;
  date: string;
  client: string;
};

const posts: Post[] = [
  { id: "1", platform: "Instagram", format: "Carrossel", title: "Lançamento da Nova Feature Q3", excerpt: "Anúncio oficial das novas capacidades de IA generativa integradas à plataforma principal...", date: "15 Out 2025", client: "TechCorp Inc." },
  { id: "2", platform: "LinkedIn", format: "Artigo", title: "O Futuro das Finanças Descentralizadas", excerpt: "Uma análise profunda sobre como DeFi está moldando as novas regulações globais de mercado.", date: "10 Out 2025", client: "FinApp Solutions" },
  { id: "3", platform: "Blog", format: "Post", title: "10 Dicas para uma Rotina Sustentável", excerpt: "Pequenas mudanças no dia a dia que podem reduzir significativamente sua pegada de carbono urbana.", date: "05 Out 2025", client: "EcoLife Health" },
  { id: "4", platform: "Instagram", format: "Reels", title: "Bastidores: Como construímos nossa API", excerpt: "Vídeo curto mostrando a equipe de engenharia durante o hackathon de final de ano.", date: "28 Set 2025", client: "TechCorp Inc." },
];

function PostsPage() {
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
          <div className="flex gap-2">
            <Select defaultValue="all"><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Plataformas</SelectItem>
                <SelectItem value="ig">Instagram</SelectItem>
                <SelectItem value="li">LinkedIn</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all"><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                <SelectItem value="tech">TechCorp Inc.</SelectItem>
                <SelectItem value="fin">FinApp Solutions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link key={p.id} to="/posts/$postId" params={{ postId: p.id }}>
              <Card className={cn(
                "p-5 bg-card/70 border-border/60 shadow-card h-full",
                "transition hover:border-primary/50 hover:shadow-glow hover:-translate-y-0.5",
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <PlatformBadge name={p.platform} />
                    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {p.format}
                    </span>
                  </div>
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-display font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> {p.date}</span>
                  <span>{p.client}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
