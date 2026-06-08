import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { useAiSettings, AI_MODEL_OPTIONS, type AiModelId } from "@/lib/ai/ai-settings";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Configurações — Takt Copilot" }] }),
  component: Settings,
});

function Settings() {
  const { settings, update } = useAiSettings();

  return (
    <AppShell>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-4xl font-display font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">Perfil, IA e preferências do Copiloto.</p>
        </div>

        {/* Perfil */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-display text-lg">
                LV
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">Perfil do Usuário</h2>
              <p className="text-xs text-muted-foreground">Suas informações de cadastro</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nome</Label>
              <Input defaultValue="Lucas Vieira" placeholder="Seu nome" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">E-mail cadastrado</Label>
              <Input type="email" defaultValue="lucas@takt.com" placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Função</Label>
              <Input defaultValue="Estrategista de Conteúdo" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fuso Horário</Label>
              <Input defaultValue="GMT-3 São Paulo" />
            </div>
          </div>
        </Card>

        {/* Configurações de IA */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Configurações de IA
              </h2>
              <p className="text-xs text-muted-foreground">
                Estas opções alimentam diretamente o Copiloto ao gerar posts.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Modelo principal</Label>
            <Select
              value={settings.primaryModel}
              onValueChange={(v) => update({ primaryModel: v as AiModelId })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AI_MODEL_OPTIONS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col">
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Criatividade (temperature)
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(v) => update({ temperature: v[0] })}
            />
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Provedores habilitados</div>
            <ProviderToggle
              label="Claude (Anthropic)"
              desc="Análise visual · Estratégia · Revisão"
              color="bg-orange-500/15 text-orange-400"
              checked={settings.models.claude}
              onChange={(v) => update({ models: { ...settings.models, claude: v } })}
            />
            <ProviderToggle
              label="GPT (OpenAI)"
              desc="Copywriting · Geração de imagem"
              color="bg-emerald-500/15 text-emerald-400"
              checked={settings.models.gpt}
              onChange={(v) => update({ models: { ...settings.models, gpt: v } })}
            />
            <ProviderToggle
              label="Gemini (Google)"
              desc="Apoio multimodal"
              color="bg-sky-500/15 text-sky-400"
              checked={settings.models.gemini}
              onChange={(v) => update({ models: { ...settings.models, gemini: v } })}
            />
          </div>
        </Card>

        {/* Copiloto */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-4">
          <h2 className="font-semibold">Copiloto Criativo</h2>
          <ToggleRow
            label="Sugestões automáticas no editor"
            description="Recebe ganchos e ideias enquanto você escreve."
            checked={settings.copilot.autoSuggest}
            onChange={(v) => update({ copilot: { ...settings.copilot, autoSuggest: v } })}
          />
          <ToggleRow
            label="Gerar imagem de capa com IA"
            description="Cria criativos prontos para cada post."
            checked={settings.copilot.coverImage}
            onChange={(v) => update({ copilot: { ...settings.copilot, coverImage: v } })}
          />
          <ToggleRow
            label="Resumo semanal por e-mail"
            description="Receba o desempenho consolidado todas as segundas."
            checked={settings.copilot.weeklyDigest}
            onChange={(v) => update({ copilot: { ...settings.copilot, weeklyDigest: v } })}
          />
        </Card>

        <div className="flex justify-end">
          <Button
            className="bg-gradient-primary shadow-glow hover:opacity-90"
            onClick={() => toast.success("Configurações salvas")}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function ProviderToggle({
  label, desc, color, checked, onChange,
}: { label: string; desc: string; color: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/50 p-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`size-10 shrink-0 rounded-lg flex items-center justify-center ${color}`}>
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-t border-border/40 first:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
