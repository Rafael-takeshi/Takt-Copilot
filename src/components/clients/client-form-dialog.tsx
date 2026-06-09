import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Sparkles, Palette, Save } from "lucide-react";
import { EMPTY_CLIENT, type Client, createClient, saveClient } from "@/lib/clients/clients-store";
import { toast } from "sonner";

type FormState = Omit<Client, "id" | "createdAt">;

export function ClientFormDialog({
  open, onOpenChange, initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Client | null;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_CLIENT);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const { id: _id, createdAt: _c, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(EMPTY_CLIENT);
    }
  }, [open, initial]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Informe o nome da empresa");
      return;
    }
    if (initial) {
      saveClient({ ...initial, ...form });
      toast.success("Cliente atualizado");
    } else {
      createClient(form);
      toast.success("Cliente cadastrado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              {initial ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              Estes dados alimentam o Copiloto Criativo e personalizam a geração de posts.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic"><Building2 className="size-3.5" /> Dados</TabsTrigger>
              <TabsTrigger value="strategy"><Sparkles className="size-3.5" /> Estratégia</TabsTrigger>
              <TabsTrigger value="visual"><Palette className="size-3.5" /> Identidade</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nome da empresa *">
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Ltda." />
                </Field>
                <Field label="Segmento">
                  <Input value={form.segment} onChange={(e) => set("segment", e.target.value)} placeholder="SaaS, Moda, Saúde..." />
                </Field>
                <Field label="Cidade/UF">
                  <Input value={form.cityUf} onChange={(e) => set("cityUf", e.target.value)} placeholder="São Paulo/SP" />
                </Field>
                <Field label="Site">
                  <Input value={form.site} onChange={(e) => set("site", e.target.value)} placeholder="empresa.com" />
                </Field>
                <Field label="Instagram">
                  <Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@empresa" />
                </Field>
                <Field label="WhatsApp">
                  <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(11) 99999-0000" />
                </Field>
                <Field label="Responsável interno">
                  <Input value={form.responsible} onChange={(e) => set("responsible", e.target.value)} placeholder="Quem cuida da conta" />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => set("status", v as Client["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4 pt-4">
              <Field label="Produtos / serviços principais">
                <Textarea rows={2} value={form.products} onChange={(e) => set("products", e.target.value)} />
              </Field>
              <Field label="Público-alvo">
                <Textarea rows={2} value={form.audience} onChange={(e) => set("audience", e.target.value)} />
              </Field>
              <Field label="Principais dores do público">
                <Textarea rows={2} value={form.pains} onChange={(e) => set("pains", e.target.value)} />
              </Field>
              <Field label="Diferenciais da empresa">
                <Textarea rows={2} value={form.differentials} onChange={(e) => set("differentials", e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Objetivo principal do conteúdo">
                  <Input value={form.contentGoal} onChange={(e) => set("contentGoal", e.target.value)} placeholder="Vendas, autoridade..." />
                </Field>
                <Field label="Tom de voz da marca">
                  <Input value={form.tone} onChange={(e) => set("tone", e.target.value)} placeholder="Profissional, descontraído..." />
                </Field>
                <Field label="Palavras a evitar">
                  <Input value={form.avoidWords} onChange={(e) => set("avoidWords", e.target.value)} placeholder="Barato, fácil..." />
                </Field>
                <Field label="CTAs padrão">
                  <Input value={form.defaultCtas} onChange={(e) => set("defaultCtas", e.target.value)} placeholder="Link na bio, agende demo..." />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4 pt-4">
              <Field label="Cores principais da marca">
                <Input value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="#6366F1, #111827" />
              </Field>
              <Field label="Fontes da marca">
                <Input value={form.fonts} onChange={(e) => set("fonts", e.target.value)} placeholder="Inter, Space Grotesk" />
              </Field>
              <Field label="Estilo visual preferido">
                <Input value={form.visualStyle} onChange={(e) => set("visualStyle", e.target.value)} placeholder="Minimalista, vibrante, premium..." />
              </Field>
              <Field label="Observações de design">
                <Textarea rows={3} value={form.designNotes} onChange={(e) => set("designNotes", e.target.value)} />
              </Field>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="bg-gradient-primary shadow-glow hover:opacity-90" onClick={handleSave}>
              <Save className="size-4" /> {initial ? "Salvar" : "Cadastrar Cliente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}
