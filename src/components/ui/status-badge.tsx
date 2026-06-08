import { cn } from "@/lib/utils";

type Variant = "planejado" | "producao" | "aprovado" | "publicado" | "rascunho";

const styles: Record<Variant, string> = {
  planejado: "bg-info/15 text-info border-info/30",
  producao: "bg-warning/15 text-warning border-warning/30",
  aprovado: "bg-success/15 text-success border-success/30",
  publicado: "bg-primary/15 text-primary border-primary/30",
  rascunho: "bg-muted text-muted-foreground border-border",
};

const labels: Record<Variant, string> = {
  planejado: "Planejado",
  producao: "Em Produção",
  aprovado: "Aprovado",
  publicado: "Publicado",
  rascunho: "Rascunho",
};

export function StatusBadge({ status }: { status: Variant }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}

const platformStyles: Record<string, string> = {
  Instagram: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  LinkedIn: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  TikTok: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Blog: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function PlatformBadge({ name }: { name: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", platformStyles[name] ?? "bg-muted text-muted-foreground border-border")}>
      {name}
    </span>
  );
}
