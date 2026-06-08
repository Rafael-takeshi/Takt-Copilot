import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Instagram, Linkedin, Play, RefreshCw, Type, FileText, Film, Plus, ArrowLeft, Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { generatePostContent } from "@/lib/ai/generate-post.functions";
import { useAiSettings } from "@/lib/ai/ai-settings";
import { addGenerationToHistory, type NewPostPrefill } from "@/lib/ai/generation-history";
import { toast } from "sonner";

const platforms = [
  { id: "Instagram", label: "Instagram", icon: Instagram },
  { id: "LinkedIn", label: "LinkedIn", icon: Linkedin },
  { id: "TikTok", label: "TikTok", icon: Play },
] as const;

type Generated = Awaited<ReturnType<typeof generatePostContent>>;

export function NewPostDialog({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefill?: NewPostPrefill | null;
}) {
  const [platform, setPlatform] = useState<string>("Instagram");
  const [client, setClient] = useState("");
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState("carrossel");
  const [objective, setObjective] = useState("engajamento");
  const [tone, setTone] = useState("");
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useServerFn(generatePostContent);
  const { settings } = useAiSettings();

  // Apply prefill whenever dialog opens with a new payload
  useEffect(() => {
    if (!open || !prefill) return;
    if (prefill.client !== undefined) setClient(prefill.client);
    if (prefill.theme !== undefined) setTheme(prefill.theme);
    if (prefill.platform !== undefined) setPlatform(prefill.platform);
    if (prefill.format !== undefined) setFormat(prefill.format);
    if (prefill.objective !== undefined) setObjective(prefill.objective);
    if (prefill.tone !== undefined) setTone(prefill.tone);
    if (prefill.caption !== undefined) setCaption(prefill.caption);
    if (prefill.cta !== undefined) setCta(prefill.cta);
    if (prefill.hashtags !== undefined) setHashtags(prefill.hashtags);
    if (prefill.hook || prefill.caption || prefill.cta || prefill.hashtags || prefill.reelsScript) {
      setGenerated({
        hook: prefill.hook ?? "",
        caption: prefill.caption ?? "",
        cta: prefill.cta ?? "",
        hashtags: prefill.hashtags ?? "",
        reelsScript: prefill.reelsScript ?? [],
      });
    }
  }, [open, prefill]);

  async function handleGenerate() {
    if (!theme.trim()) {
      toast.error("Informe o tema antes de gerar com IA.");
      return;
    }
    setLoading(true);
    try {
      const result = await generate({
        data: {
          client, theme, platform, format, objective, tone,
          model: settings.primaryModel,
          temperature: settings.temperature,
          providers: settings.models,
        },
      });
      setGenerated(result);
      addGenerationToHistory({
        client, theme, platform, format, objective, tone,
        hook: result.hook,
        caption: result.caption,
        cta: result.cta,
        hashtags: result.hashtags,
        reelsScript: result.reelsScript,
      });
      toast.success("Conteúdo gerado pelo Copiloto!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar conteúdo");
    } finally {
      setLoading(false);
    }
  }

  function applyCaption() {
    if (!generated) return;
    setCaption(generated.caption);
    if (!cta) setCta(generated.cta);
    if (!hashtags) setHashtags(generated.hashtags);
    toast.success("Aplicado ao editor");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-border/60 bg-card max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-[1fr_360px]">
          <div className="p-6 md:p-8 space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-display">
                <FileText className="size-5 text-primary" /> Criar Novo Post
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes e gere conteúdo com o Copiloto Criativo.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cliente">
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TechCorp Inc.">TechCorp Inc.</SelectItem>
                    <SelectItem value="FinApp Solutions">FinApp Solutions</SelectItem>
                    <SelectItem value="EcoLife Health">EcoLife Health</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tema / Assunto Principal">
                <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Lançamento Nova Funcionalidade" />
              </Field>
            </div>

            <Field label="Plataforma">
              <div className="flex gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                      platform === p.id
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <p.icon className="size-4" /> {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Formato">
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="artigo">Artigo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Objetivo">
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engajamento">Engajamento</SelectItem>
                    <SelectItem value="alcance">Alcance</SelectItem>
                    <SelectItem value="conversao">Conversão</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Tom de Voz">
              <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Ex: Profissional, Inspirador, Descontraído..." />
            </Field>

            <Field
              label="Legenda"
              right={
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="text-xs text-primary inline-flex items-center gap-1 hover:underline disabled:opacity-60"
                >
                  {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                  {loading ? "Gerando..." : "Gerar com IA"}
                </button>
              }
            >
              <Textarea
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva a legenda principal aqui ou use o Copiloto ao lado..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Chamada para Ação (CTA)">
                <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Ex: Link na Bio" />
              </Field>
              <Field label="Hashtags">
                <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#marketing #tech..." />
              </Field>
            </div>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="producao">Em Produção</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Salvar Rascunho</Button>
              <Button className="bg-gradient-primary shadow-glow hover:opacity-90" onClick={() => { toast.success("Post criado!"); onOpenChange(false); }}>
                <Play className="size-4" /> Criar Post
              </Button>
            </div>
          </div>

          {/* Copilot panel */}
          <aside className="bg-gradient-surface border-l border-border/60 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Sparkles className="size-4 text-primary" /> Copiloto Criativo
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {generated ? "Sugestões geradas pela IA." : "Preencha o tema e clique em Gerar com IA."}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={handleGenerate} disabled={loading} aria-label="Regenerar">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              </Button>
            </div>

            <Card className="p-4 space-y-3 bg-background/40">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase"><Type className="size-3" /> Sugestão de Gancho</span>
              </div>
              <p className="text-sm min-h-[2.5rem]">
                {generated?.hook ?? "—"}
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled={!generated} onClick={() => { setTheme(generated!.hook); toast.success("Usado como tema"); }}>
                <Plus className="size-3" /> Usar como Título
              </Button>
            </Card>

            <Card className="p-4 space-y-3 bg-background/40">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase"><FileText className="size-3" /> Ideia de Legenda</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line min-h-[4rem]">
                {generated?.caption ?? "—"}
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled={!generated} onClick={applyCaption}>
                <ArrowLeft className="size-3" /> Copiar para o Editor
              </Button>
            </Card>

            <Card className="p-4 space-y-3 bg-background/40">
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase">
                <Film className="size-3" /> Roteiro para Reels
              </div>
              <ul className="space-y-2 text-sm">
                {(generated?.reelsScript ?? [
                  { time: "0-3s", text: "—" },
                  { time: "3-7s", text: "—" },
                  { time: "7-15s", text: "—" },
                ]).map((s, i) => (
                  <ScriptLine key={i} time={s.time} text={s.text} />
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
        {right}
      </div>
      {children}
    </div>
  );
}

function ScriptLine({ time, text }: { time: string; text: string }) {
  return (
    <li className="grid grid-cols-[48px_1fr] gap-2">
      <span className="text-xs font-semibold text-primary">{time}</span>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}
