import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Takt Copilot — Inteligência para sua presença digital" },
      { name: "description", content: "Plataforma de planejamento e criação de conteúdo com IA." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-card">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-display font-bold text-gradient">Takt.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Inteligência para sua presença digital.</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">E-mail Corporativo</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="nome@empresa.com.br" type="email" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Senha</Label>
              <a href="#" className="text-xs text-primary hover:underline">Esqueci minha senha</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-9 pr-9" placeholder="••••••••" type="password" />
              <Eye className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-primary shadow-glow hover:opacity-90 h-11">
            Acessar Plataforma <ArrowRight className="size-4" />
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OU <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Não possui uma conta?{" "}
            <Link to="/dashboard" className="text-primary font-medium hover:underline">Solicite acesso</Link>
          </p>
        </form>
      </div>

      <div className="mt-6 flex gap-4 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground">Termos</a>
        <span>•</span>
        <a href="#" className="hover:text-foreground">Privacidade</a>
      </div>
    </div>
  );
}
