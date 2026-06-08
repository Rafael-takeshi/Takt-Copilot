import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, Plus } from "lucide-react";

export const Route = createFileRoute("/ideas")({
  head: () => ({ meta: [{ title: "Ideias — Takt Copilot" }] }),
  component: Ideas,
});

const ideas = [
  { title: "Por que automatizar fluxos repetitivos?", hook: "5 minutos de leitura que economizam 5 horas por semana.", tag: "Educativo" },
  { title: "O erro mais comum em campanhas B2B", hook: "E como evitá-lo nas próximas 24h.", tag: "Insight" },
  { title: "Bastidores: como nosso time planeja conteúdo", hook: "Um olhar transparente sobre o processo.", tag: "Bastidores" },
  { title: "3 métricas que ninguém olha (mas deveria)", hook: "Vá além do CTR.", tag: "Dados" },
];

function Ideas() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold">Ideias</h1>
            <p className="text-muted-foreground mt-1">Brainstorm contínuo do Copiloto Criativo.</p>
          </div>
          <Button className="bg-gradient-primary shadow-glow hover:opacity-90">
            <Sparkles className="size-4" /> Gerar Novas Ideias
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ideas.map((i) => (
            <Card key={i.title} className="p-5 bg-card/70 border-border/60 shadow-card hover:border-primary/50 transition">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary font-semibold">
                <Lightbulb className="size-3.5" /> {i.tag}
              </div>
              <h3 className="mt-3 text-lg font-display font-semibold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.hook}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm"><Plus className="size-3.5" /> Transformar em Post</Button>
                <Button variant="ghost" size="sm">Salvar</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
