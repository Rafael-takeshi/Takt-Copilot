import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, MapPin, Instagram, Globe, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useClients, type Client } from "@/lib/clients/clients-store";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clientes — Takt Copilot" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const clients = useClients();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      [c.name, c.segment, c.cityUf, c.instagram].join(" ").toLowerCase().includes(s),
    );
  }, [q, clients]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">
              Cadastre e organize os perfis que alimentam o Copiloto.
            </p>
          </div>
          <Button
            className="bg-gradient-primary shadow-glow hover:opacity-90"
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            <Plus className="size-4" /> Novo Cliente
          </Button>
        </div>

        <Card className="p-3 bg-card/70 border-border/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por nome, segmento, cidade..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-10 bg-card/70 border-dashed border-border/60 text-center">
            <Building2 className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
            <Button
              className="mt-4 bg-gradient-primary shadow-glow hover:opacity-90"
              onClick={() => { setEditing(null); setOpen(true); }}
            >
              <Plus className="size-4" /> Cadastrar primeiro cliente
            </Button>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <ClientCard key={c.id} client={c} onEdit={() => { setEditing(c); setOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      <ClientFormDialog open={open} onOpenChange={setOpen} initial={editing} />
    </AppShell>
  );
}

function ClientCard({ client, onEdit }: { client: Client; onEdit: () => void }) {
  return (
    <Card className="p-5 bg-card/70 border-border/60 shadow-card hover:border-primary/50 hover:-translate-y-0.5 transition flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-semibold shrink-0">
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{client.name}</div>
            <div className="text-xs text-muted-foreground truncate">{client.segment || "—"}</div>
          </div>
        </div>
        <span className={cn(
          "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
          client.status === "ativo"
            ? "border-success/30 bg-success/15 text-success"
            : "border-border bg-muted text-muted-foreground",
        )}>{client.status}</span>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        {client.cityUf && <div className="inline-flex items-center gap-1.5"><MapPin className="size-3" /> {client.cityUf}</div>}
        {client.instagram && <div className="inline-flex items-center gap-1.5"><Instagram className="size-3" /> {client.instagram}</div>}
        {client.site && <div className="inline-flex items-center gap-1.5"><Globe className="size-3" /> {client.site}</div>}
      </div>

      <div className="flex gap-2 pt-3 mt-auto border-t border-border/40">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>Abrir</Button>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
          <Pencil className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
