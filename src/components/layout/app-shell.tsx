import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Plus, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import { NewPostDialog } from "./new-post-dialog";
import { OPEN_NEWPOST_EVENT, type NewPostPrefill } from "@/lib/ai/generation-history";

const nav = [
  { to: "/dashboard", label: "Início" },
  { to: "/ideas", label: "Ideias" },
  { to: "/posts", label: "Posts" },
  { to: "/settings", label: "Configurações" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<NewPostPrefill | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NewPostPrefill>).detail ?? null;
      setPrefill(detail);
      setOpen(true);
    };
    window.addEventListener(OPEN_NEWPOST_EVENT, handler);
    return () => window.removeEventListener(OPEN_NEWPOST_EVENT, handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-gradient font-display">
              Takt Copilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Tema">
              <Moon className="size-4" />
            </Button>
            <Button onClick={() => { setPrefill(null); setOpen(true); }} className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Plus className="size-4" /> Novo Post
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">{children}</main>

      <footer className="border-t border-border/60 mt-10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Takt Copilot</span>
          </div>
          <p>© 2026 Takt Copilot. Inteligência para sua presença digital.</p>
          <div className="flex gap-4">
            <a className="hover:text-foreground" href="#">Suporte</a>
            <a className="hover:text-foreground" href="#">Termos</a>
            <a className="hover:text-foreground" href="#">Privacidade</a>
          </div>
        </div>
      </footer>

      <NewPostDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPrefill(null); }} prefill={prefill} />
    </div>
  );
}
