import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Palette as PaletteIcon, User } from "lucide-react";
import { useAiSettings, AI_MODEL_OPTIONS, type AiModelId } from "@/lib/ai/ai-settings";
import { useTheme, type Theme } from "@/lib/theme";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Configurações — Takt Copilot" }] }),
  component: Settings,
});

const SIG_KEY = "takt.agency-signature";

function Settings() {
  const { settings, update } = useAiSettings();
  const { theme, setTheme } = useTheme();
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setSignature(localStorage.getItem(SIG_KEY) ?? "");
  }, []);

  function saveAll() {
    if (typeof window !== "undefined") localStorage.setItem(SIG_KEY, signature);
    toast.success("Configurações salvas");
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-4xl font-display font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">Perfil, IA, aparência e preferências do Copiloto.</p>
        </div>

        {/* Perfil */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-display text-lg">LV</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2"><User className="size-4" /> Perfil do Usuário</h2>
              <p className="text-xs text-muted-foreground">Suas informações de cadastro</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Nome"><Input defaultValue="Lucas Vieira" /></FieldRow>
            <FieldRow label="E-mail cadastrado"><Input type="email" defaultValue="lucas@takt.com" /></FieldRow>
            <FieldRow label="Função"><Input defaultValue="Estrategista de Conteúdo" /></FieldRow>
            <FieldRow label="Fuso Horário"><Input defaultValue="GMT-3 São Paulo" /></FieldRow>
          </div>
        </Card>

        {/* Aparência */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-5">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2"><PaletteIcon className="size-4 text-primary" /> Aparência</h2>
            <p className="text-xs text-muted-foreground">Escolha o tema padrão da plataforma.</p>
          </div>
          <FieldRow label="Tema padrão">
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </Card>

        {/* Configurações de IA */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-5">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Configurações de IA</h2>
            <p className="text-xs text-muted-foreground">Estas opções alimentam diretamente o Copiloto ao gerar posts.</p>
          </div>

          <FieldRow label="Modelo principal">
            <Select value={settings.primaryModel} onValueChange={(v) => update({ primaryModel: v as AiModelId })}>
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
          </FieldRow>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Criatividade da IA</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{settings.temperature.toFixed(1)}</span>
            </div>
            <Slider value={[settings.temperature]} min={0} max={1} step={0.1} onValueChange={(v) => update({ temperature: v[0] })} />
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Provedores habilitados</div>
            <ProviderToggle label="Claude (Anthropic)" desc="Análise visual · Estratégia · Revisão" color="bg-orange-500/15 text-orange-400" checked={settings.models.claude} onChange={(v) => update({ models: { ...settings.models, claude: v } })} />
            <ProviderToggle label="GPT (OpenAI)" desc="Copywriting · Geração de imagem" color="bg-emerald-500/15 text-emerald-400" checked={settings.models.gpt} onChange={(v) => update({ models: { ...settings.models, gpt: v } })} />
            <ProviderToggle label="Gemini (Google)" desc="Apoio multimodal" color="bg-sky-500/15 text-sky-400" checked={settings.models.gemini} onChange={(v) => update({ models: { ...settings.models, gemini: v } })} />
          </div>
        </Card>

        {/* Copiloto */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-4">
          <h2 className="font-semibold">Copiloto Criativo</h2>
          <ToggleRow label="Sugestões automáticas no editor" description="Recebe ganchos e ideias enquanto você escreve." checked={settings.copilot.autoSuggest} onChange={(v) => update({ copilot: { ...settings.copilot, autoSuggest: v } })} />
          <ToggleRow label="Gerar imagem de capa com IA" description="Cria criativos prontos para cada post." checked={settings.copilot.coverImage} onChange={(v) => update({ copilot: { ...settings.copilot, coverImage: v } })} />
          <ToggleRow label="Resumo semanal por e-mail" description="Receba o desempenho consolidado todas as segundas." checked={settings.copilot.weeklyDigest} onChange={(v) => update({ copilot: { ...settings.copilot, weeklyDigest: v } })} />
        </Card>

        {/* Assinatura da agência */}
        <Card className="p-6 bg-card/70 border-border/60 space-y-4">
          <div>
            <h2 className="font-semibold">Assinatura padrão da agência</h2>
            <p className="text-xs text-muted-foreground">Aparece ao final das legendas, quando aplicável.</p>
          </div>
          <Textarea rows={3} value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Ex: ✨ Conteúdo por Takt Agência · @takt.agency" />
        </Card>

        <div className="flex justify-end">
          <Button className="bg-gradient-primary shadow-glow hover:opacity-90" onClick={saveAll}>Salvar Alterações</Button>
        </div>
      </div>
    </AppShell>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ProviderToggle({ label, desc, color, checked, onChange }: { label: string; desc: string; color: string; checked: boolean; onChange: (v: boolean) => void }) {
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

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
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
