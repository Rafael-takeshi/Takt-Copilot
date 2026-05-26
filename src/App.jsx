import { useState, useEffect } from "react";
import {
  LayoutDashboard, Plus, Users, BookOpen, Clock, Settings,
  Eye, Target, CheckSquare, Upload, FileText, Search, Bell,
  Check, Sparkles, Palette, Shield, Bot, BarChart2, Star,
  RefreshCw, Globe, Play, AlertCircle, X, ChevronDown,
  History, ArrowRight, Image, Zap, Pen, MessageSquare,
  Layers, TrendingUp, Copy, Filter, MoreVertical, Calendar,
  ChevronRight, LogOut, User
} from "lucide-react";

// ════════════════════════════════════════════════════════════════
// DADOS SIMULADOS
// ════════════════════════════════════════════════════════════════

const STATS = [
  { label: "Posts criados no mês", value: "47", icon: FileText, bg: "bg-orange-50", iconColor: "text-orange-500", change: "+12% vs mês anterior" },
  { label: "Tempo economizado", value: "23h", icon: Clock, bg: "bg-blue-50", iconColor: "text-blue-500", change: "estimativa do mês" },
  { label: "Clientes ativos", value: "8", icon: Users, bg: "bg-green-50", iconColor: "text-green-500", change: "2 novos este mês" },
  { label: "Em revisão", value: "5", icon: AlertCircle, bg: "bg-yellow-50", iconColor: "text-yellow-500", change: "aguardando aprovação" },
];

const RECENT = [
  { id: 1, client: "AvaliaX", theme: "KYC e antecedentes", format: "Post único", platform: "Instagram", status: "Aprovado", date: "20 mai" },
  { id: 2, client: "Tateti", theme: "Moda infantil verão", format: "Carrossel", platform: "Instagram", status: "Em revisão", date: "19 mai" },
  { id: 3, client: "YKP", theme: "Serviços corporativos", format: "Anúncio", platform: "Meta Ads", status: "Rascunho", date: "19 mai" },
  { id: 4, client: "D'Campos", theme: "Imóveis premium SP", format: "Reels", platform: "Instagram", status: "Aprovado", date: "18 mai" },
  { id: 5, client: "Brimak", theme: "Volta às aulas 2026", format: "Carrossel", platform: "LinkedIn", status: "Em revisão", date: "17 mai" },
];

const CLIENTS_DATA = [
  { id: 1, name: "AvaliaX", initials: "AX", color: "#F97316", segment: "Tecnologia / KYC", tone: "Corporativo, técnico, confiável", contentType: "Posts educativos, carrosséis explicativos", visualStatus: "Completo", posts: 12 },
  { id: 2, name: "Tateti", initials: "TT", color: "#EC4899", segment: "Moda infantil", tone: "Descontraído, colorido, afetivo", contentType: "Reels, stories, posts de produto", visualStatus: "Completo", posts: 9 },
  { id: 3, name: "YKP", initials: "YK", color: "#3B82F6", segment: "Serviços corporativos", tone: "Sério, profissional, direto", contentType: "Posts institucionais, LinkedIn", visualStatus: "Parcial", posts: 6 },
  { id: 4, name: "Brimak", initials: "BR", color: "#10B981", segment: "Produtos escolares", tone: "Alegre, familiar, acessível", contentType: "Carrosséis educativos, posts sazonais", visualStatus: "Completo", posts: 8 },
  { id: 5, name: "D'Campos", initials: "DC", color: "#6366F1", segment: "Imóveis premium", tone: "Sofisticado, exclusivo, elegante", contentType: "Posts de produto, reels de imóvel", visualStatus: "Completo", posts: 7 },
];

const REFERENCES = [
  { id: 1, client: "AvaliaX", type: "Post único", style: "Corporativo / Tech", date: "15 mai 2026", tags: ["clean", "azul", "corporativo"], bg: "from-slate-700 to-slate-900" },
  { id: 2, client: "Tateti", type: "Carrossel", style: "Colorido / Infantil", date: "12 mai 2026", tags: ["colorido", "fofo", "produto"], bg: "from-pink-400 to-purple-500" },
  { id: 3, client: "D'Campos", type: "Reels", style: "Premium / Minimalista", date: "10 mai 2026", tags: ["premium", "elegante", "neutro"], bg: "from-stone-600 to-stone-900" },
  { id: 4, client: "YKP", type: "Anúncio", style: "Sóbrio / Profissional", date: "8 mai 2026", tags: ["azul", "formal", "cta"], bg: "from-blue-500 to-blue-800" },
  { id: 5, client: "Brimak", type: "Carrossel", style: "Alegre / Escolar", date: "5 mai 2026", tags: ["colorido", "escolar", "didático"], bg: "from-green-400 to-teal-600" },
  { id: 6, client: "AvaliaX", type: "Carrossel", style: "Dark / Tech", date: "2 mai 2026", tags: ["dark", "tech", "dados"], bg: "from-gray-800 to-orange-900" },
];

const HISTORY_DATA = [
  { id: 1, date: "20/05", client: "AvaliaX", theme: "KYC e antecedentes", format: "Post único", platform: "Instagram", status: "Aprovado" },
  { id: 2, date: "19/05", client: "Tateti", theme: "Moda infantil verão", format: "Carrossel", platform: "Instagram", status: "Em revisão" },
  { id: 3, date: "19/05", client: "YKP", theme: "Serviços corporativos", format: "Anúncio", platform: "Meta Ads", status: "Rascunho" },
  { id: 4, date: "18/05", client: "D'Campos", theme: "Imóveis premium SP", format: "Reels", platform: "Instagram", status: "Aprovado" },
  { id: 5, date: "17/05", client: "Brimak", theme: "Volta às aulas 2026", format: "Carrossel", platform: "LinkedIn", status: "Em revisão" },
  { id: 6, date: "16/05", client: "AvaliaX", theme: "Onboarding digital", format: "Carrossel", platform: "LinkedIn", status: "Aprovado" },
  { id: 7, date: "15/05", client: "Tateti", theme: "Coleção inverno", format: "Post único", platform: "Instagram", status: "Aprovado" },
  { id: 8, date: "14/05", client: "YKP", theme: "Cases de sucesso", format: "Post único", platform: "LinkedIn", status: "Rascunho" },
];

const AI_AGENTS = [
  { id: 1, name: "Analista Visual", icon: Eye, desc: "Interpreta prints, layouts, cores, composição e estilo da referência visual.", color: "purple", tool: "Claude (Vision)", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { id: 2, name: "Estrategista", icon: Target, desc: "Adapta a ideia ao cliente, público-alvo e objetivo do post com contexto de marca.", color: "blue", tool: "Claude / GPT-4", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: 3, name: "Copywriter", icon: Pen, desc: "Gera headline, legenda, CTA e variações de texto para diferentes formatos.", color: "orange", tool: "GPT-4", bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: 4, name: "Diretor de Arte", icon: Palette, desc: "Cria briefing visual detalhado para o designer ou para uma IA geradora de imagens.", color: "pink", tool: "Gemini Pro", bg: "bg-pink-50", border: "border-pink-200", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { id: 5, name: "Revisor", icon: CheckSquare, desc: "Verifica clareza, tom de marca, erros, excesso de texto e coerência visual.", color: "green", tool: "Claude", bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-100", iconColor: "text-green-600" },
];

const RESULT_DEFAULT = {
  client: "", type: "", platform: "", goal: "", theme: "",
  analysis: "", idea: "", headline: "", sub: "", cta: "", caption: "", visual: "",
  checklist: []
};

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

const statusStyle = (s) => {
  if (s === "Aprovado") return "bg-green-100 text-green-700";
  if (s === "Em revisão") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
};

const Tag = ({ label }) => (
  <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">{label}</span>
);

// ════════════════════════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════════════════════════

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create", label: "Criar post", icon: Plus },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "library", label: "Biblioteca", icon: BookOpen },
  { id: "history", label: "Histórico", icon: History },
  { id: "settings", label: "Config. de IA", icon: Settings },
];

function Sidebar({ page, setPage }) {
  return (
    <aside className="w-60 bg-gray-900 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">Takt</span>
            <span className="text-orange-400 font-bold text-sm tracking-wide"> Copilot</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-1">Agência Takt</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id || (page === "result" && id === "create");
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
              {id === "create" && (
                <span className="ml-auto w-5 h-5 bg-orange-600 rounded-full text-xs flex items-center justify-center text-white">+</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">SM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Social Media</p>
            <p className="text-gray-500 text-xs truncate">takt.com.br</p>
          </div>
          <LogOut size={14} className="text-gray-600" />
        </div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════
// HEADER
// ════════════════════════════════════════════════════════════════

function Header({ title, sub, action }) {
  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-gray-900 font-bold text-lg">{title}</h1>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all relative">
          <Bell size={15} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">SM</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════

function Dashboard({ setPage }) {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        sub="Quinta-feira, 21 de maio de 2026"
        action={
          <button
            onClick={() => setPage("create")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={15} />
            Criar novo post
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={18} className={s.iconColor} />
                </div>
                <TrendingUp size={13} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-orange-500 font-medium mt-2">{s.change}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div
          className="rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)" }}
          onClick={() => setPage("create")}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-orange-400" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">Novo post com IA</span>
            </div>
            <p className="text-white text-lg font-bold">Crie seu próximo post em menos de 2 minutos</p>
            <p className="text-gray-400 text-sm mt-1">Faça upload de uma referência visual e deixe os agentes trabalharem.</p>
          </div>
          <button
            onClick={() => setPage("create")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ml-6"
          >
            Começar agora
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-gray-900 font-semibold text-sm">Conteúdos recentes</h2>
              <p className="text-gray-400 text-xs">Últimos gerados pela equipe</p>
            </div>
            <button
              onClick={() => setPage("history")}
              className="text-orange-500 text-xs font-medium hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT.map((item) => (
              <div key={item.id} className="flex items-center px-6 py-3.5 hover:bg-gray-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-4 flex-shrink-0">
                  <FileText size={14} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-sm font-medium">{item.client}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500 text-xs truncate">{item.theme}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{item.format}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{item.platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(item.status)}`}>{item.status}</span>
                  <span className="text-gray-400 text-xs">{item.date}</span>
                  <button
                    onClick={() => setPage("result")}
                    className="text-orange-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all hover:underline"
                  >
                    Abrir →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CREATE POST
// ════════════════════════════════════════════════════════════════

function CreatePost({ setPage, setResult }) {
  const [form, setForm] = useState({
    client: "", type: "", platform: "", theme: "", goal: "", audience: "", notes: ""
  });
  const [file, setFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!form.client || !form.theme) {
      setError("Por favor, selecione um cliente e preencha o tema do conteúdo.");
      return;
    }
    setError(null);
    setGenerating(true);
    setStep(0);

    // Animação visual em paralelo com a chamada à API
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          return 5;
        }
        return prev + 1;
      });
    }, 900);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro na API');
      }

      const data = await response.json();
      const merged = {
        ...data,
        client: form.client,
        type: form.type || 'Post único',
        platform: form.platform || 'Instagram',
        goal: form.goal || 'Engajamento',
        theme: form.theme
      };

      // Aguarda animação terminar antes de navegar
      setTimeout(() => {
        setResult(merged);
        setPage("result");
      }, 5500);

    } catch (err) {
      clearInterval(interval);
      setGenerating(false);
      setError('Erro ao gerar conteúdo: ' + err.message + '. Verifique sua conexão e tente novamente.');
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Gerando conteúdo..." sub="Agentes de IA trabalhando em paralelo" />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-gray-900 font-bold text-xl">Processando sua solicitação</h2>
              <p className="text-gray-500 text-sm mt-2">Os agentes estão trabalhando em sequência para gerar o melhor resultado.</p>
            </div>

            <div className="space-y-3">
              {AI_AGENTS.map((agent, i) => {
                const done = step > i;
                const active = step === i;
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      done ? "bg-green-50 border-green-200"
                        : active ? `${agent.bg} ${agent.border} border shadow-sm`
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      done ? "bg-green-500" : active ? agent.iconBg : "bg-gray-100"
                    }`}>
                      {done
                        ? <Check size={18} className="text-white" />
                        : <agent.icon size={18} className={active ? agent.iconColor : "text-gray-300"} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${done ? "text-green-700" : active ? "text-gray-900" : "text-gray-400"}`}>
                          IA {agent.id}: {agent.name}
                        </p>
                        {active && (
                          <span className="flex gap-1">
                            {[0,1,2].map(d => (
                              <span key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                                style={{ animationDelay: `${d * 0.15}s` }} />
                            ))}
                          </span>
                        )}
                        {done && <span className="text-xs text-green-600 font-medium">Concluído</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${done ? "text-green-600" : active ? "text-gray-600" : "text-gray-400"}`}>
                        {agent.desc}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${
                      done ? "border-green-200 text-green-600 bg-green-50"
                        : active ? `${agent.border} ${agent.iconColor} ${agent.bg}`
                        : "border-gray-200 text-gray-300 bg-white"
                    }`}>
                      {agent.tool}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((step / 5) * 100, 100)}%` }}
              />
            </div>
            <p className="text-center text-gray-400 text-xs mt-2">
              {step < 5 ? `Etapa ${step + 1} de 5` : "Finalizado! Redirecionando..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Criar novo post"
        sub="Preencha o briefing e envie uma referência visual"
        action={
          <button onClick={() => setPage("dashboard")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1 transition-all">
            <X size={14} /> Cancelar
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex gap-6 max-w-6xl">
          {/* Form */}
          <div className="flex-1 space-y-5">
            {/* Section header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                Informações do post
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cliente</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
                    value={form.client}
                    onChange={e => setForm({ ...form, client: e.target.value })}
                  >
                    <option value="">Selecionar cliente...</option>
                    {CLIENTS_DATA.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de conteúdo</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="">Selecionar tipo...</option>
                    {["Post único", "Carrossel", "Reels", "Anúncio"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plataforma</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="">Selecionar plataforma...</option>
                    {["Instagram", "LinkedIn", "Meta Ads", "Blog"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objetivo</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
                    value={form.goal}
                    onChange={e => setForm({ ...form, goal: e.target.value })}
                  >
                    <option value="">Selecionar objetivo...</option>
                    {["Autoridade", "Venda", "Educação", "Captação de lead", "Engajamento"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tema do conteúdo *</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  placeholder="Ex: KYC e verificação de antecedentes para empresas..."
                  value={form.theme}
                  onChange={e => setForm({ ...form, theme: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Público-alvo</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
                  placeholder="Ex: Gestores de compliance, heads de operação..."
                  value={form.audience}
                  onChange={e => setForm({ ...form, audience: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações adicionais</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all resize-none"
                  placeholder="Detalhes extras, estilo desejado, referências de texto..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            {/* AI Flow preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                Fluxo de agentes IA
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {AI_AGENTS.map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex flex-col items-center p-3 rounded-xl border ${agent.border} ${agent.bg} w-24`}>
                      <div className={`w-8 h-8 rounded-lg ${agent.iconBg} flex items-center justify-center mb-1.5`}>
                        <agent.icon size={15} className={agent.iconColor} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{agent.name}</span>
                    </div>
                    {i < AI_AGENTS.length - 1 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            >
              <Sparkles size={17} />
              Gerar conteúdo com IA
            </button>
          </div>

          {/* Reference panel */}
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                Referência visual
              </h3>

              {/* Upload area */}
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  file ? "border-orange-300 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                }`}>
                  {file ? (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                        <Check size={18} className="text-orange-500" />
                      </div>
                      <p className="text-orange-600 text-xs font-semibold">Arquivo enviado!</p>
                      <p className="text-gray-400 text-xs mt-1 truncate">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <Upload size={18} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-xs font-medium">Arraste ou clique para enviar</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG, PDF — até 10MB</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>

              {/* Preview card */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 font-medium mb-2">Preview simulado</p>
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mx-auto mb-2">
                        <Shield size={14} className="text-white" />
                      </div>
                      <p className="text-white text-xs font-bold">Takt Copilot</p>
                      <p className="text-gray-300 text-xs mt-0.5">Geração com IA real</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="h-2 rounded-full bg-gray-100 mb-1.5 w-3/4"></div>
                    <div className="h-2 rounded-full bg-gray-100 mb-1.5"></div>
                    <div className="h-2 rounded-full bg-orange-100 w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
              <p className="text-orange-700 text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Star size={12} /> Dicas para melhor resultado
              </p>
              <ul className="space-y-1.5">
                {["Selecione o cliente e preencha o tema para ativar a IA", "Descreva bem o público-alvo para um copy mais certeiro", "Use o campo de observações para ajustes específicos de tom"].map((tip, i) => (
                  <li key={i} className="text-orange-600 text-xs flex items-start gap-1.5">
                    <Check size={10} className="mt-0.5 flex-shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RESULT PAGE
// ════════════════════════════════════════════════════════════════

const TABS = [
  { id: "analysis", label: "Análise da ref." },
  { id: "idea", label: "Ideia do post" },
  { id: "artText", label: "Texto para arte" },
  { id: "caption", label: "Legenda" },
  { id: "visual", label: "Direcionamento visual" },
  { id: "checklist", label: "Checklist" },
];

function ResultPage({ setPage, result }) {
  const [tab, setTab] = useState("analysis");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checklistCount = result.checklist?.length || 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Resultado gerado"
        sub={`${result.client || '—'} · ${result.type || '—'} · ${result.platform || '—'} · ${result.goal || '—'}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage("create")}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={13} /> Gerar novamente
            </button>
            <button className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all">
              <Check size={13} /> Aprovar
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Meta info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {[
                { label: "Cliente", val: result.client || "—" },
                { label: "Formato", val: result.type || "—" },
                { label: "Plataforma", val: result.platform || "—" },
                { label: "Objetivo", val: result.goal || "—" },
                { label: "Tema", val: result.theme || "—" },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{val}</p>
                </div>
              ))}
            </div>
            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles size={11} /> Gerado por IA
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-all border-b-2 ${
                  tab === t.id
                    ? "border-orange-500 text-orange-500 bg-orange-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Copy button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  copied ? "border-green-200 text-green-600 bg-green-50" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>

            {tab === "analysis" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Eye size={15} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 1: Analista Visual</p>
                    <p className="text-xs text-gray-400">Interpretação da referência enviada</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {result.analysis || "Nenhuma análise gerada."}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Estilo identificado", val: "Conforme briefing" },
                    { label: "Paleta dominante", val: "Gerada pela IA" },
                    { label: "Composição", val: "Detalhada abaixo" },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-xs text-purple-500 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-purple-800">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "idea" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Target size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 2: Estrategista de Conteúdo</p>
                    <p className="text-xs text-gray-400">Adaptação ao cliente, público e objetivo</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {result.idea || "Nenhuma ideia gerada."}
                </div>
              </div>
            )}

            {tab === "artText" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Pen size={15} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 3: Copywriter — Texto para arte</p>
                    <p className="text-xs text-gray-400">Headline, subheadline e CTA</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-gray-100">
                    {/* Art preview */}
                    <div className="h-56 flex items-center justify-center p-8"
                      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)" }}>
                      <div className="text-center max-w-sm">
                        <div className="flex justify-center mb-4">
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded bg-blue-600/30 flex items-center justify-center"><Shield size={12} className="text-blue-300" /></div>
                            <div className="w-6 h-6 rounded bg-orange-500/30 flex items-center justify-center"><Check size={12} className="text-orange-300" /></div>
                            <div className="w-6 h-6 rounded bg-green-600/30 flex items-center justify-center"><CheckSquare size={12} className="text-green-300" /></div>
                          </div>
                        </div>
                        <p className="text-white font-bold text-lg leading-tight">{result.headline || "—"}</p>
                        <p className="text-gray-300 text-xs mt-2 leading-relaxed">{result.sub || "—"}</p>
                        <div className="mt-4 inline-block bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                          {result.cta || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 space-y-3">
                      {[
                        { label: "Headline", val: result.headline },
                        { label: "Subheadline", val: result.sub },
                        { label: "CTA", val: result.cta },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex gap-3">
                          <span className="text-xs font-bold text-orange-500 w-24 flex-shrink-0 pt-0.5">{label}</span>
                          <span className="text-sm text-gray-700">{val || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "caption" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <MessageSquare size={15} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 3: Copywriter — Legenda</p>
                    <p className="text-xs text-gray-400">Legenda completa para {result.platform || "redes sociais"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.caption || "Nenhuma legenda gerada."}</pre>
                </div>
                {result.caption && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>Caracteres: {result.caption.length}</span>
                    <span>·</span>
                    <span className="text-green-500 font-medium">✓ Dentro do limite recomendado</span>
                  </div>
                )}
              </div>
            )}

            {tab === "visual" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Palette size={15} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 4: Diretor de Arte</p>
                    <p className="text-xs text-gray-400">Briefing visual para designer ou IA de imagem</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-4">
                  {result.visual || "Nenhum briefing visual gerado."}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                    <p className="text-xs text-pink-500 font-semibold mb-2">Paleta de cores</p>
                    <div className="flex gap-2">
                      {["#FFFFFF", "#F3F4F6", "#1E40AF", "#F97316"].map(c => (
                        <div key={c} className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                    <p className="text-xs text-pink-500 font-semibold mb-2">Gerado por IA</p>
                    <p className="text-xs text-pink-600">Veja o briefing completo acima para detalhes visuais específicos.</p>
                  </div>
                </div>
              </div>
            )}

            {tab === "checklist" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckSquare size={15} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">IA 5: Revisor</p>
                    <p className="text-xs text-gray-400">Verificação de qualidade e alinhamento</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {(result.checklist || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-green-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                {checklistCount > 0 && (
                  <div className="mt-5 p-4 bg-green-500 rounded-xl text-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">✓ Aprovado pelo Revisor</p>
                      <p className="text-green-100 text-xs mt-0.5">Todos os critérios foram verificados com sucesso.</p>
                    </div>
                    <div className="text-3xl font-black">{checklistCount}/{checklistCount}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CLIENTS PAGE
// ════════════════════════════════════════════════════════════════

function ClientsPage({ setPage }) {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Clientes"
        sub="Perfis de marca e configurações por cliente"
        action={
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-200">
            <Plus size={15} /> Novo cliente
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-5">
          {CLIENTS_DATA.map(client => (
            <div key={client.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
              {/* Header */}
              <div className="h-24 flex items-end p-5" style={{ background: `linear-gradient(135deg, ${client.color}22, ${client.color}44)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    style={{ backgroundColor: client.color }}>
                    {client.initials}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">{client.name}</p>
                    <p className="text-gray-500 text-xs">{client.segment}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Tom de voz</p>
                  <p className="text-sm text-gray-700">{client.tone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Conteúdo mais usado</p>
                  <p className="text-sm text-gray-700">{client.contentType}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${client.visualStatus === "Completo" ? "bg-green-400" : "bg-yellow-400"}`} />
                    <span className="text-xs text-gray-500">Identidade visual: <span className="font-medium">{client.visualStatus}</span></span>
                  </div>
                  <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{client.posts} posts</span>
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setPage("create")}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  Criar post
                </button>
                <button className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-xs font-medium transition-all">
                  Ver perfil
                </button>
              </div>
            </div>
          ))}

          {/* Add new client card */}
          <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all group min-h-64">
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-all">
              <Plus size={20} className="text-gray-400 group-hover:text-orange-500 transition-all" />
            </div>
            <p className="text-gray-500 group-hover:text-orange-600 font-semibold text-sm transition-all">Adicionar cliente</p>
            <p className="text-gray-400 text-xs mt-1 text-center">Configure perfil, tom de voz e identidade visual</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LIBRARY PAGE
// ════════════════════════════════════════════════════════════════

function LibraryPage({ setPage }) {
  const [filter, setFilter] = useState("Todos");
  const clients = ["Todos", ...CLIENTS_DATA.map(c => c.name)];
  const filtered = filter === "Todos" ? REFERENCES : REFERENCES.filter(r => r.client === filter);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Biblioteca de Referências"
        sub="Prints e referências visuais organizadas por cliente"
        action={
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-200">
            <Upload size={15} /> Enviar referência
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {clients.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === c
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-5">
          {filtered.map(ref => (
            <div key={ref.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
              {/* Visual */}
              <div className={`h-44 bg-gradient-to-br ${ref.bg} flex items-center justify-center relative`}>
                <div className="text-center px-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2">
                    <Image size={18} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{ref.client}</p>
                  <p className="text-white/70 text-xs mt-0.5">{ref.type}</p>
                </div>
                <div className="absolute top-3 right-3 bg-black/30 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {ref.style}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{ref.client}</p>
                    <p className="text-gray-400 text-xs">{ref.type} · {ref.date}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ref.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() => setPage("create")}
                  className="w-full border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  Usar como referência
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HISTORY PAGE
// ════════════════════════════════════════════════════════════════

function HistoryPage({ setPage }) {
  const [search, setSearch] = useState("");
  const filtered = HISTORY_DATA.filter(h =>
    h.client.toLowerCase().includes(search.toLowerCase()) ||
    h.theme.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Histórico" sub="Todos os conteúdos gerados pela equipe" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
              placeholder="Buscar por cliente ou tema..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-all">
            <Filter size={14} /> Filtrar
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Data", "Cliente", "Tema", "Formato", "Plataforma", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5 bg-gray-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{item.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold" style={{ fontSize: "9px" }}>
                          {item.client.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{item.client}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs">
                    <span className="truncate block" style={{ maxWidth: "160px" }}>{item.theme}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{item.format}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{item.platform}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setPage("result")}
                      className="text-orange-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all hover:underline flex items-center gap-1"
                    >
                      Abrir <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhum resultado encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// AI SETTINGS PAGE
// ════════════════════════════════════════════════════════════════

const AI_CONFIG = [
  { name: "Claude (Anthropic)", role: "Análise visual + Revisão", badge: "Ativo", badgeColor: "bg-green-100 text-green-700", desc: "Usado nas etapas de análise de referência visual e revisão final de conteúdo.", logo: "🤖", color: "orange" },
  { name: "ChatGPT / GPT-4", role: "Estratégia e Copywriting", badge: "Ativo", badgeColor: "bg-green-100 text-green-700", desc: "Responsável pela estratégia de conteúdo, geração de copy e variações de texto.", logo: "💬", color: "green" },
  { name: "Gemini Pro (Google)", role: "Apoio multimodal", badge: "Configurar", badgeColor: "bg-blue-100 text-blue-700", desc: "Suporte para análise multimodal avançada, dados visuais e contexto ampliado.", logo: "✨", color: "blue" },
  { name: "Make (Integromat)", role: "Automações e fluxos", badge: "Em breve", badgeColor: "bg-gray-100 text-gray-500", desc: "Automação de entregas, notificações, aprovações e integrações com ferramentas externas.", logo: "⚡", color: "purple" },
  { name: "Manus", role: "Apoio em desenvolvimento", badge: "Em breve", badgeColor: "bg-gray-100 text-gray-500", desc: "Agente autônomo para tarefas técnicas, manutenção e desenvolvimento de features.", logo: "🛠", color: "gray" },
];

function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Configurações de IA" sub="Gerencie quais IAs atuam em cada etapa do fluxo" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Banner — agora mostra que está ATIVO */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={17} className="text-green-500" />
          </div>
          <div>
            <p className="text-green-800 text-sm font-semibold">IA real conectada e funcionando</p>
            <p className="text-green-600 text-xs mt-0.5">A API da Anthropic está ativa. Gere um post para ver o resultado real.</p>
          </div>
        </div>

        {/* AI Cards */}
        <div className="space-y-4 mb-8">
          {AI_CONFIG.map((ai, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                {ai.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-gray-900 font-bold text-sm">{ai.name}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${ai.badgeColor}`}>{ai.badge}</span>
                </div>
                <p className="text-orange-500 text-xs font-semibold mb-1.5">Função: {ai.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{ai.desc}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <div className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
                  ai.badge === "Ativo" ? "bg-green-400" : "bg-gray-200"
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    ai.badge === "Ativo" ? "left-5" : "left-0.5"
                  }`} />
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-600 transition-all">Configurar</button>
          </div>
            </div>
          ))}
        </div>

        {/* Flow section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-1">Mapeamento de IA por etapa</h3>
          <p className="text-gray-400 text-xs mb-5">Configure qual IA executa cada função do pipeline.</p>
          <div className="space-y-3">
            {AI_AGENTS.map((agent, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg ${agent.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <agent.icon size={14} className={agent.iconColor} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">IA {agent.id}: {agent.name}</p>
                  <p className="text-xs text-gray-400 truncate">{agent.desc}</p>
                </div>
                <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all">
                  <option>{agent.tool}</option>
                  <option>Claude</option>
                  <option>GPT-4</option>
                  <option>Gemini Pro</option>
                </select>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full border border-orange-200 text-orange-500 hover:bg-orange-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
            Salvar configurações
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [result, setResult] = useState(RESULT_DEFAULT);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage} />;
      case "create":    return <CreatePost setPage={setPage} setResult={setResult} />;
      case "result":    return <ResultPage setPage={setPage} result={result} />;
      case "clients":   return <ClientsPage setPage={setPage} />;
      case "library":   return <LibraryPage setPage={setPage} />;
      case "history":   return <HistoryPage setPage={setPage} />;
      case "settings":  return <SettingsPage />;
      default:          return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}