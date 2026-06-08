import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/ui/status-badge";
import { ArrowLeft, Share2, Copy, Pencil, Heart, MessageCircle, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/posts/$postId")({
  head: () => ({ meta: [{ title: "Post — Takt Copilot" }] }),
  component: PostDetail,
});

function PostDetail() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/posts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar para Posts
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Share2 className="size-4" /> Compartilhar</Button>
            <Button variant="outline" size="sm"><Copy className="size-4" /> Duplicar</Button>
            <Button size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90"><Pencil className="size-4" /> Editar</Button>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-0.5 text-xs">Rascunho</span>
          <h1 className="mt-2 text-4xl font-display font-bold">Estratégias de Growth para SaaS B2B</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-5">
            <Card className="p-5 bg-card/70 border-border/60">
              <h2 className="text-sm font-semibold mb-4 inline-flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Preview do Post
              </h2>
              <div className="bg-background/60 rounded-lg overflow-hidden border border-border/50">
                <div className="px-4 py-3 text-sm font-medium">takt.copilot</div>
                <div className="aspect-square w-full bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-900 flex items-center justify-center text-muted-foreground text-sm">
                  Preview do criativo
                </div>
                <div className="flex gap-4 px-4 py-3 text-muted-foreground">
                  <Heart className="size-5" />
                  <MessageCircle className="size-5" />
                  <Send className="size-5" />
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card/70 border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Legenda</h2>
                <button className="text-xs text-primary inline-flex items-center gap-1 hover:underline"><Copy className="size-3" /> Copiar</button>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Descubra como avançar no crescimento do seu SaaS com 5 estratégias comprovadas. 🚀</p>
                <p>Neste post, exploramos 5 táticas essenciais para otimizar sua aquisição de clientes:</p>
                <ul className="space-y-1.5 pl-1">
                  <li>🟣 Onboarding Personalizado: Reduza o churn nas primeiras semanas.</li>
                  <li>🟣 Marketing de Conteúdo Focado em Cases de Uso: Mostre o valor real da sua ferramenta.</li>
                  <li>🟣 Otimização de Trial: Converta usuários gratuitos em pagantes de forma fluida.</li>
                </ul>
                <p>Qual dessas estratégias você já implementou? Conte pra gente nos comentários 👇</p>
                <p className="text-primary">#martechmoderno #SaaS #MarketingB2B #TaktCopilot</p>
              </div>
            </Card>

            <Card className="p-5 bg-card/70 border-border/60 space-y-3">
              <h2 className="text-sm font-semibold">Roteiro e Observações Internas</h2>
              <ul className="text-sm space-y-2">
                <li><b>Objetivo:</b> Gerar engajamento e autoridade no nicho de SaaS.</li>
                <li><b>Tom de Voz:</b> Profissional, Educativo e direto.</li>
                <li><b>Nota para Design:</b> Usar a paleta secundária (Roxo) para destacar os números no carrossel.</li>
                <li><b>Call to Action:</b> Focado em comentários para aumentar o alcance orgânico.</li>
              </ul>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="p-5 bg-card/70 border-border/60 space-y-4">
              <h2 className="text-sm font-semibold">Detalhes do Post</h2>
              <Detail label="Plataforma" value={<PlatformBadge name="Instagram" />} />
              <Detail label="Formato" value="Carrossel (5 Slides)" />
              <Detail label="Cliente / Projeto" value="Takt Interno" />
              <Detail label="Autor" value={<div className="flex items-center gap-2"><div className="size-6 rounded-full bg-gradient-primary" /> Time de Conteúdo</div>} />
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
