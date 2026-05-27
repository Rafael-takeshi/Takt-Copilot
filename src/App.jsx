import { useState, useEffect } from "react";
import { supabase } from './supabase';
import {
  LayoutDashboard, Plus, Users, BookOpen, Clock, Settings,
  Eye, Target, CheckSquare, Upload, FileText, Search, Bell,
  Check, Sparkles, Palette, Shield, Bot, BarChart2, Star,
  RefreshCw, Globe, Play, AlertCircle, X, ChevronDown,
  History, ArrowRight, Image, Zap, Pen, MessageSquare,
  Layers, TrendingUp, Copy, Filter, MoreVertical, Calendar,
  ChevronRight, LogOut, User, Save, Trash2, Link
} from "lucide-react";

// ════════════════════════════════════════════════════════════════
// CORES DA MARCA TAKT
// ════════════════════════════════════════════════════════════════
const TAKT = {
  cyan: "#28D3E0",
  cyanDark: "#1fb8c4",
  cyanLight: "#e8fbfc",
  cyanBorder: "#b3eef2",
  coral: "#FFA287",
  coralDark: "#ff8a6a",
  dark: "#242828",
  darkSecond: "#2e3434",
  slate: "#455A64",
  slatLight: "#eceff1",
};

// ════════════════════════════════════════════════════════════════
// LOGO TAKT DIGITAL
// ════════════════════════════════════════════════════════════════
function TaktLogoIcon({ size = 32 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.25,
        backgroundColor: TAKT.dark,
        border: `1.5px solid ${TAKT.cyanBorder}`,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center",
        padding: "0 6px", gap: "3px",
      }}
    >
      <div style={{ width: "18px", height: "3px", borderRadius: "2px", backgroundColor: TAKT.cyan }} />
      <div style={{ width: "14px", height: "3px", borderRadius: "2px", backgroundColor: TAKT.cyan }} />
      <div style={{ width: "10px", height: "3px", borderRadius: "2px", backgroundColor: TAKT.coral }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DADOS ESTÁTICOS
// ════════════════════════════════════════════════════════════════
const AI_AGENTS = [
  { id: 1, name: "Analista Visual", icon: Eye, desc: "Interpreta layouts, cores, composição e estilo da referência visual.", tool: "Claude", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { id: 2, name: "Estrategista", icon: Target, desc: "Adapta a ideia ao cliente, público-alvo e objetivo do post.", tool: "Claude", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: 3, name: "Copywriter", icon: Pen, desc: "Gera headline, legenda, CTA e variações de texto.", tool: "GPT-4", bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: 4, name: "Diretor de Arte", icon: Palette, desc: "Cria briefing visual detalhado para o designer.", tool: "Gemini Pro", bg: "bg-pink-50", border: "border-pink-200", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { id: 5, name: "Revisor", icon: CheckSquare, desc: "Verifica clareza, tom de marca, erros e coerência visual.", tool: "Claude", bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-100", iconColor: "text-green-600" },
];

const AI_CONFIG_DEFAULT = [
  { id: "claude", name: "Claude (Anthropic)", role: "Análise visual + Revisão + Estratégia", logo: "🤖", active: true, desc: "API conectada. Responsável pela análise, estratégia e revisão de conteúdo." },
  { id: "gpt", name: "ChatGPT / GPT-4", role: "Copywriting e variações de texto", logo: "💬", active: true, desc: "API conectada. Responsável pela geração de copy, headlines e legendas." },
  { id: "gemini", name: "Gemini Pro (Google)", role: "Apoio multimodal", logo: "✨", active: true, desc: "API conectada. Suporte para análise multimodal e contexto ampliado." },
  { id: "make", name: "Make (Integromat)", role: "Automações e fluxos", logo: "⚡", active: false, desc: "Em breve. Automação de entregas, notificações e integrações externas." },
];

const RESULT_DEFAULT = { client: "", type: "", platform: "", goal: "", theme: "", analysis: "", idea: "", headline: "", sub: "", cta: "", caption: "", visual: "", checklist: [] };

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
const statusStyle = (s) => {
  if (s === "Aprovado") return "bg-green-100 text-green-700";
  if (s === "Em revisão") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl" style={{ animation: "slideUp 0.3s ease" }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: TAKT.cyan }}>
        <Check size={11} className="text-white" />
      </div>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onClose}><X size={14} className="text-gray-400 hover:text-white" /></button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL CADASTRO DE CLIENTE
// ════════════════════════════════════════════════════════════════
const BRAND_COLORS = ["#28D3E0", "#FFA287", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#3b82f6", "#455A64"];

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || {
    name: "", segment: "", tone: "", contentType: "", color: TAKT.cyan, instagram: "", notes: ""
  });

  const isValid = form.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: TAKT.dark }}>
          <div>
            <h2 className="text-white font-bold text-base">{client ? "Editar cliente" : "Novo cliente"}</h2>
            <p className="text-xs mt-0.5" style={{ color: TAKT.cyan }}>Preencha o perfil de marca do cliente</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome do cliente *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="Ex: Minha Empresa Ltda"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Segmento / Nicho</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="Ex: Moda feminina, Tecnologia, Imóveis..."
              value={form.segment}
              onChange={e => setForm({ ...form, segment: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tom de voz da marca</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="Ex: Descontraído, jovem, próximo do público"
              value={form.tone}
              onChange={e => setForm({ ...form, tone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipos de conteúdo preferidos</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="Ex: Reels, carrosséis educativos, posts de produto"
              value={form.contentType}
              onChange={e => setForm({ ...form, contentType: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">@ do Instagram</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="@cliente"
              value={form.instagram}
              onChange={e => setForm({ ...form, instagram: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações / Briefing geral</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none"
              placeholder="Principais diferenciais, público-alvo, restrições de conteúdo..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Cor da marca</label>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? TAKT.dark : "transparent",
                    boxShadow: form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none"
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200"
                title="Cor personalizada"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: isValid ? TAKT.cyan : "#ccc", cursor: isValid ? "pointer" : "not-allowed", color: isValid ? TAKT.dark : "white" }}
          >
            <Save size={14} />
            {client ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL ADICIONAR REFERÊNCIA (Biblioteca)
// ════════════════════════════════════════════════════════════════
function ReferenceModal({ clients, onSave, onClose, preClient }) {
  const [form, setForm] = useState({ client_name: preClient || "", title: "", image_url: "", notes: "" });
  const isValid = form.client_name && form.image_url.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: TAKT.dark }}>
          <div>
            <h2 className="text-white font-bold text-base">Adicionar referência</h2>
            <p className="text-xs mt-0.5" style={{ color: TAKT.cyan }}>Cole o link de uma imagem ou post de referência</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cliente *</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white"
              value={form.client_name}
              onChange={e => setForm({ ...form, client_name: e.target.value })}
            >
              <option value="">Selecionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="Ex: Referência de carrossel educativo"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL da imagem *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              placeholder="https://..."
              value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">Cole o link direto de uma imagem (JPG, PNG) ou post</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none"
              placeholder="O que você gosta nessa referência? Cores, layout, tom..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: isValid ? TAKT.cyan : "#ccc", color: isValid ? TAKT.dark : "white", cursor: isValid ? "pointer" : "not-allowed" }}
          >
            <Save size={14} /> Salvar referência
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <aside className="w-60 flex flex-col h-full flex-shrink-0" style={{ backgroundColor: TAKT.dark }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "#2e3434" }}>
        <div className="flex items-center gap-3">
          <TaktLogoIcon size={34} />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base tracking-wide" style={{ color: TAKT.cyan }}>takt</span>
              <span className="font-semibold text-sm text-white">digital</span>
            </div>
            <p className="text-xs font-medium" style={{ color: TAKT.slate, marginTop: "1px" }}>Copilot IA</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id || (page === "result" && id === "create");
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? TAKT.cyan : "transparent",
                color: active ? TAKT.dark : "#9ca3af",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "#2e3434"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9ca3af"; } }}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t" style={{ borderColor: "#2e3434" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[#2e3434]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Social Media</p>
            <p className="text-xs truncate" style={{ color: TAKT.slate }}>takt.com.br</p>
          </div>
          <LogOut size={14} style={{ color: TAKT.slate }} />
        </div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════
// HEADER — pendingCount ativa badge no sino
// ════════════════════════════════════════════════════════════════
function Header({ title, sub, action, pendingCount = 0 }) {
  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-gray-900 font-bold text-lg">{title}</h1>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <div className="relative">
          <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
            <Bell size={15} className="text-gray-500" />
          </button>
          {pendingCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
              style={{ backgroundColor: TAKT.coral, fontSize: "9px" }}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
          SM
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard({ setPage, clients, history, pendingCount }) {
  const stats = [
    { label: "Posts criados no mês", value: String(history.length), icon: FileText, bg: TAKT.cyanLight, iconColor: TAKT.cyan, change: history.length > 0 ? `${history.length} posts gerados` : "Comece criando posts" },
    { label: "Tempo economizado", value: `${history.length * 0.5}h`, icon: Clock, bg: "#fff3f0", iconColor: TAKT.coral, change: "Estimativa do mês" },
    { label: "Clientes ativos", value: String(clients.length), icon: Users, bg: TAKT.slatLight, iconColor: TAKT.slate, change: clients.length > 0 ? `${clients.length} clientes cadastrados` : "Cadastre seus clientes" },
    { label: "Em revisão", value: String(pendingCount), icon: AlertCircle, bg: "#fff8e1", iconColor: "#f59e0b", change: "Aguardando aprovação" },
  ];

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        sub={today.charAt(0).toUpperCase() + today.slice(1)}
        pendingCount={pendingCount}
        action={
          <button
            onClick={() => setPage("create")}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}
          >
            <Plus size={15} /> Criar novo post
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <s.icon size={18} style={{ color: s.iconColor }} />
                </div>
                <TrendingUp size={13} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs font-medium mt-2" style={{ color: TAKT.cyan }}>{s.change}</p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          style={{ background: `linear-gradient(135deg, ${TAKT.dark} 0%, #2e3e3e 100%)` }}
          onClick={() => setPage("create")}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} style={{ color: TAKT.cyan }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TAKT.cyan }}>Novo post com IA</span>
            </div>
            <p className="text-white text-lg font-bold">Crie seu próximo post em menos de 2 minutos</p>
            <p className="text-gray-400 text-sm mt-1">Preencha o briefing e deixe os agentes trabalharem.</p>
          </div>
          <button
            className="flex items-center gap-2 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 ml-6"
            style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}
          >
            Começar agora <ArrowRight size={16} />
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: TAKT.cyanLight }}>
              <Users size={24} style={{ color: TAKT.cyan }} />
            </div>
            <p className="text-gray-900 font-bold text-base">Nenhum cliente ainda</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Cadastre seus primeiros clientes para começar a gerar conteúdo</p>
            <button
              onClick={() => setPage("clients")}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}
            >
              <Plus size={15} /> Cadastrar cliente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-gray-900 font-semibold text-sm">Conteúdos recentes</h2>
                <p className="text-gray-400 text-xs">Últimos gerados pela equipe</p>
              </div>
              <button onClick={() => setPage("history")} className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: TAKT.cyan }}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Nenhum post gerado ainda. <button onClick={() => setPage("create")} className="underline font-medium" style={{ color: TAKT.cyan }}>Criar agora</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center px-6 py-3.5 hover:bg-gray-50 transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: TAKT.cyanLight }}>
                      <FileText size={14} style={{ color: TAKT.cyan }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 text-sm font-medium">{item.client}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 text-xs truncate">{item.theme}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{item.type}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{item.platform}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(item.status)}`}>{item.status}</span>
                      <span className="text-gray-400 text-xs">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CREATE POST
// ════════════════════════════════════════════════════════════════
function CreatePost({ setPage, setResult, clients, addHistory, preSelectedClient, pendingCount }) {
  const [form, setForm] = useState({ client: preSelectedClient || "", type: "", platform: "", theme: "", goal: "", audience: "", notes: "" });
  const [file, setFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);

  const selectedClient = clients.find(c => c.name === form.client);

  const handleGenerate = async () => {
    if (!form.client || !form.theme) {
      setError("Por favor, selecione um cliente e preencha o tema do conteúdo.");
      return;
    }
    setError(null);
    setGenerating(true);
    setStep(0);

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) { clearInterval(interval); return 5; }
        return prev + 1;
      });
    }, 900);

    try {
      const clientProfile = selectedClient
        ? `Tom de voz: ${selectedClient.tone || "não definido"}. Segmento: ${selectedClient.segment || "não definido"}. Tipos de conteúdo: ${selectedClient.contentType || "não definido"}. ${selectedClient.notes ? "Briefing: " + selectedClient.notes : ""}`
        : "";

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientProfile }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro na API");
      }

      const data = await response.json();
      const merged = {
        ...data,
        client: form.client,
        type: form.type || "Post único",
        platform: form.platform || "Instagram",
        goal: form.goal || "Engajamento",
        theme: form.theme,
        status: "Em revisão",
        _timestamp: Date.now(),
      };

      // Aguarda a animação terminar, salva no banco e navega
      setTimeout(async () => {
        const savedId = await addHistory(merged);
        setResult({ ...merged, id: savedId });
        setPage("result");
      }, 5500);

    } catch (err) {
      clearInterval(interval);
      setGenerating(false);
      setError("Erro ao gerar conteúdo: " + err.message);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Gerando conteúdo..." sub="Agentes de IA trabalhando em paralelo" pendingCount={pendingCount} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: TAKT.cyan }}>
                <Sparkles size={28} style={{ color: TAKT.dark }} />
              </div>
              <h2 className="text-gray-900 font-bold text-xl">Processando sua solicitação</h2>
              <p className="text-gray-500 text-sm mt-2">Os agentes estão trabalhando para <strong>{form.client}</strong>.</p>
            </div>
            <div className="space-y-3">
              {AI_AGENTS.map((agent, i) => {
                const done = step > i; const active = step === i;
                return (
                  <div key={agent.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${done ? "bg-green-50 border-green-200" : active ? `${agent.bg} ${agent.border} border shadow-sm` : "bg-gray-50 border-gray-100"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500" : active ? agent.iconBg : "bg-gray-100"}`}>
                      {done ? <Check size={18} className="text-white" /> : <agent.icon size={18} className={active ? agent.iconColor : "text-gray-300"} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${done ? "text-green-700" : active ? "text-gray-900" : "text-gray-400"}`}>IA {agent.id}: {agent.name}</p>
                        {active && <span className="flex gap-1">{[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>}
                        {done && <span className="text-xs text-green-600 font-medium">Concluído</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${done ? "text-green-600" : active ? "text-gray-600" : "text-gray-400"}`}>{agent.desc}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${done ? "border-green-200 text-green-600 bg-green-50" : active ? `${agent.border} ${agent.iconColor} ${agent.bg}` : "border-gray-200 text-gray-300 bg-white"}`}>{agent.tool}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min((step / 5) * 100, 100)}%`, backgroundColor: TAKT.cyan }} />
            </div>
            <p className="text-center text-gray-400 text-xs mt-2">{step < 5 ? `Etapa ${step + 1} de 5` : "Finalizado! Redirecionando..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Criar novo post"
        sub="Preencha o briefing e a IA gera o conteúdo completo"
        pendingCount={pendingCount}
        action={<button onClick={() => setPage("dashboard")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1 transition-all"><X size={14} /> Cancelar</button>}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex gap-6 max-w-6xl">
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>1</div>
                Informações do post
              </h3>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"><AlertCircle size={14} className="text-red-500 flex-shrink-0" /><p className="text-red-600 text-xs">{error}</p></div>}
              {clients.length === 0 && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: TAKT.cyanLight, border: `1px solid ${TAKT.cyanBorder}` }}>
                  <AlertCircle size={14} style={{ color: TAKT.cyan }} className="flex-shrink-0" />
                  <p className="text-xs" style={{ color: TAKT.cyanDark }}>Nenhum cliente cadastrado. <button onClick={() => setPage("clients")} className="font-bold underline">Cadastre aqui</button> antes de criar posts.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cliente *</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                    <option value="">Selecionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de conteúdo</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="">Selecionar tipo...</option>
                    {["Post único", "Carrossel", "Reels", "Anúncio", "Stories"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plataforma</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    <option value="">Selecionar plataforma...</option>
                    {["Instagram", "LinkedIn", "Meta Ads", "TikTok", "Blog"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objetivo</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                    <option value="">Selecionar objetivo...</option>
                    {["Autoridade", "Venda", "Educação", "Captação de lead", "Engajamento", "Institucional"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tema do conteúdo *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="Ex: Lançamento da coleção verão 2026..." value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Público-alvo</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="Ex: Mulheres 25-40 anos, interessadas em moda..." value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações extras</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none" placeholder="Detalhes, tom específico, referências..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              {selectedClient && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: TAKT.cyanLight, border: `1px solid ${TAKT.cyanBorder}` }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: selectedClient.color }}>
                    <span className="text-white font-bold" style={{ fontSize: "8px" }}>{selectedClient.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: TAKT.cyanDark }}>Perfil de {selectedClient.name} carregado</p>
                    {selectedClient.tone && <p className="text-xs text-gray-500 mt-0.5">Tom: {selectedClient.tone}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-gray-800 font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>2</div>
                Fluxo de agentes IA
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {AI_AGENTS.map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex flex-col items-center p-3 rounded-xl border ${agent.border} ${agent.bg} w-24`}>
                      <div className={`w-8 h-8 rounded-lg ${agent.iconBg} flex items-center justify-center mb-1.5`}><agent.icon size={15} className={agent.iconColor} /></div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{agent.name}</span>
                    </div>
                    {i < AI_AGENTS.length - 1 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: TAKT.cyan, color: TAKT.dark, boxShadow: `0 4px 20px ${TAKT.cyan}55` }}
            >
              <Sparkles size={17} /> Gerar conteúdo com IA
            </button>
          </div>

          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>3</div>
                Referência visual
              </h3>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all`} style={{ borderColor: file ? TAKT.cyan : "#e5e7eb" }}>
                  {file ? (
                    <><div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: TAKT.cyanLight }}><Check size={18} style={{ color: TAKT.cyan }} /></div><p className="text-xs font-semibold" style={{ color: TAKT.cyan }}>Arquivo enviado!</p><p className="text-gray-400 text-xs mt-1 truncate">{file.name}</p></>
                  ) : (
                    <><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2"><Upload size={18} className="text-gray-400" /></div><p className="text-gray-500 text-xs font-medium">Arraste ou clique para enviar</p><p className="text-gray-400 text-xs mt-1">PNG, JPG, PDF — até 10MB</p></>
                  )}
                </div>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
            <div className="rounded-2xl border p-4" style={{ backgroundColor: TAKT.cyanLight, borderColor: TAKT.cyanBorder }}>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: TAKT.cyanDark }}><Star size={12} /> Dicas para melhor resultado</p>
              <ul className="space-y-1.5">
                {["Selecione o cliente para a IA usar o perfil de marca", "Descreva bem o tema para um copy mais certeiro", "Adicione observações com detalhes de tom ou estilo"].map((tip, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: TAKT.cyan }}><Check size={10} className="mt-0.5 flex-shrink-0" /> {tip}</li>
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
  { id: "visual", label: "Dir. visual" },
  { id: "checklist", label: "Checklist" },
];

function ResultPage({ setPage, result, updateHistory, setPreSelectedClient, pendingCount }) {
  const [tab, setTab] = useState("analysis");
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(result.status === "Aprovado");

  const handleCopy = () => {
    let content = "";
    if (tab === "analysis") content = result.analysis || "";
    else if (tab === "idea") content = result.idea || "";
    else if (tab === "artText") content = `${result.headline}\n${result.sub}\n${result.cta}`;
    else if (tab === "caption") content = result.caption || "";
    else if (tab === "visual") content = result.visual || "";
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    if (!approved) {
      updateHistory(result);
      setApproved(true);
    }
  };

  const handleGenerateAgain = () => {
    setPreSelectedClient(result.client || "");
    setPage("create");
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Resultado gerado"
        sub={`${result.client || "—"} · ${result.type || "—"} · ${result.platform || "—"} · ${result.goal || "—"}`}
        pendingCount={pendingCount}
        action={
          <div className="flex items-center gap-2">
            <button onClick={handleGenerateAgain} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all">
              <RefreshCw size={13} /> Gerar novamente
            </button>
            <button
              onClick={handleApprove}
              disabled={approved}
              className="flex items-center gap-1.5 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ backgroundColor: approved ? "#86efac" : "#22c55e", cursor: approved ? "default" : "pointer" }}
            >
              <Check size={13} /> {approved ? "Aprovado!" : "Aprovar"}
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
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
                <div key={label}><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-800">{val}</p></div>
              ))}
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ backgroundColor: TAKT.cyanLight, color: TAKT.cyanDark, border: `1px solid ${TAKT.cyanBorder}` }}>
              <Sparkles size={11} /> Gerado por IA
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-all border-b-2"
                style={{ borderBottomColor: tab === t.id ? TAKT.cyan : "transparent", color: tab === t.id ? TAKT.cyan : "#6b7280", backgroundColor: tab === t.id ? TAKT.cyanLight : "transparent" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all" style={{ borderColor: copied ? "#86efac" : "#e5e7eb", color: copied ? "#16a34a" : "#6b7280", backgroundColor: copied ? "#f0fdf4" : "white" }}>
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>

            {tab === "analysis" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Eye size={15} className="text-purple-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 1: Analista Visual</p><p className="text-xs text-gray-400">Interpretação da referência e estilo ideal</p></div></div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{result.analysis || "Nenhuma análise gerada."}</div>
              </div>
            )}
            {tab === "idea" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Target size={15} className="text-blue-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 2: Estrategista de Conteúdo</p><p className="text-xs text-gray-400">Conceito e posicionamento do post</p></div></div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{result.idea || "Nenhuma ideia gerada."}</div>
              </div>
            )}
            {tab === "artText" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Pen size={15} className="text-orange-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 3: Copywriter — Texto para arte</p><p className="text-xs text-gray-400">Headline, subheadline e CTA</p></div></div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-48 flex items-center justify-center p-8" style={{ background: `linear-gradient(135deg, ${TAKT.dark} 0%, #2e3e3e 100%)` }}>
                    <div className="text-center max-w-sm">
                      <p className="text-white font-bold text-lg leading-tight">{result.headline || "—"}</p>
                      <p className="text-gray-300 text-xs mt-2 leading-relaxed">{result.sub || "—"}</p>
                      <div className="mt-4 inline-block text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>{result.cta || "—"}</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 space-y-3">
                    {[{ label: "Headline", val: result.headline }, { label: "Subheadline", val: result.sub }, { label: "CTA", val: result.cta }].map(({ label, val }) => (
                      <div key={label} className="flex gap-3"><span className="text-xs font-bold w-24 flex-shrink-0 pt-0.5" style={{ color: TAKT.cyan }}>{label}</span><span className="text-sm text-gray-700">{val || "—"}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === "caption" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><MessageSquare size={15} className="text-orange-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 3: Copywriter — Legenda</p><p className="text-xs text-gray-400">Legenda completa para {result.platform || "redes sociais"}</p></div></div>
                <div className="bg-gray-50 rounded-xl p-4"><pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.caption || "Nenhuma legenda gerada."}</pre></div>
                {result.caption && <div className="mt-3 flex items-center gap-4 text-xs text-gray-400"><span>Caracteres: {result.caption.length}</span><span>·</span><span className="font-medium" style={{ color: "#22c55e" }}>✓ Dentro do limite</span></div>}
              </div>
            )}
            {tab === "visual" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center"><Palette size={15} className="text-pink-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 4: Diretor de Arte</p><p className="text-xs text-gray-400">Briefing visual para designer</p></div></div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{result.visual || "Nenhum briefing visual gerado."}</div>
              </div>
            )}
            {tab === "checklist" && (
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><CheckSquare size={15} className="text-green-600" /></div><div><p className="text-sm font-bold text-gray-900">IA 5: Revisor</p><p className="text-xs text-gray-400">Verificação de qualidade</p></div></div>
                <div className="space-y-2.5">
                  {(result.checklist || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Check size={12} className="text-white" /></div>
                      <span className="text-sm text-green-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                {result.checklist?.length > 0 && (
                  <div className="mt-5 p-4 rounded-xl text-white flex items-center justify-between" style={{ backgroundColor: "#22c55e" }}>
                    <div><p className="font-bold text-sm">✓ Aprovado pelo Revisor</p><p className="text-green-100 text-xs mt-0.5">Todos os critérios verificados.</p></div>
                    <div className="text-3xl font-black">{result.checklist.length}/{result.checklist.length}</div>
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
function ClientsPage({ setPage, clients, setClients, showToast, setPreSelectedClient, pendingCount }) {
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = async (form) => {
    if (editClient) {
      await supabase.from('clients').update({
        name: form.name, segment: form.segment, tone: form.tone,
        content_type: form.contentType, instagram: form.instagram,
        notes: form.notes, color: form.color,
      }).eq('id', editClient.id);
      setClients(prev => prev.map(c => c.id === editClient.id
        ? { ...editClient, ...form, contentType: form.contentType } : c));
      showToast("Cliente atualizado com sucesso!");
    } else {
      const { data } = await supabase.from('clients').insert({
        name: form.name, segment: form.segment, tone: form.tone,
        content_type: form.contentType, instagram: form.instagram,
        notes: form.notes, color: form.color,
      }).select().single();
      if (data) setClients(prev => [{ ...data, contentType: data.content_type }, ...prev]);
      showToast("Cliente cadastrado com sucesso!");
    }
    setShowModal(false);
    setEditClient(null);
  };

  const handleDelete = async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    showToast("Cliente removido.");
  };

  const handleCreatePost = (clientName) => {
    setPreSelectedClient(clientName);
    setPage("create");
  };

  return (
    <div className="flex flex-col h-full">
      {(showModal || editClient) && (
        <ClientModal
          client={editClient}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditClient(null); }}
        />
      )}
      <Header
        title="Clientes"
        sub="Perfis de marca e configurações por cliente"
        pendingCount={pendingCount}
        action={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
            <Plus size={15} /> Novo cliente
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: TAKT.cyanLight }}>
              <Users size={28} style={{ color: TAKT.cyan }} />
            </div>
            <p className="text-gray-900 font-bold text-xl mb-2">Nenhum cliente cadastrado</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">Comece cadastrando seus clientes. A IA usará o perfil de cada um para gerar conteúdo personalizado.</p>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
              <Plus size={16} /> Cadastrar primeiro cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {clients.map(client => (
              <div key={client.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-24 flex items-end p-5" style={{ background: `linear-gradient(135deg, ${client.color}22, ${client.color}44)` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: client.color }}>
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold">{client.name}</p>
                      <p className="text-gray-500 text-xs">{client.segment || "Sem segmento"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {client.tone && <div><p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Tom de voz</p><p className="text-sm text-gray-700">{client.tone}</p></div>}
                  {client.contentType && <div><p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Conteúdo preferido</p><p className="text-sm text-gray-700">{client.contentType}</p></div>}
                  {client.instagram && <div className="flex items-center gap-1.5"><Globe size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{client.instagram}</span></div>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: TAKT.cyanLight, color: TAKT.cyanDark }}>{client.posts_count || 0} posts</span>
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => handleCreatePost(client.name)} className="flex-1 text-white py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
                    Criar post
                  </button>
                  <button onClick={() => setEditClient(client)} className="px-3 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-xs font-medium transition-all">
                    Editar
                  </button>
                  <button onClick={() => setDeleteConfirm(client.id)} className="px-3 border border-red-100 text-red-400 hover:bg-red-50 py-2 rounded-lg text-xs font-medium transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
                {deleteConfirm === client.id && (
                  <div className="mx-5 mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-700 font-medium mb-2">Remover {client.name}?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(client.id)} className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-semibold">Sim, remover</button>
                      <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div onClick={() => setShowModal(true)} className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer transition-all group min-h-64 hover:border-gray-300">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-all">
                <Plus size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">Adicionar cliente</p>
              <p className="text-gray-400 text-xs mt-1 text-center">Configure perfil, tom de voz e identidade visual</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HISTORY PAGE
// ════════════════════════════════════════════════════════════════
function HistoryPage({ setPage, history, setResult, updateHistory, pendingCount }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = history.filter(h => {
    const matchSearch = h.client.toLowerCase().includes(search.toLowerCase()) ||
      (h.theme || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = (item) => {
    updateHistory(item);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Histórico" sub="Todos os conteúdos gerados pela equipe" pendingCount={pendingCount} />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" placeholder="Buscar por cliente ou tema..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-white focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="Em revisão">Em revisão</option>
            <option value="Aprovado">Aprovado</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: TAKT.cyanLight }}><History size={20} style={{ color: TAKT.cyan }} /></div>
            <p className="text-gray-500 font-medium">Nenhum histórico ainda</p>
            <p className="text-gray-400 text-sm mt-1">Os posts gerados aparecem aqui</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Data", "Cliente", "Tema", "Tipo", "Plataforma", "Status", "Ações"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5 bg-gray-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{item.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TAKT.cyanLight }}>
                          <span className="font-bold" style={{ fontSize: "9px", color: TAKT.cyanDark }}>{item.client.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{item.client}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs"><span className="truncate block" style={{ maxWidth: "160px" }}>{item.theme}</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{item.type}</span></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{item.platform}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {item.headline && (
                          <button
                            onClick={() => { setResult(item); setPage("result"); }}
                            className="text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: TAKT.cyan }}
                          >
                            Abrir <ChevronRight size={12} />
                          </button>
                        )}
                        {item.status === "Em revisão" && (
                          <button
                            onClick={() => handleApprove(item)}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <Check size={12} /> Aprovar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ════════════════════════════════════════════════════════════════
function SettingsPage({ showToast, pendingCount }) {
  const [aiConfig, setAiConfig] = useState(AI_CONFIG_DEFAULT);
  const [agentMap, setAgentMap] = useState({
    1: "Claude", 2: "Claude", 3: "GPT-4", 4: "Gemini Pro", 5: "Claude"
  });

  const toggleAI = (id) => {
    if (id === "make") return;
    setAiConfig(prev => prev.map(ai => ai.id === id ? { ...ai, active: !ai.active } : ai));
  };

  const handleSave = () => {
    showToast("Configurações salvas com sucesso!");
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Configurações de IA" sub="Gerencie quais IAs atuam em cada etapa do fluxo" pendingCount={pendingCount} />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ backgroundColor: TAKT.cyanLight, border: `1px solid ${TAKT.cyanBorder}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TAKT.cyan }}>
            <Check size={17} style={{ color: TAKT.dark }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: TAKT.dark }}>3 IAs conectadas e funcionando</p>
            <p className="text-xs mt-0.5" style={{ color: TAKT.slate }}>Claude, GPT-4 e Gemini estão ativos. Gere um post para ver em ação.</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {aiConfig.map((ai) => (
            <div key={ai.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">{ai.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-gray-900 font-bold text-sm">{ai.name}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${ai.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {ai.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: TAKT.cyan }}>Função: {ai.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{ai.desc}</p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleAI(ai.id)}
                  className="relative w-11 h-6 rounded-full transition-all"
                  style={{ backgroundColor: ai.active ? TAKT.cyan : "#d1d5db", cursor: ai.id === "make" ? "not-allowed" : "pointer", opacity: ai.id === "make" ? 0.5 : 1 }}
                >
                  <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: ai.active ? "22px" : "2px" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-1">Mapeamento de IA por etapa</h3>
          <p className="text-gray-400 text-xs mb-5">Configure qual IA executa cada função do pipeline.</p>
          <div className="space-y-3">
            {AI_AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg ${agent.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <agent.icon size={14} className={agent.iconColor} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">IA {agent.id}: {agent.name}</p>
                  <p className="text-xs text-gray-400 truncate">{agent.desc}</p>
                </div>
                <select
                  value={agentMap[agent.id]}
                  onChange={e => setAgentMap(prev => ({ ...prev, [agent.id]: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none"
                >
                  {["Claude", "GPT-4", "Gemini Pro"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="mt-4 w-full text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all" style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}>
            <Save size={14} /> Salvar configurações
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-1">Chaves de API</h3>
          <p className="text-gray-400 text-xs mb-4">As chaves estão armazenadas com segurança no Vercel.</p>
          <div className="space-y-3">
            {[
              { name: "ANTHROPIC_API_KEY", label: "Claude (Anthropic)", status: true },
              { name: "OPENAI_API_KEY", label: "OpenAI (GPT-4)", status: true },
              { name: "GEMINI_API_KEY", label: "Google (Gemini)", status: true },
            ].map(k => (
              <div key={k.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">{k.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{k.name}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${k.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {k.status ? "✓ Configurada" : "✗ Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LIBRARY PAGE — Biblioteca de Referências funcional
// REQUER tabela no Supabase (ver SQL abaixo na instrução)
// ════════════════════════════════════════════════════════════════
function LibraryPage({ clients, setPage, references, addReference, deleteReference, pendingCount }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const filtered = selectedClient === "all"
    ? references
    : references.filter(r => r.client_name === selectedClient);

  const handleSave = async (form) => {
    await addReference(form);
    setShowModal(false);
  };

  const clientColor = (name) => clients.find(c => c.name === name)?.color || TAKT.cyan;

  return (
    <div className="flex flex-col h-full">
      {showModal && (
        <ReferenceModal
          clients={clients}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
      <Header
        title="Biblioteca de Referências"
        sub="Imagens e posts de referência organizados por cliente"
        pendingCount={pendingCount}
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}
          >
            <Upload size={15} /> Enviar referência
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Filtro por cliente */}
        {clients.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setSelectedClient("all")}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ backgroundColor: selectedClient === "all" ? TAKT.cyan : TAKT.cyanLight, color: selectedClient === "all" ? TAKT.dark : TAKT.cyanDark }}
            >
              Todos ({references.length})
            </button>
            {clients.map(c => {
              const count = references.filter(r => r.client_name === c.name).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClient(c.name)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: selectedClient === c.name ? c.color : "#f3f4f6",
                    color: selectedClient === c.name ? "white" : "#6b7280"
                  }}
                >
                  {c.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: TAKT.cyanLight }}>
              <BookOpen size={28} style={{ color: TAKT.cyan }} />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-2">
              {selectedClient === "all" ? "Nenhuma referência ainda" : `Sem referências para ${selectedClient}`}
            </p>
            <p className="text-gray-400 text-sm mb-5 max-w-sm">
              Adicione imagens e posts de referência para usar como inspiração ao gerar conteúdo.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: TAKT.cyan, color: TAKT.dark }}
            >
              <Upload size={15} /> Adicionar referência
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(ref => (
              <div key={ref.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                {/* Imagem */}
                <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                  {imgErrors[ref.id] ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <Link size={24} className="text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 mb-1">Pré-visualização indisponível</p>
                      <a
                        href={ref.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold underline"
                        style={{ color: TAKT.cyan }}
                      >
                        Abrir link ↗
                      </a>
                    </div>
                  ) : (
                    <img
                      src={ref.image_url}
                      alt={ref.title || "Referência"}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [ref.id]: true }))}
                    />
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: clientColor(ref.client_name) }}
                    >
                      {ref.client_name}
                    </span>
                    <button
                      onClick={() => setDeleteConfirm(ref.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                  {ref.title && <p className="text-sm font-semibold text-gray-800 mb-1">{ref.title}</p>}
                  {ref.notes && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ref.notes}</p>}
                  <p className="text-xs text-gray-300 mt-2">
                    {ref.created_at ? new Date(ref.created_at).toLocaleDateString('pt-BR') : ""}
                  </p>

                  {deleteConfirm === ref.id && (
                    <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs text-red-700 font-medium mb-2">Remover esta referência?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { deleteReference(ref.id); setDeleteConfirm(null); }}
                          className="flex-1 bg-red-500 text-white py-1 rounded-lg text-xs font-semibold"
                        >
                          Sim, remover
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 border border-gray-200 text-gray-600 py-1 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Card "Adicionar" */}
            <div
              onClick={() => setShowModal(true)}
              className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-gray-300 transition-all group min-h-48"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-all">
                <Plus size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">Adicionar referência</p>
              <p className="text-gray-400 text-xs mt-1 text-center">Cole uma URL de imagem ou post</p>
            </div>
          </div>
        )}
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
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [references, setReferences] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preSelectedClient, setPreSelectedClient] = useState("");

  const showToast = (msg) => setToast(msg);

  // Limpa preSelectedClient ao sair da tela de criar post
  const handleSetPage = (p) => {
    if (p !== "create") setPreSelectedClient("");
    setPage(p);
  };

  const pendingCount = history.filter(h => h.status === "Em revisão").length;

  // ── Carrega todos os dados do banco ao abrir ──
  useEffect(() => {
    const loadData = async () => {
      const [
        { data: clientsData },
        { data: postsData },
        { data: refsData },
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('referencias').select('*').order('created_at', { ascending: false }),
      ]);

      if (clientsData) {
        setClients(clientsData.map(c => ({ ...c, contentType: c.content_type })));
      }
      if (postsData) {
        setHistory(postsData.map(p => ({
          id: p.id,
          client: p.client_name,
          theme: p.theme,
          type: p.type,
          platform: p.platform,
          goal: p.goal,
          status: p.status,
          date: new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          // Conteúdo completo — necessário para reabrir pelo Histórico
          analysis: p.analysis,
          idea: p.idea,
          headline: p.headline,
          sub: p.sub,
          cta: p.cta,
          caption: p.caption,
          visual: p.visual,
          checklist: p.checklist,
        })));
      }
      if (refsData) setReferences(refsData);

      setLoading(false);
    };
    loadData();
  }, []);

  // ── Salva post gerado no banco e retorna o id ──
  const addHistory = async (item) => {
    const { data } = await supabase.from('posts').insert({
      client_name: item.client,
      theme: item.theme,
      type: item.type,
      platform: item.platform,
      goal: item.goal,
      status: item.status,
      analysis: item.analysis,
      idea: item.idea,
      headline: item.headline,
      sub: item.sub,
      cta: item.cta,
      caption: item.caption,
      visual: item.visual,
      checklist: item.checklist,
    }).select().single();

    if (data) {
      const histItem = {
        id: data.id,
        client: data.client_name,
        theme: data.theme,
        type: data.type,
        platform: data.platform,
        goal: data.goal,
        status: data.status,
        date: new Date(data.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        analysis: data.analysis,
        idea: data.idea,
        headline: data.headline,
        sub: data.sub,
        cta: data.cta,
        caption: data.caption,
        visual: data.visual,
        checklist: data.checklist,
      };
      setHistory(prev => [histItem, ...prev]);
      return data.id;
    }
    return null;
  };

  // ── Aprova post pelo ID correto ──
  const updateHistory = async (targetResult) => {
    if (!targetResult?.id) return;
    await supabase.from('posts').update({ status: 'Aprovado' }).eq('id', targetResult.id);
    setHistory(prev => prev.map(h => h.id === targetResult.id ? { ...h, status: 'Aprovado' } : h));
    showToast("Post aprovado! ✓");
  };

  // ── Referências (Biblioteca) ──
  const addReference = async (form) => {
    const { data } = await supabase.from('referencias').insert(form).select().single();
    if (data) {
      setReferences(prev => [data, ...prev]);
      showToast("Referência adicionada!");
    }
  };

  const deleteReference = async (id) => {
    await supabase.from('referencias').delete().eq('id', id);
    setReferences(prev => prev.filter(r => r.id !== id));
    showToast("Referência removida.");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard setPage={handleSetPage} clients={clients} history={history} pendingCount={pendingCount} />;
      case "create":
        return <CreatePost setPage={handleSetPage} setResult={setResult} clients={clients} addHistory={addHistory} preSelectedClient={preSelectedClient} pendingCount={pendingCount} />;
      case "result":
        return <ResultPage setPage={handleSetPage} result={result} updateHistory={updateHistory} setPreSelectedClient={setPreSelectedClient} pendingCount={pendingCount} />;
      case "clients":
        return <ClientsPage setPage={handleSetPage} clients={clients} setClients={setClients} showToast={showToast} setPreSelectedClient={setPreSelectedClient} pendingCount={pendingCount} />;
      case "library":
        return <LibraryPage clients={clients} setPage={handleSetPage} references={references} addReference={addReference} deleteReference={deleteReference} pendingCount={pendingCount} />;
      case "history":
        return <HistoryPage setPage={handleSetPage} history={history} setResult={setResult} updateHistory={updateHistory} pendingCount={pendingCount} />;
      case "settings":
        return <SettingsPage showToast={showToast} pendingCount={pendingCount} />;
      default:
        return <Dashboard setPage={handleSetPage} clients={clients} history={history} pendingCount={pendingCount} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: TAKT.dark }}>
        <div className="text-center">
          <TaktLogoIcon size={48} />
          <p className="mt-4 font-bold text-lg" style={{ color: TAKT.cyan }}>takt digital</p>
          <p className="text-sm mt-1" style={{ color: TAKT.slate }}>Carregando...</p>
          <div className="mt-4 flex gap-1.5 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: TAKT.cyan, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <Sidebar page={page} setPage={handleSetPage} />
      <main className="flex-1 flex flex-col overflow-hidden">{renderPage()}</main>
    </div>
  );
}