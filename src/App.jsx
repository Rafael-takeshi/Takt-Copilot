import { useState, useEffect } from "react";
import { supabase } from './supabase';
import {
  LayoutDashboard, Plus, Users, BookOpen, Clock, Settings,
  Eye, Target, CheckSquare, Upload, FileText, Search, Bell,
  Check, Sparkles, Palette, Star, Bot,
  RefreshCw, Globe, AlertCircle, X,
  History, ArrowRight, Zap, Pen, MessageSquare,
  TrendingUp, Copy, ChevronRight, LogOut, Save, Trash2, Link,
  Image, BarChart2, Layers
} from "lucide-react";

// ════════════════════════════════════════════════════════════════
// PALETA DE CORES TAKT — equilibrada entre cyan, coral e slate
// ════════════════════════════════════════════════════════════════
const TAKT = {
  // Cyan — informação, destaque, nav ativo
  cyan: "#28D3E0",
  cyanDark: "#1fb8c4",
  cyanLight: "#e8fbfc",
  cyanBorder: "#b3eef2",
  // Coral — ação primária, CTAs, botões de criar
  coral: "#FFA287",
  coralDark: "#ff8a6a",
  coralLight: "#fff3ee",
  coralBorder: "#ffd5c5",
  // Dark & Slate — estrutura, texto
  dark: "#242828",
  darkSecond: "#2e3434",
  slate: "#455A64",
  slateLight: "#eceff1",
  slateMid: "#78909C",
};

// ════════════════════════════════════════════════════════════════
// LOGO
// ════════════════════════════════════════════════════════════════
function TaktLogoIcon({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      backgroundColor: TAKT.dark, border: `1.5px solid ${TAKT.cyanBorder}`,
      display: "flex", flexDirection: "column",
      alignItems: "flex-start", justifyContent: "center",
      padding: "0 6px", gap: "3px",
    }}>
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
  { id: 1, name: "Analista Visual", icon: Eye, desc: "Interpreta layouts, cores e estilo da referência.", tool: "Claude", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { id: 2, name: "Estrategista", icon: Target, desc: "Adapta a ideia ao cliente, público e objetivo.", tool: "Claude", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { id: 3, name: "Copywriter", icon: Pen, desc: "Gera headline, legenda, CTA e variações.", tool: "GPT-4", color: TAKT.coral, bg: TAKT.coralLight, border: TAKT.coralBorder },
  { id: 4, name: "Diretor de Arte", icon: Palette, desc: "Cria briefing visual para o designer.", tool: "Gemini", color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8" },
  { id: 5, name: "Revisor", icon: CheckSquare, desc: "Verifica clareza, tom e coerência visual.", tool: "Claude", color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" },
];

const AI_CONFIG_DEFAULT = [
  { id: "claude", name: "Claude (Anthropic)", role: "Análise visual + Revisão + Estratégia", logo: "🤖", active: true, desc: "API conectada. Responsável pela análise, estratégia e revisão de conteúdo." },
  { id: "gpt", name: "ChatGPT / GPT-4 + DALL-E 3", role: "Copywriting, legendas e geração de imagem", logo: "💬", active: true, desc: "API conectada. Gera copy, headlines, legendas e imagens via DALL-E 3 direto do briefing visual." },
  { id: "gemini", name: "Gemini Pro (Google)", role: "Apoio multimodal e análise ampliada", logo: "✨", active: true, desc: "API conectada. Suporte para análise multimodal, contexto ampliado e leitura de referências visuais." },
  { id: "dalle", name: "DALL-E 3 (OpenAI)", role: "Geração de imagens para posts e artes", logo: "🎨", active: true, desc: "API conectada via OpenAI. Gera imagens a partir do briefing visual criado pelo Diretor de Arte. Cobrado por imagem gerada (~R$ 0,22 padrão / ~R$ 0,44 HD)." },
];

const RESULT_DEFAULT = { client: "", type: "", platform: "", goal: "", theme: "", analysis: "", idea: "", headline: "", sub: "", cta: "", caption: "", visual: "", checklist: [] };

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
const statusConfig = {
  "Gerado com IA":  { bg: "bg-blue-50",   text: "text-blue-600",   dot: "#3b82f6" },
  "Em revisão":     { bg: "bg-amber-50",  text: "text-amber-600",  dot: "#f59e0b" },
  "Aprovado":       { bg: "bg-green-50",  text: "text-green-700",  dot: "#10b981" },
  "Em produção":    { bg: "bg-violet-50", text: "text-violet-600", dot: "#8b5cf6" },
  "Publicado":      { bg: "bg-teal-50",   text: "text-teal-700",   dot: "#0d9488" },
  "Reprovado":      { bg: "bg-red-50",    text: "text-red-600",    dot: "#ef4444" },
};
const getStatusStyle = (s) => {
  const c = statusConfig[s] || { bg: "bg-gray-100", text: "text-gray-500", dot: "#9ca3af" };
  return `${c.bg} ${c.text}`;
};
const getStatusDot = (s) => (statusConfig[s] || { dot: "#9ca3af" }).dot;

// Completude do perfil do cliente (%)
const clientCompleteness = (c) => {
  const fields = [c.name, c.segment, c.tone, c.contentType, c.instagram, c.notes];
  const filled = fields.filter(f => f && String(f).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
};

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 text-white px-5 py-3 rounded-2xl shadow-2xl" style={{ backgroundColor: TAKT.dark }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: TAKT.coral }}>
        <Check size={11} className="text-white" />
      </div>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onClose}><X size={14} className="text-gray-400 hover:text-white" /></button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL CLIENTE
// ════════════════════════════════════════════════════════════════
const BRAND_COLORS = ["#28D3E0", "#FFA287", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#3b82f6", "#455A64"];

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || { name: "", segment: "", tone: "", contentType: "", color: TAKT.coral, instagram: "", notes: "" });
  const isValid = form.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: TAKT.dark }}>
          <div>
            <h2 className="text-white font-bold text-base">{client ? "Editar cliente" : "Novo cliente"}</h2>
            <p className="text-xs mt-0.5" style={{ color: TAKT.coral }}>Preencha o perfil de marca do cliente</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {[
            { label: "Nome do cliente *", key: "name", placeholder: "Ex: Minha Empresa Ltda", type: "input" },
            { label: "Segmento / Nicho", key: "segment", placeholder: "Ex: Moda feminina, Tecnologia...", type: "input" },
            { label: "Tom de voz da marca", key: "tone", placeholder: "Ex: Descontraído, jovem, próximo", type: "input" },
            { label: "Tipos de conteúdo preferidos", key: "contentType", placeholder: "Ex: Reels, carrosséis educativos...", type: "input" },
            { label: "@ do Instagram", key: "instagram", placeholder: "@cliente", type: "input" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-all"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações / Briefing geral</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none" placeholder="Principais diferenciais, público-alvo, restrições..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Cor da marca</label>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110" style={{ backgroundColor: c, borderColor: form.color === c ? TAKT.dark : "transparent", boxShadow: form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none" }} />
              ))}
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200" title="Cor personalizada" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button onClick={() => isValid && onSave(form)} disabled={!isValid} className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: isValid ? TAKT.coral : "#d1d5db", color: "white", cursor: isValid ? "pointer" : "not-allowed" }}>
            <Save size={14} /> {client ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL REFERÊNCIA (Biblioteca)
// ════════════════════════════════════════════════════════════════
function ReferenceModal({ clients, onSave, onClose }) {
  const [form, setForm] = useState({ client_name: "", title: "", image_url: "", notes: "" });
  const isValid = form.client_name && form.image_url.trim().length > 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: TAKT.dark }}>
          <div>
            <h2 className="text-white font-bold text-base">Adicionar referência</h2>
            <p className="text-xs mt-0.5" style={{ color: TAKT.coral }}>Cole o link de uma imagem ou post de referência</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cliente *</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })}>
              <option value="">Selecionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="Ex: Referência de carrossel educativo" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL da imagem *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">Cole o link de uma imagem (JPG, PNG) ou post</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none" placeholder="O que você gosta? Cores, layout, tom..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button onClick={() => isValid && onSave(form)} disabled={!isValid} className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ backgroundColor: isValid ? TAKT.coral : "#d1d5db", color: "white", cursor: isValid ? "pointer" : "not-allowed" }}>
            <Save size={14} /> Salvar referência
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SIDEBAR — labels renomeados para linguagem de agência
// ════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create",    label: "Novo post com IA", icon: Sparkles },
  { id: "clients",   label: "Clientes", icon: Users },
  { id: "library",   label: "Biblioteca criativa", icon: BookOpen },
  { id: "history",   label: "Histórico de posts", icon: History },
  { id: "settings",  label: "Configurações de IA", icon: Settings },
];

function Sidebar({ page, setPage }) {
  return (
    <aside className="w-64 flex flex-col h-full flex-shrink-0" style={{ backgroundColor: TAKT.dark }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "#2e3434" }}>
        <div className="flex items-center gap-3">
          <TaktLogoIcon size={34} />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base tracking-wide" style={{ color: TAKT.cyan }}>takt</span>
              <span className="font-semibold text-sm text-white">digital</span>
            </div>
            <p className="text-xs font-medium" style={{ color: TAKT.slateMid, marginTop: "1px" }}>Copilot IA</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = page === id || (page === "result" && id === "create");
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? `${TAKT.coral}22` : "transparent",
                color: active ? TAKT.coral : TAKT.slateMid,
                borderLeft: active ? `3px solid ${TAKT.coral}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "#2e3434"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TAKT.slateMid; } }}
            >
              <Icon size={16} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t" style={{ borderColor: "#2e3434" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#2e3434] transition-all">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `linear-gradient(135deg, ${TAKT.cyan}, ${TAKT.coral})`, color: "white" }}>
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Social Media</p>
            <p className="text-xs truncate" style={{ color: TAKT.slateMid }}>takt.com.br</p>
          </div>
          <LogOut size={14} style={{ color: TAKT.slateMid }} />
        </div>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════
// HEADER — sino com badge de pendentes
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
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: TAKT.coral, fontSize: "9px" }}>
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: `linear-gradient(135deg, ${TAKT.cyan}, ${TAKT.coral})` }}>
          SM
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard({ setPage, clients, history, pendingCount, setPreSelectedClient }) {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const stats = [
    {
      label: "Posts criados no mês",
      value: String(history.length),
      sub: history.length > 0 ? `${history.length} posts gerados pela IA` : "Nenhum post ainda",
      icon: FileText,
      gradient: `linear-gradient(135deg, ${TAKT.cyanLight}, white)`,
      iconBg: TAKT.cyan,
      border: TAKT.cyanBorder,
    },
    {
      label: "Horas economizadas pela IA",
      value: `${(history.length * 0.5).toFixed(1)}h`,
      sub: "~30 min economizados por post",
      icon: Clock,
      gradient: `linear-gradient(135deg, ${TAKT.coralLight}, white)`,
      iconBg: TAKT.coral,
      border: TAKT.coralBorder,
    },
    {
      label: "Clientes com perfil ativo",
      value: String(clients.length),
      sub: clients.length > 0 ? `${clients.length} identidades cadastradas` : "Cadastre seus clientes",
      icon: Users,
      gradient: `linear-gradient(135deg, #f5f3ff, white)`,
      iconBg: "#8b5cf6",
      border: "#ddd6fe",
    },
    {
      label: "Posts aguardando revisão",
      value: String(pendingCount),
      sub: pendingCount > 0 ? "Aguardando aprovação do social" : "Tudo aprovado!",
      icon: AlertCircle,
      gradient: `linear-gradient(135deg, #fffbeb, white)`,
      iconBg: "#f59e0b",
      border: "#fde68a",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        sub={today.charAt(0).toUpperCase() + today.slice(1)}
        pendingCount={pendingCount}
        action={
          <button onClick={() => setPage("create")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: TAKT.coral }}>
            <Plus size={15} /> Novo post
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 border hover:shadow-md transition-all" style={{ background: s.gradient, borderColor: s.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: s.iconBg }}>
                  <s.icon size={16} />
                </div>
                <TrendingUp size={12} className="text-gray-300" />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA Hero */}
        <div
          className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all"
          style={{ background: `linear-gradient(135deg, ${TAKT.dark} 0%, #1a2020 60%, #2a1e1e 100%)` }}
          onClick={() => setPage("create")}
        >
          <div className="px-8 py-7 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${TAKT.coral}30` }}>
                  <Sparkles size={13} style={{ color: TAKT.coral }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: TAKT.coral }}>Copilot IA</span>
              </div>
              <p className="text-white text-xl font-black leading-tight mb-2">
                Transforme referências em posts<br />prontos com IA
              </p>
              <p className="text-sm" style={{ color: TAKT.slateMid }}>
                Envie um briefing ou referência visual e gere headline, legenda,<br />CTA e direção de arte em poucos minutos.
              </p>
            </div>
            <div className="ml-8 flex-shrink-0">
              <button className="flex items-center gap-2 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all" style={{ backgroundColor: TAKT.coral }}>
                Criar post com IA <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdos recentes */}
        {clients.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${TAKT.coralLight}, ${TAKT.cyanLight})` }}>
              <Users size={24} style={{ color: TAKT.slate }} />
            </div>
            <p className="text-gray-900 font-bold text-base">Nenhum cliente ainda</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Cadastre clientes para a IA gerar conteúdo personalizado</p>
            <button onClick={() => setPage("clients")} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: TAKT.coral }}>
              <Plus size={15} /> Cadastrar cliente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-gray-900 font-bold text-sm">Conteúdos recentes</h2>
                <p className="text-gray-400 text-xs mt-0.5">Últimos posts gerados pela equipe</p>
              </div>
              <button onClick={() => setPage("history")} className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: TAKT.cyan }}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Nenhum post gerado ainda.{" "}
                <button onClick={() => setPage("create")} className="font-bold underline" style={{ color: TAKT.coral }}>Criar agora</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {["Cliente", "Tema", "Formato", "Canal", "Status", "Data", "Ações"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3 bg-gray-50/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.slice(0, 6).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: TAKT.coral, fontSize: "9px", fontWeight: 800 }}>
                              {item.client.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{item.client}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600"><span className="truncate block max-w-36">{item.theme}</span></td>
                        <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{item.type || "—"}</span></td>
                        <td className="px-5 py-3 text-xs text-gray-500">{item.platform || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 w-fit ${getStatusStyle(item.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusDot(item.status) }} />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">{item.date}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {item.headline && (
                              <button onClick={() => { window._openResult = item; setPage("result"); }} className="text-xs font-semibold hover:underline" style={{ color: TAKT.cyan }}>Ver</button>
                            )}
                            <button onClick={() => { setPreSelectedClient(item.client); setPage("create"); }} className="text-xs font-semibold hover:underline" style={{ color: TAKT.coral }}>
                              Variação
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CREATE POST — fluxo de agentes redesenhado
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
      setStep(prev => { if (prev >= 4) { clearInterval(interval); return 5; } return prev + 1; });
    }, 900);

    try {
      const clientProfile = selectedClient
        ? `Tom de voz: ${selectedClient.tone || "não definido"}. Segmento: ${selectedClient.segment || "não definido"}. Tipos de conteúdo: ${selectedClient.contentType || "não definido"}. ${selectedClient.notes ? "Briefing: " + selectedClient.notes : ""}`
        : "";

      const response = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientProfile }),
      });

      if (!response.ok) { const err = await response.json(); throw new Error(err.error || "Erro na API"); }

      const data = await response.json();
      const merged = { ...data, client: form.client, type: form.type || "Post único", platform: form.platform || "Instagram", goal: form.goal || "Engajamento", theme: form.theme, status: "Em revisão", _timestamp: Date.now() };

      setTimeout(async () => {
        const savedId = await addHistory(merged);
        setResult({ ...merged, id: savedId });
        setPage("result");
      }, 5500);

    } catch (err) {
      clearInterval(interval);
      setGenerating(false);
      setError("Erro ao gerar: " + err.message);
    }
  };

  // ── TELA DE GERAÇÃO (animação) ──
  if (generating) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "#fafafa" }}>
        <Header title="Gerando conteúdo..." sub="Agentes de IA trabalhando em sequência" pendingCount={pendingCount} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${TAKT.coral}, ${TAKT.cyan})` }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-gray-900 font-black text-xl">Processando para <span style={{ color: TAKT.coral }}>{form.client}</span></h2>
              <p className="text-gray-500 text-sm mt-2">5 agentes especializados trabalhando em sequência</p>
            </div>

            <div className="space-y-2.5">
              {AI_AGENTS.map((agent, i) => {
                const done = step > i;
                const active = step === i;
                return (
                  <div key={agent.id} className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300" style={{
                    backgroundColor: done ? "#f0fdf4" : active ? agent.bg : "white",
                    borderColor: done ? "#a7f3d0" : active ? agent.border : "#f3f4f6",
                    transform: active ? "scale(1.01)" : "scale(1)",
                  }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: done ? "#10b981" : active ? agent.color : "#f3f4f6" }}>
                      {done
                        ? <Check size={18} className="text-white" />
                        : <agent.icon size={18} style={{ color: active ? "white" : "#d1d5db" }} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${done ? "text-green-700" : active ? "text-gray-900" : "text-gray-400"}`}>
                          {agent.name}
                        </p>
                        {active && (
                          <span className="flex gap-1">
                            {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: agent.color, animationDelay: `${d * 0.15}s` }} />)}
                          </span>
                        )}
                        {done && <span className="text-xs text-green-600 font-semibold">✓ Concluído</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${done ? "text-green-600" : active ? "text-gray-500" : "text-gray-400"}`}>{agent.desc}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: done ? "#dcfce7" : active ? `${agent.color}18` : "#f3f4f6", color: done ? "#16a34a" : active ? agent.color : "#9ca3af", border: `1px solid ${done ? "#a7f3d0" : active ? agent.border : "#e5e7eb"}` }}>
                      {agent.tool}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">{step < 5 ? `Etapa ${step + 1} de 5` : "Finalizando..."}</span>
                <span className="text-xs font-bold" style={{ color: TAKT.coral }}>{Math.min(Math.round((step / 5) * 100), 100)}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min((step / 5) * 100, 100)}%`, background: `linear-gradient(90deg, ${TAKT.cyan}, ${TAKT.coral})` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORMULÁRIO ──
  return (
    <div className="flex flex-col h-full">
      <Header title="Novo post com IA" sub="Preencha o briefing e deixe os agentes criarem o conteúdo" pendingCount={pendingCount}
        action={<button onClick={() => setPage("dashboard")} className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"><X size={14} /> Cancelar</button>}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex gap-6 max-w-6xl">
          {/* Coluna esquerda */}
          <div className="flex-1 space-y-5">
            {/* Etapa 1 — Briefing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: TAKT.coral }}>1</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Briefing do post</h3>
                  <p className="text-gray-400 text-xs">Selecione o cliente e descreva o conteúdo</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
              {clients.length === 0 && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: TAKT.coralLight, border: `1px solid ${TAKT.coralBorder}` }}>
                  <AlertCircle size={14} style={{ color: TAKT.coral }} className="flex-shrink-0" />
                  <p className="text-xs" style={{ color: TAKT.coralDark }}>
                    Nenhum cliente cadastrado.{" "}
                    <button onClick={() => setPage("clients")} className="font-bold underline">Cadastre aqui</button> antes de criar posts.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Cliente *</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                    <option value="">Selecionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  {selectedClient && (
                    <div className="mt-2 p-2.5 rounded-xl flex items-center gap-2" style={{ backgroundColor: TAKT.coralLight, border: `1px solid ${TAKT.coralBorder}` }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: selectedClient.color, fontSize: "9px", fontWeight: 800 }}>
                        {selectedClient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: TAKT.coralDark }}>Perfil de {selectedClient.name} carregado</p>
                        {selectedClient.tone && <p className="text-xs text-gray-500">Tom: {selectedClient.tone}</p>}
                      </div>
                      <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: TAKT.coralBorder, color: TAKT.coralDark }}>
                        {clientCompleteness(selectedClient)}% completo
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Tipo de conteúdo</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="">Selecionar...</option>
                    {["Post único", "Carrossel", "Reels", "Anúncio", "Stories"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Plataforma</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    <option value="">Selecionar...</option>
                    {["Instagram", "LinkedIn", "Meta Ads", "TikTok", "Blog"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Objetivo</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none bg-white" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                    <option value="">Selecionar...</option>
                    {["Autoridade", "Venda", "Educação", "Captação de lead", "Engajamento", "Institucional"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Público-alvo</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="Ex: Mulheres 25-40 anos..." value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Tema do conteúdo *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none" placeholder="Ex: Lançamento da coleção verão 2026..." value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Observações extras</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none resize-none" placeholder="Detalhes, tom específico, referências..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            {/* Etapa 2 — Pipeline de agentes REDESENHADO */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: TAKT.cyan }}>2</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Pipeline de agentes IA</h3>
                  <p className="text-gray-400 text-xs">5 especialistas trabalham em sequência para criar seu conteúdo</p>
                </div>
              </div>

              {/* Pipeline visual */}
              <div className="relative">
                {/* Linha conectora */}
                <div className="absolute top-[30px] left-[52px] right-[52px] h-px z-0" style={{ backgroundColor: "#e5e7eb" }} />
                <div className="grid grid-cols-5 gap-1 relative z-10">
                  {AI_AGENTS.map((agent, i) => (
                    <div key={agent.id} className="flex flex-col items-center">
                      {/* Ícone */}
                      <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center mb-3 border-2 shadow-sm" style={{ backgroundColor: agent.bg, borderColor: agent.border }}>
                        <agent.icon size={22} style={{ color: agent.color }} />
                      </div>
                      {/* Número */}
                      <span className="text-xs font-black mb-0.5" style={{ color: agent.color }}>0{i + 1}</span>
                      {/* Nome */}
                      <p className="text-xs font-bold text-gray-800 text-center leading-tight">{agent.name}</p>
                      {/* Badge IA */}
                      <span className="text-xs px-2 py-0.5 rounded-full mt-2 font-semibold" style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                        {agent.tool}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão gerar */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ background: `linear-gradient(135deg, ${TAKT.coral} 0%, ${TAKT.coralDark} 100%)`, boxShadow: `0 6px 24px ${TAKT.coral}44` }}
            >
              <Sparkles size={18} /> Gerar conteúdo com IA
            </button>
          </div>

          {/* Coluna direita — referência visual */}
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: TAKT.slate }}>3</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Referência visual</h3>
                  <p className="text-gray-400 text-xs">Opcional</p>
                </div>
              </div>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-gray-300" style={{ borderColor: file ? TAKT.coral : "#e5e7eb" }}>
                  {file ? (
                    <>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: TAKT.coralLight }}>
                        <Check size={18} style={{ color: TAKT.coral }} />
                      </div>
                      <p className="text-xs font-bold" style={{ color: TAKT.coral }}>Arquivo enviado!</p>
                      <p className="text-gray-400 text-xs mt-1 truncate">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2"><Upload size={18} className="text-gray-400" /></div>
                      <p className="text-gray-500 text-xs font-semibold">Clique para enviar</p>
                      <p className="text-gray-400 text-xs mt-1">PNG, JPG, PDF — até 10MB</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>

            {/* Dicas */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: TAKT.coralLight, borderColor: TAKT.coralBorder }}>
              <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: TAKT.coralDark }}>
                <Star size={12} style={{ color: TAKT.coral }} /> Dicas para melhor resultado
              </p>
              <div className="space-y-2">
                {[
                  "Selecione o cliente para a IA usar o perfil de marca",
                  "Descreva bem o tema para um copy mais certeiro",
                  "Adicione observações com detalhes de tom e estilo",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: TAKT.coral }}>
                      <Check size={9} className="text-white" />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de conteúdo rápido */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-600 mb-3">Formatos que a IA domina</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Post único", icon: FileText },
                  { label: "Carrossel", icon: Layers },
                  { label: "Reels", icon: Zap },
                  { label: "Anúncio", icon: BarChart2 },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ backgroundColor: TAKT.slateLight }}>
                    <Icon size={11} style={{ color: TAKT.slate }} />
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
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
  { id: "analysis", label: "Análise" },
  { id: "idea", label: "Estratégia" },
  { id: "artText", label: "Texto da arte" },
  { id: "caption", label: "Legenda" },
  { id: "visual", label: "Dir. Visual" },
  { id: "checklist", label: "Checklist" },
];

function ResultPage({ setPage, result, updateHistory, setPreSelectedClient, pendingCount }) {
  const [tab, setTab] = useState("analysis");
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(result.status === "Aprovado");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageQuality, setImageQuality] = useState("standard");
  const [imageExpiresAt, setImageExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Countdown — atualiza a cada segundo enquanto há imagem gerada
  useEffect(() => {
    if (!imageExpiresAt) return;
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.floor((imageExpiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [imageExpiresAt]);

  const formatCountdown = (secs) => {
    if (secs === null) return "";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const countdownColor = () => {
    if (timeLeft === null) return TAKT.slate;
    if (timeLeft < 300) return "#ef4444";   // vermelho — menos de 5 min
    if (timeLeft < 900) return "#f59e0b";   // amarelo — menos de 15 min
    return "#10b981";                        // verde — tempo ok
  };

  const handleGenerateImage = async () => {
    if (!result.visual) { setImageError("Nenhum briefing visual disponível. Gere o post primeiro."); return; }
    setGeneratingImage(true);
    setImageError(null);
    setGeneratedImage(null);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: result.visual,
          client: result.client,
          platform: result.platform,
          quality: imageQuality,
        }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || "Erro ao gerar imagem"); }
      const data = await response.json();
      setGeneratedImage(data.url);
      setImageExpiresAt(Date.now() + 60 * 60 * 1000); // expira em 1 hora
      setTimeLeft(3600);
    } catch (err) {
      setImageError(err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

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
    if (!approved) { updateHistory(result); setApproved(true); }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Resultado gerado"
        sub={`${result.client || "—"} · ${result.type || "—"} · ${result.platform || "—"}`}
        pendingCount={pendingCount}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { setPreSelectedClient(result.client || ""); setPage("create"); }} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all">
              <RefreshCw size={12} /> Gerar novamente
            </button>
            <button onClick={handleApprove} disabled={approved} className="flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all" style={{ backgroundColor: approved ? "#86efac" : "#22c55e", cursor: approved ? "default" : "pointer" }}>
              <Check size={13} /> {approved ? "Aprovado ✓" : "Aprovar"}
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Metadados */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Cliente", val: result.client },
                { label: "Formato", val: result.type },
                { label: "Plataforma", val: result.platform },
                { label: "Objetivo", val: result.goal },
                { label: "Tema", val: result.theme },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{val || "—"}</p>
                </div>
              ))}
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0" style={{ backgroundColor: TAKT.coralLight, color: TAKT.coralDark, border: `1px solid ${TAKT.coralBorder}` }}>
              <Sparkles size={11} /> Gerado por IA
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2"
                style={{ borderBottomColor: tab === t.id ? TAKT.coral : "transparent", color: tab === t.id ? TAKT.coral : "#9ca3af", backgroundColor: tab === t.id ? TAKT.coralLight : "transparent" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all" style={{ borderColor: copied ? "#86efac" : "#e5e7eb", color: copied ? "#16a34a" : "#6b7280", backgroundColor: copied ? "#f0fdf4" : "white" }}>
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>

            {tab === "analysis" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f5f3ff" }}><Eye size={15} style={{ color: "#8b5cf6" }} /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 1 — Analista Visual</p><p className="text-xs text-gray-400">Interpretação da referência e estilo ideal</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{result.analysis || "Nenhuma análise gerada."}</div>
              </div>
            )}
            {tab === "idea" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50"><Target size={15} className="text-blue-600" /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 2 — Estrategista</p><p className="text-xs text-gray-400">Conceito e posicionamento do post</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{result.idea || "Nenhuma ideia gerada."}</div>
              </div>
            )}
            {tab === "artText" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TAKT.coralLight }}><Pen size={15} style={{ color: TAKT.coral }} /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 3 — Copywriter</p><p className="text-xs text-gray-400">Headline, subheadline e CTA para a arte</p></div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-48 flex items-center justify-center p-8" style={{ background: `linear-gradient(135deg, ${TAKT.dark} 0%, #1a2020 100%)` }}>
                    <div className="text-center max-w-sm">
                      <p className="text-white font-black text-lg leading-tight">{result.headline || "—"}</p>
                      <p className="text-gray-300 text-xs mt-2 leading-relaxed">{result.sub || "—"}</p>
                      <div className="mt-4 inline-block text-xs font-bold px-4 py-2 rounded-full text-white" style={{ backgroundColor: TAKT.coral }}>{result.cta || "—"}</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 space-y-3">
                    {[{ label: "Headline", val: result.headline }, { label: "Subheadline", val: result.sub }, { label: "CTA", val: result.cta }].map(({ label, val }) => (
                      <div key={label} className="flex gap-3"><span className="text-xs font-black w-24 flex-shrink-0 pt-0.5" style={{ color: TAKT.coral }}>{label}</span><span className="text-sm text-gray-700">{val || "—"}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === "caption" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TAKT.coralLight }}><MessageSquare size={15} style={{ color: TAKT.coral }} /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 3 — Legenda completa</p><p className="text-xs text-gray-400">Para {result.platform || "redes sociais"}</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4"><pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result.caption || "Nenhuma legenda gerada."}</pre></div>
                {result.caption && <div className="mt-2 flex items-center gap-3 text-xs text-gray-400"><span>{result.caption.length} caracteres</span><span className="font-semibold text-green-600">✓ Dentro do limite</span></div>}
              </div>
            )}
            {tab === "visual" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-pink-50"><Palette size={15} className="text-pink-600" /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 4 — Diretor de Arte</p><p className="text-xs text-gray-400">Briefing visual + geração de imagem com DALL-E 3</p></div>
                </div>

                {/* Briefing textual */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-5">{result.visual || "Nenhum briefing visual gerado."}</div>

                {/* Seção de geração de imagem */}
                <div className="rounded-2xl border-2 p-5" style={{ borderColor: TAKT.coralBorder, backgroundColor: TAKT.coralLight }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold" style={{ color: TAKT.dark }}>Gerar imagem com DALL-E 3</p>
                      <p className="text-xs text-gray-500 mt-0.5">A IA cria uma imagem baseada no briefing visual acima</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: TAKT.coralDark }}>
                      <span className="font-semibold">Custo estimado:</span>
                      <span className="font-black">{imageQuality === "hd" ? "~R$ 0,44" : "~R$ 0,22"} / imagem</span>
                    </div>
                  </div>

                  {/* Opções de qualidade */}
                  <div className="flex gap-2 mb-4">
                    {[
                      { id: "standard", label: "Padrão", desc: "~R$ 0,22 — ótimo para rascunhos", icon: "⚡" },
                      { id: "hd", label: "HD", desc: "~R$ 0,44 — melhor qualidade", icon: "✨" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setImageQuality(opt.id)}
                        className="flex-1 p-3 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: imageQuality === opt.id ? TAKT.coral : TAKT.coralBorder,
                          backgroundColor: imageQuality === opt.id ? "white" : "transparent",
                        }}
                      >
                        <p className="text-xs font-bold text-gray-800">{opt.icon} {opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Botão gerar */}
                  {!generatedImage && (
                    <button
                      onClick={handleGenerateImage}
                      disabled={generatingImage}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ backgroundColor: generatingImage ? "#d1d5db" : TAKT.coral, cursor: generatingImage ? "not-allowed" : "pointer" }}
                    >
                      {generatingImage ? (
                        <>
                          <span className="flex gap-1">{[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
                          Gerando imagem com DALL-E 3...
                        </>
                      ) : (
                        <><Image size={16} /> Gerar imagem com IA</>
                      )}
                    </button>
                  )}

                  {/* Erro */}
                  {imageError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-600">{imageError}</p>
                    </div>
                  )}

                  {/* Imagem gerada */}
                  {generatedImage && (
                    <div className="mt-2">
                      <div className="relative rounded-2xl overflow-hidden border-2 mb-3" style={{ borderColor: TAKT.coralBorder }}>
                        <img src={generatedImage} alt="Imagem gerada por IA" className="w-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <a
                            href={generatedImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                          >
                            ↓ Baixar
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setGeneratedImage(null); handleGenerateImage(); }}
                          className="flex-1 border-2 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:bg-white"
                          style={{ borderColor: TAKT.coralBorder, color: TAKT.coralDark }}
                        >
                          <RefreshCw size={13} /> Gerar outra versão
                        </button>
                        <a
                          href={generatedImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90"
                          style={{ backgroundColor: TAKT.coral }}
                        >
                          <Image size={13} /> Abrir em tamanho cheio
                        </a>
                      </div>
                      {/* Countdown de expiração */}
                      {timeLeft !== null && (
                        <div className="mt-3 flex items-center justify-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: `${countdownColor()}11`, borderColor: `${countdownColor()}33` }}>
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: countdownColor() }} />
                          {timeLeft > 0 ? (
                            <p className="text-xs font-bold" style={{ color: countdownColor() }}>
                              Link expira em{" "}
                              <span className="font-black text-sm tabular-nums">{formatCountdown(timeLeft)}</span>
                              {timeLeft < 300 && " — baixe agora!"}
                              {timeLeft >= 300 && timeLeft < 900 && " — baixe em breve"}
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-red-600">
                              ⚠️ Link expirado — gere uma nova imagem
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {tab === "checklist" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-50"><CheckSquare size={15} className="text-green-600" /></div>
                  <div><p className="text-sm font-bold text-gray-900">IA 5 — Revisor</p><p className="text-xs text-gray-400">Verificação de qualidade do conteúdo</p></div>
                </div>
                <div className="space-y-2.5">
                  {(result.checklist || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Check size={12} className="text-white" /></div>
                      <span className="text-sm text-green-800 font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
                {result.checklist?.length > 0 && (
                  <div className="mt-5 p-4 rounded-xl text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, #22c55e, #16a34a)` }}>
                    <div><p className="font-bold text-sm">✓ Aprovado pelo Revisor</p><p className="text-green-100 text-xs mt-0.5">Todos os critérios verificados com sucesso.</p></div>
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
// CLIENTS PAGE — com indicador de completude do perfil
// ════════════════════════════════════════════════════════════════
function ClientsPage({ setPage, clients, setClients, showToast, setPreSelectedClient, pendingCount }) {
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = async (form) => {
    if (editClient) {
      await supabase.from('clients').update({ name: form.name, segment: form.segment, tone: form.tone, content_type: form.contentType, instagram: form.instagram, notes: form.notes, color: form.color }).eq('id', editClient.id);
      setClients(prev => prev.map(c => c.id === editClient.id ? { ...editClient, ...form, contentType: form.contentType } : c));
      showToast("Cliente atualizado!");
    } else {
      const { data } = await supabase.from('clients').insert({ name: form.name, segment: form.segment, tone: form.tone, content_type: form.contentType, instagram: form.instagram, notes: form.notes, color: form.color }).select().single();
      if (data) setClients(prev => [{ ...data, contentType: data.content_type }, ...prev]);
      showToast("Cliente cadastrado!");
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

  const completenessLabel = (pct) => {
    if (pct === 100) return { label: "Perfil completo", color: "#10b981", bg: "#f0fdf4" };
    if (pct >= 60) return { label: "Perfil parcial", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "Perfil incompleto", color: TAKT.coral, bg: TAKT.coralLight };
  };

  return (
    <div className="flex flex-col h-full">
      {(showModal || editClient) && <ClientModal client={editClient} onSave={handleSave} onClose={() => { setShowModal(false); setEditClient(null); }} />}
      <Header title="Clientes" sub="Perfis de marca e configurações por cliente" pendingCount={pendingCount}
        action={<button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: TAKT.coral }}><Plus size={15} /> Novo cliente</button>}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${TAKT.coralLight}, ${TAKT.cyanLight})` }}>
              <Users size={28} style={{ color: TAKT.slate }} />
            </div>
            <p className="text-gray-900 font-black text-xl mb-2">Nenhum cliente cadastrado</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">Cadastre seus clientes para que a IA use o perfil de cada um e gere conteúdo personalizado.</p>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: TAKT.coral }}>
              <Plus size={16} /> Cadastrar primeiro cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {clients.map(client => {
              const pct = clientCompleteness(client);
              const { label: complLabel, color: complColor, bg: complBg } = completenessLabel(pct);
              return (
                <div key={client.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                  {/* Barra de completude no topo */}
                  <div className="h-1 bg-gray-100">
                    <div className="h-1 transition-all" style={{ width: `${pct}%`, backgroundColor: complColor }} />
                  </div>
                  {/* Header do card */}
                  <div className="h-20 flex items-center px-5 gap-3" style={{ background: `linear-gradient(135deg, ${client.color}18, ${client.color}08)` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0" style={{ backgroundColor: client.color }}>
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold truncate">{client.name}</p>
                      <p className="text-gray-500 text-xs truncate">{client.segment || "Sem segmento"}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: complBg, color: complColor }}>
                      {pct}%
                    </span>
                  </div>
                  {/* Corpo */}
                  <div className="p-5 space-y-2.5">
                    {client.tone && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Tom de voz</p>
                        <p className="text-sm text-gray-700 truncate">{client.tone}</p>
                      </div>
                    )}
                    {client.contentType && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Conteúdo preferido</p>
                        <p className="text-sm text-gray-700 truncate">{client.contentType}</p>
                      </div>
                    )}
                    {client.instagram && (
                      <div className="flex items-center gap-1.5"><Globe size={11} className="text-gray-400" /><span className="text-xs text-gray-500">{client.instagram}</span></div>
                    )}
                    {/* Status do perfil */}
                    <div className="pt-1">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: complBg, color: complColor }}>
                        {complLabel}
                      </span>
                    </div>
                  </div>
                  {/* Ações */}
                  <div className="px-5 pb-5 flex gap-2">
                    <button onClick={() => { setPreSelectedClient(client.name); setPage("create"); }} className="flex-1 text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all" style={{ backgroundColor: TAKT.coral }}>
                      Criar post
                    </button>
                    <button onClick={() => setEditClient(client)} className="px-3 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl text-xs font-semibold transition-all">
                      Editar
                    </button>
                    <button onClick={() => setDeleteConfirm(client.id)} className="px-3 border border-red-100 text-red-400 hover:bg-red-50 py-2 rounded-xl text-xs transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {deleteConfirm === client.id && (
                    <div className="mx-5 mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs text-red-700 font-semibold mb-2">Remover {client.name}?</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(client.id)} className="flex-1 bg-red-500 text-white py-1.5 rounded-xl text-xs font-bold">Sim, remover</button>
                        <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-xl text-xs">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Card "Adicionar" */}
            <div onClick={() => setShowModal(true)} className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-gray-300 transition-all group min-h-64">
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-all">
                <Plus size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold text-sm">Adicionar cliente</p>
              <p className="text-gray-400 text-xs mt-1 text-center">Configure perfil, tom de voz e identidade visual</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HISTORY PAGE — filtros por status
// ════════════════════════════════════════════════════════════════
function HistoryPage({ setPage, history, setResult, updateHistory, pendingCount }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = history.filter(h => {
    const matchSearch = h.client.toLowerCase().includes(search.toLowerCase()) || (h.theme || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Histórico de posts" sub="Todos os conteúdos gerados pela equipe" pendingCount={pendingCount} />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" placeholder="Buscar por cliente ou tema..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-white focus:outline-none">
            <option value="all">Todos os status</option>
            <option value="Em revisão">Em revisão</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Em produção">Em produção</option>
            <option value="Publicado">Publicado</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: TAKT.cyanLight }}>
              <History size={20} style={{ color: TAKT.cyan }} />
            </div>
            <p className="text-gray-500 font-semibold">Nenhum post encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Os posts gerados aparecem aqui</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Data", "Cliente", "Tema", "Tipo", "Canal", "Status", "Ações"].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3.5 bg-gray-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{item.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: TAKT.coral, fontSize: "9px", fontWeight: 800 }}>
                          {item.client.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{item.client}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600"><span className="truncate block max-w-40">{item.theme}</span></td>
                    <td className="px-5 py-3.5"><span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{item.type || "—"}</span></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{item.platform || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 w-fit ${getStatusStyle(item.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusDot(item.status) }} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.headline && (
                          <button onClick={() => { setResult(item); setPage("result"); }} className="text-xs font-bold hover:underline" style={{ color: TAKT.cyan }}>
                            Abrir
                          </button>
                        )}
                        {item.status === "Em revisão" && (
                          <button onClick={() => updateHistory(item)} className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1">
                            <Check size={11} /> Aprovar
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
  const [agentMap, setAgentMap] = useState({ 1: "Claude", 2: "Claude", 3: "GPT-4", 4: "Gemini Pro", 5: "Claude" });

  const toggleAI = (id) => { if (id === "make") return; setAiConfig(prev => prev.map(ai => ai.id === id ? { ...ai, active: !ai.active } : ai)); };

  return (
    <div className="flex flex-col h-full">
      <Header title="Configurações de IA" sub="Gerencie quais IAs atuam em cada etapa do fluxo" pendingCount={pendingCount} />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${TAKT.cyanLight}, white)`, border: `1px solid ${TAKT.cyanBorder}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: TAKT.cyan }}>
            <Check size={17} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">3 IAs conectadas e funcionando</p>
            <p className="text-xs mt-0.5 text-gray-500">Claude, GPT-4 e Gemini estão ativos. Gere um post para ver em ação.</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {aiConfig.map((ai) => (
            <div key={ai.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-5 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">{ai.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-gray-900 font-bold text-sm">{ai.name}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${ai.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>{ai.active ? "Ativo" : "Inativo"}</span>
                </div>
                <p className="text-xs font-semibold mb-1" style={{ color: TAKT.cyan }}>Função: {ai.role}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{ai.desc}</p>
              </div>
              <button onClick={() => toggleAI(ai.id)} className="relative w-11 h-6 rounded-full transition-all flex-shrink-0" style={{ backgroundColor: ai.active ? TAKT.cyan : "#d1d5db", cursor: ai.id === "make" ? "not-allowed" : "pointer", opacity: ai.id === "make" ? 0.5 : 1 }}>
                <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: ai.active ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-1">Mapeamento por etapa</h3>
          <p className="text-gray-400 text-xs mb-5">Configure qual IA executa cada função do pipeline.</p>
          <div className="space-y-3">
            {AI_AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: agent.bg, border: `1px solid ${agent.border}` }}>
                  <agent.icon size={14} style={{ color: agent.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">IA {agent.id}: {agent.name}</p>
                  <p className="text-xs text-gray-400 truncate">{agent.desc}</p>
                </div>
                <select value={agentMap[agent.id]} onChange={e => setAgentMap(prev => ({ ...prev, [agent.id]: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none">
                  {["Claude", "GPT-4", "Gemini Pro"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => showToast("Configurações salvas!")} className="mt-4 w-full text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: TAKT.coral }}>
            <Save size={14} /> Salvar configurações
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-1">Chaves de API</h3>
          <p className="text-gray-400 text-xs mb-4">Armazenadas com segurança no Vercel.</p>
          <div className="space-y-3">
            {[
              { name: "ANTHROPIC_API_KEY", label: "Claude (Anthropic)" },
              { name: "OPENAI_API_KEY", label: "OpenAI (GPT-4)" },
              { name: "GEMINI_API_KEY", label: "Google (Gemini)" },
            ].map(k => (
              <div key={k.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div><p className="text-sm font-semibold text-gray-700">{k.label}</p><p className="text-xs text-gray-400 font-mono">{k.name}</p></div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-green-50 text-green-700">✓ Configurada</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LIBRARY PAGE — Biblioteca criativa
// ════════════════════════════════════════════════════════════════
function LibraryPage({ clients, setPage, references, addReference, deleteReference, pendingCount }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  const filtered = selectedClient === "all" ? references : references.filter(r => r.client_name === selectedClient);
  const clientColor = (name) => clients.find(c => c.name === name)?.color || TAKT.coral;

  return (
    <div className="flex flex-col h-full">
      {showModal && <ReferenceModal clients={clients} onSave={async (form) => { await addReference(form); setShowModal(false); }} onClose={() => setShowModal(false)} />}
      <Header title="Biblioteca criativa" sub="Referências visuais organizadas por cliente" pendingCount={pendingCount}
        action={<button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: TAKT.coral }}><Upload size={15} /> Enviar referência</button>}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {clients.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <button onClick={() => setSelectedClient("all")} className="px-3 py-1.5 rounded-full text-xs font-bold transition-all" style={{ backgroundColor: selectedClient === "all" ? TAKT.dark : "#f3f4f6", color: selectedClient === "all" ? "white" : "#6b7280" }}>
              Todos ({references.length})
            </button>
            {clients.map(c => {
              const count = references.filter(r => r.client_name === c.name).length;
              return (
                <button key={c.id} onClick={() => setSelectedClient(c.name)} className="px-3 py-1.5 rounded-full text-xs font-bold transition-all" style={{ backgroundColor: selectedClient === c.name ? c.color : "#f3f4f6", color: selectedClient === c.name ? "white" : "#6b7280" }}>
                  {c.name}{count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${TAKT.coralLight}, ${TAKT.cyanLight})` }}>
              <BookOpen size={28} style={{ color: TAKT.slate }} />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-2">{selectedClient === "all" ? "Nenhuma referência ainda" : `Sem referências para ${selectedClient}`}</p>
            <p className="text-gray-400 text-sm mb-5 max-w-sm">Adicione imagens e posts de referência para usar como inspiração ao gerar conteúdo.</p>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{ backgroundColor: TAKT.coral }}>
              <Upload size={15} /> Adicionar referência
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(ref => (
              <div key={ref.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {imgErrors[ref.id] ? (
                    <div className="flex flex-col items-center justify-center w-full h-full p-4">
                      <Link size={24} className="text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 mb-2 text-center">Pré-visualização indisponível</p>
                      <a href={ref.image_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline" style={{ color: TAKT.coral }}>Abrir link ↗</a>
                    </div>
                  ) : (
                    <img src={ref.image_url} alt={ref.title || "Referência"} className="w-full h-full object-cover" onError={() => setImgErrors(prev => ({ ...prev, [ref.id]: true }))} />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: clientColor(ref.client_name) }}>{ref.client_name}</span>
                    <button onClick={() => setDeleteConfirm(ref.id)} className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                  {ref.title && <p className="text-sm font-bold text-gray-800 mb-1">{ref.title}</p>}
                  {ref.notes && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ref.notes}</p>}
                  <p className="text-xs text-gray-300 mt-2">{ref.created_at ? new Date(ref.created_at).toLocaleDateString('pt-BR') : ""}</p>
                  {deleteConfirm === ref.id && (
                    <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-xs text-red-700 font-bold mb-2">Remover referência?</p>
                      <div className="flex gap-2">
                        <button onClick={() => { deleteReference(ref.id); setDeleteConfirm(null); }} className="flex-1 bg-red-500 text-white py-1 rounded-xl text-xs font-bold">Sim</button>
                        <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-1 rounded-xl text-xs">Não</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div onClick={() => setShowModal(true)} className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-gray-300 transition-all group min-h-48">
              <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-all">
                <Plus size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-bold text-sm">Adicionar referência</p>
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
  const pendingCount = history.filter(h => h.status === "Em revisão").length;

  const handleSetPage = (p) => {
    if (p !== "create") setPreSelectedClient("");
    setPage(p);
  };

  // Abre resultado a partir do dashboard (window._openResult hack simples)
  useEffect(() => {
    if (page === "result" && window._openResult) {
      setResult(window._openResult);
      window._openResult = null;
    }
  }, [page]);

  // ── Carrega dados ──
  useEffect(() => {
    const loadData = async () => {
      const [{ data: clientsData }, { data: postsData }, { data: refsData }] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('referencias').select('*').order('created_at', { ascending: false }),
      ]);
      if (clientsData) setClients(clientsData.map(c => ({ ...c, contentType: c.content_type })));
      if (postsData) setHistory(postsData.map(p => ({
        id: p.id, client: p.client_name, theme: p.theme, type: p.type,
        platform: p.platform, goal: p.goal, status: p.status,
        date: new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        analysis: p.analysis, idea: p.idea, headline: p.headline,
        sub: p.sub, cta: p.cta, caption: p.caption, visual: p.visual, checklist: p.checklist,
      })));
      if (refsData) setReferences(refsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // ── Salva post ──
  const addHistory = async (item) => {
    const { data } = await supabase.from('posts').insert({
      client_name: item.client, theme: item.theme, type: item.type, platform: item.platform,
      goal: item.goal, status: item.status, analysis: item.analysis, idea: item.idea,
      headline: item.headline, sub: item.sub, cta: item.cta, caption: item.caption,
      visual: item.visual, checklist: item.checklist,
    }).select().single();
    if (data) {
      setHistory(prev => [{
        id: data.id, client: data.client_name, theme: data.theme, type: data.type,
        platform: data.platform, goal: data.goal, status: data.status,
        date: new Date(data.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        analysis: data.analysis, idea: data.idea, headline: data.headline, sub: data.sub,
        cta: data.cta, caption: data.caption, visual: data.visual, checklist: data.checklist,
      }, ...prev]);
      return data.id;
    }
    return null;
  };

  // ── Aprova post pelo ID correto ──
  const updateHistory = async (targetResult) => {
    if (!targetResult?.id) return;
    await supabase.from('posts').update({ status: 'Aprovado' }).eq('id', targetResult.id);
    setHistory(prev => prev.map(h => h.id === targetResult.id ? { ...h, status: 'Aprovado' } : h));
    showToast("Post aprovado com sucesso!");
  };

  // ── Referências ──
  const addReference = async (form) => {
    const { data } = await supabase.from('referencias').insert(form).select().single();
    if (data) { setReferences(prev => [data, ...prev]); showToast("Referência adicionada!"); }
  };
  const deleteReference = async (id) => {
    await supabase.from('referencias').delete().eq('id', id);
    setReferences(prev => prev.filter(r => r.id !== id));
    showToast("Referência removida.");
  };

  const renderPage = () => {
    const props = { setPage: handleSetPage, pendingCount };
    switch (page) {
      case "dashboard": return <Dashboard {...props} clients={clients} history={history} setPreSelectedClient={setPreSelectedClient} />;
      case "create":    return <CreatePost {...props} setResult={setResult} clients={clients} addHistory={addHistory} preSelectedClient={preSelectedClient} />;
      case "result":    return <ResultPage {...props} result={result} updateHistory={updateHistory} setPreSelectedClient={setPreSelectedClient} />;
      case "clients":   return <ClientsPage {...props} clients={clients} setClients={setClients} showToast={showToast} setPreSelectedClient={setPreSelectedClient} />;
      case "library":   return <LibraryPage {...props} clients={clients} references={references} addReference={addReference} deleteReference={deleteReference} />;
      case "history":   return <HistoryPage {...props} history={history} setResult={setResult} updateHistory={updateHistory} />;
      case "settings":  return <SettingsPage showToast={showToast} pendingCount={pendingCount} />;
      default:          return <Dashboard {...props} clients={clients} history={history} setPreSelectedClient={setPreSelectedClient} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: TAKT.dark }}>
        <div className="text-center">
          <TaktLogoIcon size={52} />
          <p className="mt-4 font-black text-xl" style={{ background: `linear-gradient(90deg, ${TAKT.cyan}, ${TAKT.coral})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>takt digital</p>
          <p className="text-sm mt-1" style={{ color: TAKT.slateMid }}>Carregando seu copilot...</p>
          <div className="mt-5 flex gap-1.5 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: i % 2 === 0 ? TAKT.cyan : TAKT.coral, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <Sidebar page={page} setPage={handleSetPage} />
      <main className="flex-1 flex flex-col overflow-hidden">{renderPage()}</main>
    </div>
  );
}
