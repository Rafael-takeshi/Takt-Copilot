import { useState, useEffect, useRef } from "react";
import { supabase } from './supabase';
import {
  LayoutDashboard, Plus, Users, BookOpen, Settings,
  Eye, Target, CheckSquare, Upload, FileText,
  Check, Sparkles, Palette, Star,
  RefreshCw, AlertCircle, X, Menu,
  History, Pen, Save, Trash2,
  Image, Layers, Zap, Copy, Download,
  ChevronRight, ArrowRight, Bell, TrendingUp, BarChart2,
  LogOut, Link, Globe
} from "lucide-react";

// ═══════════════════════════════════════════════
// DESIGN SYSTEM — dark mode Figma/Vercel
// ═══════════════════════════════════════════════
const D = {
  bg:       "#080808",
  surface:  "#111111",
  elevated: "#1A1A1A",
  card:     "#161616",
  hover:    "#1E1E1E",
  border:   "rgba(255,255,255,0.07)",
  borderMd: "rgba(255,255,255,0.11)",
  borderHi: "rgba(255,255,255,0.18)",
  text:     "#EFEFEF",
  textSub:  "#888888",
  textMute: "#444444",
  coral:    "#FF6B55",
  coralDim: "rgba(255,107,85,0.12)",
  coralBrd: "rgba(255,107,85,0.25)",
  cyan:     "#00D8D8",
  cyanDim:  "rgba(0,216,216,0.10)",
  cyanBrd:  "rgba(0,216,216,0.25)",
  green:    "#22C55E",
  greenDim: "rgba(34,197,94,0.10)",
  amber:    "#F59E0B",
  amberDim: "rgba(245,158,11,0.10)",
  red:      "#EF4444",
  redDim:   "rgba(239,68,68,0.10)",
  purple:   "#A78BFA",
  purpleDim:"rgba(167,139,250,0.10)",
};

// Injetar estilos globais
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${D.bg}; color: ${D.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  input, textarea, select { background: ${D.elevated}; color: ${D.text}; border: 1px solid ${D.border}; border-radius: 10px; font-size: 14px; outline: none; font-family: inherit; transition: border-color 0.15s; }
  input:focus, textarea:focus, select:focus { border-color: ${D.borderHi}; }
  select option { background: ${D.elevated}; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .fade-in { animation: fadeIn 0.2s ease; }
  .spin { animation: spin 0.8s linear infinite; }
  .pulse { animation: pulse 1.5s ease-in-out infinite; }
  .skeleton { background: linear-gradient(90deg, ${D.elevated} 25%, ${D.hover} 50%, ${D.elevated} 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
  @media (max-width: 768px) { .desktop-only { display: none !important; } }
  @media (min-width: 769px) { .mobile-only { display: none !important; } }
`;

// ═══════════════════════════════════════════════
// HELPERS DE STATUS
// ═══════════════════════════════════════════════
const STATUS_MAP = {
  "Gerado com IA":  { color: D.cyan,   dim: D.cyanDim   },
  "Em revisão":     { color: D.amber,  dim: D.amberDim  },
  "Aprovado":       { color: D.green,  dim: D.greenDim  },
  "Em produção":    { color: D.purple, dim: D.purpleDim },
  "Publicado":      { color: "#10b981",dim: "rgba(16,185,129,0.10)" },
  "Reprovado":      { color: D.red,    dim: D.redDim    },
};
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { color: D.textSub, dim: "rgba(255,255,255,0.05)" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600,
      padding:"3px 8px", borderRadius:20, backgroundColor:s.dim, color:s.color, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", backgroundColor:s.color, display:"inline-block" }} />
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════
// AGENTS CONFIG
// ═══════════════════════════════════════════════
const AGENTS = [
  { id:1, name:"Analista Visual",  icon:Eye,         tool:"Claude",  color:"#A78BFA", dim:"rgba(167,139,250,0.12)" },
  { id:2, name:"Estrategista",     icon:Target,      tool:"Claude",  color:"#60A5FA", dim:"rgba(96,165,250,0.12)"  },
  { id:3, name:"Copywriter",       icon:Pen,         tool:"GPT-4",   color:D.coral,   dim:D.coralDim               },
  { id:4, name:"Dir. de Arte",     icon:Palette,     tool:"Gemini",  color:"#F472B6", dim:"rgba(244,114,182,0.12)" },
  { id:5, name:"Revisor",          icon:CheckSquare, tool:"Claude",  color:D.green,   dim:D.greenDim               },
];

const AI_MODELS = [
  { id:"claude", name:"Claude (Anthropic)", role:"Análise · Estratégia · Revisão",  logo:"🤖", active:true },
  { id:"gpt",    name:"GPT-4 + Image-2",    role:"Copywriting · Geração de imagem", logo:"💬", active:true },
  { id:"gemini", name:"Gemini Pro (Google)",role:"Apoio multimodal",                logo:"✨", active:true },
];

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", zIndex:999,
      backgroundColor:D.elevated, border:`1px solid ${D.borderMd}`, color:D.text,
      padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:500,
      display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      animation:"fadeIn 0.2s ease", whiteSpace:"nowrap" }}>
      <Check size={14} color={D.green} />
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════
// LOGO
// ═══════════════════════════════════════════════
function TaktLogo({ size = 28 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.28, backgroundColor:D.elevated,
      border:`1px solid ${D.borderMd}`, display:"flex", flexDirection:"column",
      alignItems:"flex-start", justifyContent:"center", padding:"0 5px", gap:"2.5px", flexShrink:0 }}>
      <div style={{ width:14, height:2.5, borderRadius:2, backgroundColor:D.cyan }} />
      <div style={{ width:10, height:2.5, borderRadius:2, backgroundColor:D.cyan }} />
      <div style={{ width:7,  height:2.5, borderRadius:2, backgroundColor:D.coral }} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// SIDEBAR — desktop
// ═══════════════════════════════════════════════
const NAV = [
  { id:"dashboard", label:"Dashboard",       icon:LayoutDashboard },
  { id:"create",    label:"Novo post com IA", icon:Sparkles        },
  { id:"clients",   label:"Clientes",         icon:Users           },
  { id:"library",   label:"Biblioteca",       icon:BookOpen        },
  { id:"history",   label:"Histórico",        icon:History         },
  { id:"settings",  label:"Config. IA",       icon:Settings        },
];

function Sidebar({ page, setPage, pendingCount }) {
  return (
    <div className="desktop-only" style={{ width:220, flexShrink:0, backgroundColor:D.surface,
      borderRight:`1px solid ${D.border}`, display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0, overflowY:"auto" }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px 16px", borderBottom:`1px solid ${D.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <TaktLogo size={30} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:D.text, lineHeight:1.2 }}>takt digital</p>
            <p style={{ fontSize:10, color:D.textSub, fontWeight:500 }}>Copilot IA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"10px 8px" }}>
        {NAV.map(n => {
          const active = page === n.id;
          const isCreate = n.id === "create";
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px",
                borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight: active ? 600 : 400,
                backgroundColor: isCreate ? D.coralDim : active ? D.hover : "transparent",
                color: isCreate ? D.coral : active ? D.text : D.textSub,
                transition:"all 0.15s", marginBottom:2, position:"relative",
                ...(active && !isCreate ? { borderLeft:`2px solid ${D.coral}`, paddingLeft:8 } : {}) }}>
              {active && !isCreate && <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%",
                width:2, borderRadius:2, backgroundColor:D.coral }} />}
              <n.icon size={15} />
              <span style={{ flex:1, textAlign:"left" }}>{n.label}</span>
              {n.id === "history" && pendingCount > 0 && (
                <span style={{ fontSize:9, fontWeight:700, backgroundColor:D.coral, color:"white",
                  borderRadius:10, padding:"1px 5px", minWidth:16, textAlign:"center" }}>
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${D.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", backgroundColor:D.coral,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, color:"white", flexShrink:0 }}>SM</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:D.text, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Social Media</p>
            <p style={{ fontSize:10, color:D.textSub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>takt.com.br</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MOBILE BOTTOM NAV
// ═══════════════════════════════════════════════
function MobileNav({ page, setPage, pendingCount }) {
  const items = [
    { id:"dashboard", icon:LayoutDashboard, label:"Home"      },
    { id:"create",    icon:Sparkles,        label:"Criar"     },
    { id:"clients",   icon:Users,           label:"Clientes"  },
    { id:"history",   icon:History,         label:"Histórico" },
    { id:"settings",  icon:Settings,        label:"Config"    },
  ];
  return (
    <div className="mobile-only" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      backgroundColor:D.surface, borderTop:`1px solid ${D.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom)" }}>
      {items.map(item => {
        const active = page === item.id;
        const isCreate = item.id === "create";
        return (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:3, padding:"8px 4px",
              border:"none", cursor:"pointer", backgroundColor:"transparent",
              color: isCreate ? D.coral : active ? D.text : D.textSub,
              fontSize:10, fontWeight: active ? 600 : 400, position:"relative" }}>
            {isCreate ? (
              <div style={{ width:36, height:36, borderRadius:10, backgroundColor:D.coral,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:1 }}>
                <item.icon size={18} color="white" />
              </div>
            ) : (
              <item.icon size={20} />
            )}
            {!isCreate && <span>{item.label}</span>}
            {item.id === "history" && pendingCount > 0 && (
              <span style={{ position:"absolute", top:6, right:"calc(50% - 12px)",
                fontSize:8, backgroundColor:D.coral, color:"white",
                borderRadius:8, padding:"1px 4px", fontWeight:700 }}>{pendingCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
// PAGE HEADER
// ═══════════════════════════════════════════════
function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"20px 24px 16px", borderBottom:`1px solid ${D.border}`, flexShrink:0 }}>
      <div>
        <h1 style={{ fontSize:17, fontWeight:700, color:D.text, lineHeight:1.2 }}>{title}</h1>
        {sub && <p style={{ fontSize:12, color:D.textSub, marginTop:2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════
// BUTTON COMPONENTS
// ═══════════════════════════════════════════════
function BtnPrimary({ children, onClick, disabled, style={}, size="md" }) {
  const pad = size === "sm" ? "7px 14px" : "10px 18px";
  const fs  = size === "sm" ? 12 : 14;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:pad, borderRadius:9,
        border:"none", cursor: disabled ? "not-allowed" : "pointer", fontSize:fs, fontWeight:600,
        backgroundColor: disabled ? D.elevated : D.coral, color: disabled ? D.textSub : "white",
        transition:"opacity 0.15s", opacity: disabled ? 0.6 : 1, ...style }}>
      {children}
    </button>
  );
}

function BtnSecondary({ children, onClick, style={}, size="md" }) {
  const pad = size === "sm" ? "7px 14px" : "10px 18px";
  const fs  = size === "sm" ? 12 : 14;
  return (
    <button onClick={onClick}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:pad, borderRadius:9,
        border:`1px solid ${D.borderMd}`, cursor:"pointer", fontSize:fs, fontWeight:500,
        backgroundColor:"transparent", color:D.textSub, transition:"all 0.15s", ...style }}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════
function Input({ label, value, onChange, placeholder, type="text", style={} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:D.textSub }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ padding:"9px 12px", width:"100%", ...style }} />
    </div>
  );
}

function Select({ label, value, onChange, children, style={} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:D.textSub }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:"9px 12px", width:"100%", ...style }}>
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows=3, style={} }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:500, color:D.textSub }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ padding:"9px 12px", resize:"vertical", width:"100%", ...style }} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════
function Card({ children, style={} }) {
  return (
    <div style={{ backgroundColor:D.card, border:`1px solid ${D.border}`,
      borderRadius:12, ...style }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
function Dashboard({ history, clients, setPage, setPreSelectedClient, pendingCount }) {
  const published  = history.filter(h => h.status === "Publicado").length;
  const inProd     = history.filter(h => h.status === "Em produção").length;
  const recent     = history.slice(0, 6);

  const metrics = [
    { label:"Posts gerados",   value: history.length,  color: D.cyan,   icon: Sparkles    },
    { label:"Em revisão",      value: pendingCount,     color: D.amber,  icon: AlertCircle },
    { label:"Publicados",      value: published,        color: D.green,  icon: Globe       },
    { label:"Clientes ativos", value: clients.length,   color: D.coral,  icon: Users       },
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Dashboard" sub="Visão geral da produção" />

      <div style={{ padding:"20px 24px" }}>
        {/* Metrics */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:24 }}>
          {metrics.map(m => (
            <Card key={m.label} style={{ padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ width:32, height:32, borderRadius:8,
                  backgroundColor:`${m.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <m.icon size={15} color={m.color} />
                </div>
              </div>
              <p style={{ fontSize:24, fontWeight:700, color:D.text, lineHeight:1 }}>{m.value}</p>
              <p style={{ fontSize:11, color:D.textSub, marginTop:4 }}>{m.label}</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card style={{ padding:"20px 24px", marginBottom:24, background:`linear-gradient(135deg, ${D.coralDim}, ${D.cyanDim})`,
          border:`1px solid ${D.coralBrd}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:D.text, marginBottom:4 }}>
                Transforme briefings em posts prontos
              </p>
              <p style={{ fontSize:12, color:D.textSub }}>5 agentes IA trabalhando em sequência para o seu cliente</p>
            </div>
            <BtnPrimary onClick={() => setPage("create")}>
              <Sparkles size={14} /> Novo post com IA
            </BtnPrimary>
          </div>
        </Card>

        {/* Clientes rápidos */}
        {clients.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:12, fontWeight:600, color:D.textSub, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>
              Criar post rápido
            </p>
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
              {clients.slice(0,5).map(c => (
                <button key={c.id} onClick={() => { setPreSelectedClient(c.name); setPage("create"); }}
                  style={{ flexShrink:0, display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
                    backgroundColor:D.elevated, border:`1px solid ${D.border}`, borderRadius:8,
                    cursor:"pointer", color:D.text, fontSize:12, fontWeight:500,
                    transition:"border-color 0.15s" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", backgroundColor:D.coral,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:700, color:"white", flexShrink:0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  {c.name.length > 16 ? c.name.substring(0,16)+"…" : c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts recentes */}
        {recent.length > 0 && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ fontSize:12, fontWeight:600, color:D.textSub, textTransform:"uppercase", letterSpacing:1 }}>
                Posts recentes
              </p>
              <button onClick={() => setPage("history")}
                style={{ fontSize:11, color:D.textSub, background:"none", border:"none", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:4 }}>
                Ver todos <ChevronRight size={12} />
              </button>
            </div>
            <Card>
              {recent.map((h, i) => (
                <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                  borderBottom: i < recent.length-1 ? `1px solid ${D.border}` : "none" }}>
                  <div style={{ width:32, height:32, borderRadius:8, backgroundColor:D.elevated,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Sparkles size={13} color={D.coral} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:D.text, overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.theme}</p>
                    <p style={{ fontSize:11, color:D.textSub }}>{h.client} · {h.platform}</p>
                  </div>
                  <StatusBadge status={h.status} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {history.length === 0 && (
          <Card style={{ padding:40, textAlign:"center" }}>
            <Sparkles size={28} color={D.textMute} style={{ margin:"0 auto 12px" }} />
            <p style={{ fontSize:14, fontWeight:600, color:D.text, marginBottom:6 }}>Nenhum post ainda</p>
            <p style={{ fontSize:12, color:D.textSub, marginBottom:16 }}>Crie seu primeiro post com IA</p>
            <BtnPrimary onClick={() => setPage("create")}>Começar agora</BtnPrimary>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CREATE POST
// ═══════════════════════════════════════════════
function CreatePost({ setPage, setResult, clients, addHistory, preSelectedClient, pendingCount }) {
  const [form, setForm]       = useState({ client: preSelectedClient||"", type:"", platform:"", theme:"", goal:"", audience:"", notes:"" });
  const [file, setFile]       = useState(null);
  const [fileBase64, setBase64]     = useState(null);
  const [fileMime, setMime]   = useState(null);
  const [generating, setGen]  = useState(false);
  const [step, setStep]       = useState(0);
  const [error, setError]     = useState(null);

  const selected = clients.find(c => c.name === form.client);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!["image/png","image/jpeg","image/webp","image/gif"].includes(f.type)) { setError("Formato inválido. Use PNG, JPG ou WEBP."); return; }
    if (f.size > 5*1024*1024) { setError("Imagem muito grande. Máximo 5MB."); return; }
    setFile(f); setMime(f.type); setError(null);
    const r = new FileReader();
    r.onload = ev => setBase64(ev.target.result.split(",")[1]);
    r.readAsDataURL(f);
  };

  const handleGenerate = async () => {
    if (!form.client || !form.theme) { setError("Selecione o cliente e preencha o tema."); return; }
    setError(null); setGen(true); setStep(0);
    const interval = setInterval(() => setStep(p => { if (p >= 4) { clearInterval(interval); return 5; } return p+1; }), 1000);
    try {
      const clientProfile = selected
        ? `Tom: ${selected.tone||"—"}. Segmento: ${selected.segment||"—"}. Tipos: ${selected.contentType||"—"}. ${selected.notes||""}`
        : "";
      const res = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, clientProfile,
          ...(fileBase64 ? { referenceImage:fileBase64, referenceImageType:fileMime } : {}) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        const msg = err.error || "Erro na API";
        const det = err.details ? `\n${err.details}` : "";
        throw new Error(msg+det);
      }
      const data = await res.json();
      const merged = { ...data, client:form.client, type:form.type||"Post único", platform:form.platform||"Instagram",
        goal:form.goal||"Engajamento", theme:form.theme, status:"Em revisão" };
      setTimeout(async () => {
        const id = await addHistory(merged);
        setResult({ ...merged, id }); setPage("result");
      }, 5500);
    } catch (err) {
      clearInterval(interval); setGen(false); setError(err.message);
    }
  };

  // Tela de carregamento
  if (generating) {
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:32, backgroundColor:D.bg }}>
        <div style={{ width:"100%", maxWidth:460 }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:52, height:52, borderRadius:14,
              background:`linear-gradient(135deg, ${D.coral}, ${D.cyan})`,
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <Sparkles size={22} color="white" />
            </div>
            <h2 style={{ fontSize:17, fontWeight:700, color:D.text }}>
              Gerando para <span style={{ color:D.coral }}>{form.client}</span>
            </h2>
            <p style={{ fontSize:12, color:D.textSub, marginTop:5 }}>
              5 agentes IA trabalhando em sequência
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {AGENTS.map((a,i) => {
              const done   = step > i;
              const active = step === i;
              return (
                <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                  borderRadius:10, border:`1px solid ${done?"rgba(34,197,94,0.2)":active?a.dim.replace("0.12","0.3"):D.border}`,
                  backgroundColor: done?"rgba(34,197,94,0.05)":active?a.dim:D.card,
                  transition:"all 0.3s" }}>
                  <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    backgroundColor: done?D.greenDim:active?a.dim:D.elevated }}>
                    {done
                      ? <Check size={16} color={D.green} />
                      : active
                        ? <div className="spin"><a.icon size={16} color={a.color} /></div>
                        : <a.icon size={16} color={D.textMute} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600,
                      color:done?D.green:active?a.color:D.textMute }}>{a.name}</p>
                    <p style={{ fontSize:11, color:D.textSub }}>{a.tool}</p>
                  </div>
                  {done && <Check size={14} color={D.green} />}
                  {active && (
                    <div style={{ display:"flex", gap:3 }}>
                      {[0,1,2].map(d=>(
                        <div key={d} className="pulse" style={{ width:5, height:5, borderRadius:"50%",
                          backgroundColor:a.color, animationDelay:`${d*0.2}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Novo post com IA" sub="Preencha o briefing e a IA cria o conteúdo completo" />
      <div style={{ padding:"20px 24px", maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr minmax(0,280px)", gap:16 }}>
          {/* Coluna principal */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Erro */}
            {error && (
              <div style={{ padding:"10px 14px", borderRadius:9, backgroundColor:D.redDim,
                border:`1px solid rgba(239,68,68,0.25)`, fontSize:13, color:"#FCA5A5",
                display:"flex", gap:8, alignItems:"flex-start" }}>
                <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Briefing */}
            <Card>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${D.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, backgroundColor:D.coralDim,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:D.coral }}>1</div>
                  <p style={{ fontSize:13, fontWeight:600, color:D.text }}>Briefing do post</p>
                </div>
              </div>
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
                {/* Cliente */}
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:D.textSub, display:"block", marginBottom:5 }}>
                    Cliente <span style={{ color:D.coral }}>*</span>
                  </label>
                  <select value={form.client} onChange={e=>setForm({...form,client:e.target.value})}
                    style={{ padding:"9px 12px", width:"100%" }}>
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                {/* Perfil carregado */}
                {selected && (
                  <div style={{ padding:"10px 12px", borderRadius:8,
                    backgroundColor:D.coralDim, border:`1px solid ${D.coralBrd}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", backgroundColor:D.coral,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:700, color:"white", flexShrink:0 }}>
                        {selected.name.charAt(0)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:D.coral }}>
                          Perfil de {selected.name} carregado
                        </p>
                        <p style={{ fontSize:11, color:D.textSub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {selected.tone && `Tom: ${selected.tone}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Linha tipo + plataforma */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Select label="Tipo de conteúdo" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    <option value="">Post único</option>
                    {["Carrossel","Reels","Story","Post único"].map(o=><option key={o}>{o}</option>)}
                  </Select>
                  <Select label="Plataforma" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
                    <option value="">Instagram</option>
                    {["Instagram","LinkedIn","Facebook","TikTok"].map(o=><option key={o}>{o}</option>)}
                  </Select>
                </div>

                {/* Linha objetivo + público */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Select label="Objetivo" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}>
                    <option value="">Engajamento</option>
                    {["Engajamento","Venda","Educação","Captação de lead","Branding"].map(o=><option key={o}>{o}</option>)}
                  </Select>
                  <Input label="Público-alvo" value={form.audience}
                    onChange={e=>setForm({...form,audience:e.target.value})}
                    placeholder="Ex: Empreendedores 25–40" />
                </div>

                {/* Tema */}
                <Input label={<>Tema do conteúdo <span style={{ color:D.coral }}>*</span></>}
                  value={form.theme} onChange={e=>setForm({...form,theme:e.target.value})}
                  placeholder="Ex: Lançamento da coleção verão 2026..." />

                {/* Observações */}
                <Textarea label="Observações extras" value={form.notes}
                  onChange={e=>setForm({...form,notes:e.target.value})}
                  placeholder="Detalhes, tom específico, referências..." rows={2} />
              </div>
            </Card>

            {/* Pipeline de agentes */}
            <Card>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${D.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, backgroundColor:D.cyanDim,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:D.cyan }}>2</div>
                  <p style={{ fontSize:13, fontWeight:600, color:D.text }}>Pipeline de agentes IA</p>
                </div>
              </div>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", gap:0, position:"relative" }}>
                  <div style={{ position:"absolute", top:18, left:18, right:18, height:1,
                    backgroundColor:D.border, zIndex:0 }} />
                  {AGENTS.map((a,i) => (
                    <div key={a.id} style={{ flex:1, display:"flex", flexDirection:"column",
                      alignItems:"center", position:"relative", zIndex:1 }}>
                      <div style={{ width:36, height:36, borderRadius:9,
                        backgroundColor:a.dim, border:`1px solid ${a.dim.replace("0.12","0.25")}`,
                        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                        <a.icon size={15} color={a.color} />
                      </div>
                      <p style={{ fontSize:9, fontWeight:700, color:a.color, marginBottom:1 }}>0{i+1}</p>
                      <p style={{ fontSize:10, fontWeight:600, color:D.textSub, textAlign:"center", lineHeight:1.3,
                        maxWidth:60, overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</p>
                      <span style={{ fontSize:9, padding:"2px 5px", borderRadius:4, marginTop:4,
                        backgroundColor:a.dim, color:a.color, fontWeight:600 }}>{a.tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Botão gerar */}
            <button onClick={handleGenerate}
              style={{ width:"100%", padding:"13px", borderRadius:10, border:"none",
                background:`linear-gradient(135deg, ${D.coral}, #FF4D35)`,
                color:"white", fontSize:14, fontWeight:700, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow:`0 4px 20px rgba(255,107,85,0.35)`, transition:"opacity 0.15s" }}>
              <Sparkles size={16} />
              Gerar conteúdo com IA
            </button>
          </div>

          {/* Coluna lateral */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Upload */}
            <Card>
              <div style={{ padding:"12px 14px", borderBottom:`1px solid ${D.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:22, height:22, borderRadius:6, backgroundColor:"rgba(167,139,250,0.12)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#A78BFA" }}>3</div>
                  <p style={{ fontSize:12, fontWeight:600, color:D.text }}>Referência visual</p>
                  <span style={{ fontSize:10, color:D.textSub, marginLeft:"auto" }}>Opcional</span>
                </div>
              </div>
              <div style={{ padding:"12px 14px" }}>
                <label style={{ display:"block", cursor:"pointer" }}>
                  <div style={{ border:`1px dashed ${file?D.coralBrd:D.border}`, borderRadius:9,
                    padding:"16px 12px", textAlign:"center", transition:"all 0.15s",
                    backgroundColor: file ? D.coralDim : "transparent" }}>
                    {file ? (
                      <>
                        <div style={{ width:32, height:32, borderRadius:8, backgroundColor:D.coralDim,
                          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                          <Check size={16} color={D.coral} />
                        </div>
                        <p style={{ fontSize:12, fontWeight:600, color:D.coral }}>Imagem carregada</p>
                        <p style={{ fontSize:10, color:D.textSub, marginTop:3,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                        {fileBase64 && (
                          <p style={{ fontSize:10, color:"#A78BFA", marginTop:4, fontWeight:600 }}>
                            ✦ Claude Vision vai analisar
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <Upload size={20} color={D.textMute} style={{ margin:"0 auto 8px" }} />
                        <p style={{ fontSize:12, color:D.textSub, fontWeight:500 }}>Clique para enviar</p>
                        <p style={{ fontSize:10, color:D.textMute, marginTop:3 }}>PNG, JPG, WEBP · 5MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile}
                    style={{ display:"none" }} />
                </label>
                {file && (
                  <button onClick={()=>{setFile(null);setBase64(null);setMime(null);}}
                    style={{ width:"100%", marginTop:6, fontSize:11, color:D.textSub,
                      background:"none", border:"none", cursor:"pointer", padding:"4px" }}>
                    Remover imagem
                  </button>
                )}
              </div>
            </Card>

            {/* Dicas */}
            <Card style={{ padding:"12px 14px" }}>
              <p style={{ fontSize:11, fontWeight:600, color:D.textSub, marginBottom:8,
                display:"flex", alignItems:"center", gap:5 }}>
                <Star size={11} color={D.amber} /> Dicas
              </p>
              {[
                "Perfil 100% completo = resultado melhor",
                "Tema detalhado = copy mais certeiro",
                "Suba uma referência para a IA analisar cores e estilo",
              ].map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ width:14, height:14, borderRadius:"50%", backgroundColor:D.coralDim,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <Check size={8} color={D.coral} />
                  </div>
                  <p style={{ fontSize:11, color:D.textSub, lineHeight:1.4 }}>{t}</p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// RESULT PAGE
// ═══════════════════════════════════════════════
function ResultPage({ result, setPage, updateHistory, showToast, pendingCount }) {
  const [tab, setTab]               = useState("analysis");
  const [approved, setApproved]     = useState(result.status === "Aprovado");
  const [genImg, setGenImg]         = useState(null);
  const [genImgLoading, setImgLoad] = useState(false);
  const [imgErr, setImgErr]         = useState(null);
  const [imgQuality, setImgQuality] = useState("standard");
  const [expiresAt, setExpiresAt]   = useState(null);
  const [timeLeft, setTimeLeft]     = useState(null);
  const [copied, setCopied]         = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      const r = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(r);
      if (r === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const fmt = s => { const m=Math.floor(s/60).toString().padStart(2,"0"); const sc=(s%60).toString().padStart(2,"0"); return `${m}:${sc}`; };
  const timerColor = !timeLeft ? D.textSub : timeLeft<300 ? D.red : timeLeft<900 ? D.amber : D.green;

  const handleGenImg = async () => {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) { setImgErr("VITE_OPENAI_API_KEY não configurada no Vercel."); return; }
    setImgLoad(true); setImgErr(null); setGenImg(null);
    try {
      const briefing = result.visual?.length > 3000 ? result.visual.substring(0,3000) : result.visual;
      const prompt = `Social media post for "${result.client}" on ${result.platform}. Visual: ${briefing}. Professional, clean, modern. No text overlay, no watermark.`;
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
        body: JSON.stringify({ model:"gpt-image-2", prompt, n:1, size:"1024x1024",
          quality: imgQuality==="hd"?"high":"medium", response_format:"b64_json" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message||"Erro ao gerar imagem");
      const item = data.data?.[0];
      const url = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
      if (!url) throw new Error("Resposta inesperada da OpenAI");
      setGenImg(url); setExpiresAt(Date.now()+60*60*1000); setTimeLeft(3600);
    } catch(e) { setImgErr(e.message); }
    finally { setImgLoad(false); }
  };

  const copyText = (text, id) => {
    navigator.clipboard?.writeText(text).then(()=>{ setCopied(id); setTimeout(()=>setCopied(null),1500); });
  };

  const TABS = [
    { id:"analysis", label:"Análise",    content: result.analysis },
    { id:"idea",     label:"Estratégia", content: result.idea     },
    { id:"copy",     label:"Arte",       content: result.headline ? `Headline: ${result.headline}\n\nSub: ${result.sub||""}\n\nCTA: ${result.cta||""}` : "" },
    { id:"caption",  label:"Legenda",    content: result.caption  },
    { id:"visual",   label:"Dir. Visual",content: result.visual   },
    { id:"check",    label:"Checklist",  content: null            },
    { id:"image",    label:"Imagem IA",  content: null            },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Topbar */}
      <div style={{ padding:"12px 20px", borderBottom:`1px solid ${D.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", flex:1, minWidth:0 }}>
          {[result.client, result.type, result.platform, result.goal].filter(Boolean).map((v,i)=>(
            <span key={i} style={{ fontSize:11, color:D.textSub, display:"flex", alignItems:"center", gap:4 }}>
              {i>0 && <span style={{ color:D.textMute }}>·</span>}
              {i===0 ? <span style={{ color:D.text, fontWeight:600 }}>{v}</span> : v}
            </span>
          ))}
          {result.theme && <span style={{ fontSize:11, color:D.textSub }}>· {result.theme}</span>}
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <BtnSecondary onClick={()=>setPage("create")} size="sm">
            <RefreshCw size={12} /> Gerar novamente
          </BtnSecondary>
          {!approved ? (
            <BtnPrimary size="sm" onClick={()=>{ updateHistory(result); setApproved(true); }}>
              <Check size={12} /> Aprovar
            </BtnPrimary>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:D.green,
              padding:"6px 12px", borderRadius:8, backgroundColor:D.greenDim }}>
              <Check size={12} /> Aprovado
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:`1px solid ${D.border}`,
        overflowX:"auto", flexShrink:0, padding:"0 20px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"10px 14px", fontSize:12, fontWeight: tab===t.id ? 600 : 400,
              color: tab===t.id ? D.text : D.textSub, border:"none", cursor:"pointer",
              backgroundColor:"transparent", borderBottom: tab===t.id ? `2px solid ${D.coral}` : "2px solid transparent",
              whiteSpace:"nowrap", transition:"all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px", paddingBottom:80 }}>

        {/* Copy text tabs */}
        {TABS.slice(0,5).map(t => tab===t.id && t.content && (
          <div key={t.id} className="fade-in">
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
              <BtnSecondary size="sm" onClick={()=>copyText(t.content,t.id)}>
                {copied===t.id ? <><Check size={12} color={D.green}/> Copiado</> : <><Copy size={12}/> Copiar</>}
              </BtnSecondary>
            </div>
            <Card style={{ padding:"16px" }}>
              <p style={{ fontSize:13, color:D.text, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{t.content}</p>
            </Card>
          </div>
        ))}

        {/* Checklist */}
        {tab==="check" && (
          <div className="fade-in">
            <Card>
              {(result.checklist||[]).map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px",
                  borderBottom: i<(result.checklist.length-1)?`1px solid ${D.border}`:"none" }}>
                  <div style={{ width:20, height:20, borderRadius:6, backgroundColor:D.greenDim,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Check size={11} color={D.green} />
                  </div>
                  <p style={{ fontSize:13, color:D.text }}>{item}</p>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Image generation */}
        {tab==="image" && (
          <div className="fade-in" style={{ maxWidth:480 }}>
            <Card style={{ padding:"16px", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <p style={{ fontSize:13, fontWeight:600, color:D.text }}>Gerar imagem com IA</p>
                <span style={{ fontSize:11, color:D.textSub }}>
                  {imgQuality==="hd" ? "~R$ 0,44 / imagem" : "~R$ 0,22 / imagem"}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {["standard","hd"].map(q=>(
                  <button key={q} onClick={()=>setImgQuality(q)}
                    style={{ padding:"10px", borderRadius:9, border:`1px solid ${imgQuality===q?D.coralBrd:D.border}`,
                      backgroundColor: imgQuality===q ? D.coralDim : D.elevated,
                      cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                    <p style={{ fontSize:12, fontWeight:600, color: imgQuality===q ? D.coral : D.text }}>
                      {q==="standard" ? "⚡ Padrão" : "✨ HD"}
                    </p>
                    <p style={{ fontSize:10, color:D.textSub, marginTop:2 }}>
                      {q==="standard" ? "~R$ 0,22 — rascunho" : "~R$ 0,44 — qualidade máxima"}
                    </p>
                  </button>
                ))}
              </div>
              {!genImg && (
                <button onClick={handleGenImg} disabled={genImgLoading}
                  style={{ width:"100%", padding:"11px", borderRadius:9, border:"none",
                    background: genImgLoading ? D.elevated : `linear-gradient(135deg,${D.coral},#FF4D35)`,
                    color: genImgLoading ? D.textSub : "white",
                    fontSize:13, fontWeight:600, cursor: genImgLoading?"not-allowed":"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {genImgLoading ? <><div className="spin"><RefreshCw size={14}/></div> Gerando imagem...</> : <><Image size={14}/> Gerar imagem com IA</>}
                </button>
              )}
              {imgErr && (
                <p style={{ fontSize:12, color:D.red, marginTop:8, padding:"8px 10px",
                  backgroundColor:D.redDim, borderRadius:8 }}>{imgErr}</p>
              )}
            </Card>

            {genImg && (
              <div className="fade-in">
                <Card style={{ overflow:"hidden" }}>
                  <img src={genImg} alt="Gerada por IA" style={{ width:"100%", display:"block" }} />
                  <div style={{ padding:"12px 14px" }}>
                    {timeLeft !== null && timeLeft > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10,
                        padding:"7px 10px", borderRadius:8,
                        backgroundColor:`${timerColor}10`, border:`1px solid ${timerColor}25` }}>
                        <div className="pulse" style={{ width:6, height:6, borderRadius:"50%", backgroundColor:timerColor }} />
                        <p style={{ fontSize:11, color:timerColor, fontWeight:600 }}>
                          Link expira em <strong>{fmt(timeLeft)}</strong>
                          {timeLeft < 300 ? " — baixe agora!" : ""}
                        </p>
                      </div>
                    )}
                    {timeLeft === 0 && (
                      <p style={{ fontSize:11, color:D.red, marginBottom:10 }}>⚠️ Link expirado — gere uma nova imagem</p>
                    )}
                    <div style={{ display:"flex", gap:8 }}>
                      <a href={genImg} download target="_blank" rel="noopener noreferrer"
                        style={{ flex:1, padding:"9px", borderRadius:9, backgroundColor:D.coral, color:"white",
                          fontSize:12, fontWeight:600, textDecoration:"none",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        <Download size={13} /> Baixar
                      </a>
                      <BtnSecondary size="sm" onClick={()=>{setGenImg(null);handleGenImg();}}
                        style={{ flex:1, justifyContent:"center" }}>
                        <RefreshCw size={12} /> Nova versão
                      </BtnSecondary>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CLIENTS PAGE
// ═══════════════════════════════════════════════
function ClientsPage({ clients, addClient, updateClient, deleteClient, setPage, setPreSelectedClient, pendingCount }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ name:"", segment:"", tone:"", contentType:"", instagram:"", notes:"" });
  const [confirmDel, setConfirmDel] = useState(null);

  const completeness = c => {
    const f = [c.name,c.segment,c.tone,c.contentType,c.instagram,c.notes];
    return Math.round((f.filter(v=>v&&String(v).trim()).length/f.length)*100);
  };

  const openNew = () => { setForm({name:"",segment:"",tone:"",contentType:"",instagram:"",notes:""}); setEditing(null); setShowForm(true); };
  const openEdit = c => { setForm({name:c.name,segment:c.segment||"",tone:c.tone||"",contentType:c.contentType||"",instagram:c.instagram||"",notes:c.notes||""}); setEditing(c.id); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editing) await updateClient(editing, form);
    else await addClient(form);
    setShowForm(false);
  };

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Clientes" sub={`${clients.length} cliente${clients.length!==1?"s":""} cadastrado${clients.length!==1?"s":""}`}
        action={<BtnPrimary size="sm" onClick={openNew}><Plus size={13}/> Novo cliente</BtnPrimary>} />

      {/* Form */}
      {showForm && (
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${D.border}`, backgroundColor:D.surface }}>
          <p style={{ fontSize:13, fontWeight:600, color:D.text, marginBottom:14 }}>
            {editing ? "Editar cliente" : "Novo cliente"}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:10 }}>
            <Input label="Nome *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Takt Digital" />
            <Input label="Segmento" value={form.segment} onChange={e=>setForm({...form,segment:e.target.value})} placeholder="Marketing Digital" />
            <Input label="Tom de voz" value={form.tone} onChange={e=>setForm({...form,tone:e.target.value})} placeholder="Descontraído, jovem" />
            <Input label="Tipos de conteúdo" value={form.contentType} onChange={e=>setForm({...form,contentType:e.target.value})} placeholder="Carrossel, Reels" />
            <Input label="Instagram" value={form.instagram} onChange={e=>setForm({...form,instagram:e.target.value})} placeholder="@taktdigital" />
          </div>
          <Textarea label="Briefing / Observações" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Briefing de marca, público, objetivos..." rows={2} style={{ marginBottom:10 }} />
          <div style={{ display:"flex", gap:8 }}>
            <BtnPrimary onClick={save}><Save size={13}/> Salvar</BtnPrimary>
            <BtnSecondary onClick={()=>setShowForm(false)}>Cancelar</BtnSecondary>
          </div>
        </div>
      )}

      <div style={{ padding:"20px 24px" }}>
        {clients.length === 0 ? (
          <Card style={{ padding:40, textAlign:"center" }}>
            <Users size={28} color={D.textMute} style={{ margin:"0 auto 12px" }} />
            <p style={{ fontSize:14, fontWeight:600, color:D.text, marginBottom:6 }}>Nenhum cliente ainda</p>
            <p style={{ fontSize:12, color:D.textSub, marginBottom:16 }}>Cadastre clientes para a IA usar o perfil de marca</p>
            <BtnPrimary onClick={openNew}><Plus size={13}/> Cadastrar cliente</BtnPrimary>
          </Card>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {clients.map(c => {
              const pct = completeness(c);
              return (
                <Card key={c.id} style={{ padding:"16px" }}>
                  {confirmDel===c.id ? (
                    <div style={{ padding:"10px", textAlign:"center" }}>
                      <p style={{ fontSize:13, color:D.text, marginBottom:10 }}>Remover {c.name}?</p>
                      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                        <BtnPrimary size="sm" onClick={()=>{deleteClient(c.id);setConfirmDel(null);}}
                          style={{ backgroundColor:D.red }}>Sim</BtnPrimary>
                        <BtnSecondary size="sm" onClick={()=>setConfirmDel(null)}>Não</BtnSecondary>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", backgroundColor:D.coral,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:14, fontWeight:700, color:"white", flexShrink:0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:D.text, overflow:"hidden",
                            textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</p>
                          {c.segment && <p style={{ fontSize:11, color:D.textSub }}>{c.segment}</p>}
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color: pct===100?D.green:pct>=50?D.amber:D.textSub,
                          padding:"2px 7px", borderRadius:8,
                          backgroundColor: pct===100?D.greenDim:pct>=50?D.amberDim:"rgba(255,255,255,0.05)" }}>
                          {pct}%
                        </span>
                      </div>
                      {c.tone && (
                        <p style={{ fontSize:11, color:D.textSub, marginBottom:12,
                          overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box",
                          WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                          {c.tone}
                        </p>
                      )}
                      <div style={{ display:"flex", gap:6 }}>
                        <BtnPrimary size="sm" style={{ flex:1, justifyContent:"center" }}
                          onClick={()=>{setPreSelectedClient(c.name);setPage("create");}}>
                          <Sparkles size={11}/> Criar post
                        </BtnPrimary>
                        <BtnSecondary size="sm" onClick={()=>openEdit(c)}><FileText size={11}/></BtnSecondary>
                        <BtnSecondary size="sm" onClick={()=>setConfirmDel(c.id)}><Trash2 size={11}/></BtnSecondary>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// LIBRARY PAGE
// ═══════════════════════════════════════════════
function LibraryPage({ references, clients, addReference, deleteReference, pendingCount }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");
  const [form, setForm]         = useState({ client:"", url:"", type:"Imagem", notes:"" });
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = filter==="all" ? references : references.filter(r=>r.client===filter);

  const save = async () => {
    if (!form.url.trim() || !form.client) return;
    await addReference(form);
    setForm({client:"",url:"",type:"Imagem",notes:""});
    setShowForm(false);
  };

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Biblioteca criativa"
        sub="Referências visuais organizadas por cliente"
        action={<BtnPrimary size="sm" onClick={()=>setShowForm(s=>!s)}><Upload size={13}/> Adicionar</BtnPrimary>} />

      {showForm && (
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${D.border}`, backgroundColor:D.surface }}>
          <p style={{ fontSize:13, fontWeight:600, color:D.text, marginBottom:12 }}>Nova referência</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, marginBottom:10 }}>
            <Select label="Cliente *" value={form.client} onChange={e=>setForm({...form,client:e.target.value})}>
              <option value="">Selecione...</option>
              {clients.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
            <Input label="URL da imagem *" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..." />
            <Select label="Tipo" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {["Imagem","Post","Story","Carrossel","Referência"].map(t=><option key={t}>{t}</option>)}
            </Select>
          </div>
          <Textarea label="Notas" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} placeholder="Por que essa referência é interessante?" style={{ marginBottom:10 }} />
          <div style={{ display:"flex", gap:8 }}>
            <BtnPrimary onClick={save}><Save size={13}/> Salvar</BtnPrimary>
            <BtnSecondary onClick={()=>setShowForm(false)}>Cancelar</BtnSecondary>
          </div>
        </div>
      )}

      <div style={{ padding:"16px 24px" }}>
        {/* Filtros */}
        {clients.length > 0 && (
          <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
            {["all",...clients.map(c=>c.name)].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${filter===f?D.coralBrd:D.border}`,
                  backgroundColor: filter===f ? D.coralDim : "transparent",
                  color: filter===f ? D.coral : D.textSub,
                  fontSize:12, fontWeight: filter===f ? 600 : 400, cursor:"pointer",
                  whiteSpace:"nowrap", flexShrink:0 }}>
                {f==="all" ? "Todos" : f}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <Card style={{ padding:40, textAlign:"center" }}>
            <BookOpen size={28} color={D.textMute} style={{ margin:"0 auto 12px" }} />
            <p style={{ fontSize:14, fontWeight:600, color:D.text, marginBottom:6 }}>Nenhuma referência</p>
            <p style={{ fontSize:12, color:D.textSub, marginBottom:16 }}>Adicione imagens e posts para usar como inspiração</p>
            <BtnPrimary onClick={()=>setShowForm(true)}><Upload size={13}/> Adicionar referência</BtnPrimary>
          </Card>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
            {filtered.map(r => (
              <Card key={r.id} style={{ overflow:"hidden" }}>
                {r.url && (
                  <div style={{ height:130, overflow:"hidden", backgroundColor:D.elevated }}>
                    <img src={r.url} alt={r.type} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                      onError={e=>{e.target.style.display="none";}} />
                  </div>
                )}
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:10, fontWeight:600, color:D.textSub }}>{r.type}</span>
                    <span style={{ fontSize:10, color:D.textMute }}>{r.client}</span>
                  </div>
                  {r.notes && <p style={{ fontSize:11, color:D.textSub, lineHeight:1.4,
                    overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box",
                    WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:8 }}>{r.notes}</p>}
                  {confirmDel===r.id ? (
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>{deleteReference(r.id);setConfirmDel(null);}}
                        style={{ flex:1, padding:"5px", borderRadius:7, border:"none",
                          backgroundColor:D.red, color:"white", fontSize:11, cursor:"pointer", fontWeight:600 }}>Sim</button>
                      <button onClick={()=>setConfirmDel(null)}
                        style={{ flex:1, padding:"5px", borderRadius:7, border:`1px solid ${D.border}`,
                          backgroundColor:"transparent", color:D.textSub, fontSize:11, cursor:"pointer" }}>Não</button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:6 }}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{ flex:1, padding:"5px", borderRadius:7, border:`1px solid ${D.border}`,
                          color:D.textSub, fontSize:11, textDecoration:"none",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                        <Link size={10}/> Abrir
                      </a>
                      <button onClick={()=>setConfirmDel(r.id)}
                        style={{ padding:"5px 8px", borderRadius:7, border:`1px solid ${D.border}`,
                          backgroundColor:"transparent", color:D.textSub, cursor:"pointer" }}>
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            <div onClick={()=>setShowForm(true)}
              style={{ minHeight:160, border:`1px dashed ${D.border}`, borderRadius:12,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                cursor:"pointer", gap:6, color:D.textSub, transition:"border-color 0.15s" }}>
              <Plus size={20} color={D.textMute} />
              <p style={{ fontSize:12 }}>Adicionar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// HISTORY PAGE
// ═══════════════════════════════════════════════
function HistoryPage({ history, setResult, setPage, pendingCount }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = history.filter(h => {
    const q = search.toLowerCase();
    const match = !q || h.client.toLowerCase().includes(q) || h.theme.toLowerCase().includes(q);
    const statusOk = filterStatus==="all" || h.status===filterStatus;
    return match && statusOk;
  });

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Histórico de posts"
        sub={`${history.length} post${history.length!==1?"s":""} gerado${history.length!==1?"s":""}`} />

      {/* Filtros */}
      <div style={{ padding:"12px 24px", borderBottom:`1px solid ${D.border}`, display:"flex", gap:8, flexWrap:"wrap" }}>
        <input placeholder="Buscar por cliente ou tema..." value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ padding:"7px 12px", flex:1, minWidth:160, fontSize:12 }} />
        <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
          {["all",...Object.keys(STATUS_MAP)].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)}
              style={{ padding:"6px 11px", borderRadius:20, border:`1px solid ${filterStatus===s?D.coralBrd:D.border}`,
                backgroundColor: filterStatus===s ? D.coralDim : "transparent",
                color: filterStatus===s ? D.coral : D.textSub,
                fontSize:11, fontWeight: filterStatus===s?600:400, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
              {s==="all"?"Todos":s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 24px" }}>
        {filtered.length === 0 ? (
          <Card style={{ padding:40, textAlign:"center" }}>
            <History size={28} color={D.textMute} style={{ margin:"0 auto 12px" }} />
            <p style={{ fontSize:14, fontWeight:600, color:D.text, marginBottom:6 }}>
              {search||filterStatus!=="all" ? "Nenhum resultado" : "Nenhum post ainda"}
            </p>
            <p style={{ fontSize:12, color:D.textSub }}>
              {search||filterStatus!=="all" ? "Tente outro filtro" : "Gere seu primeiro post com IA"}
            </p>
          </Card>
        ) : (
          <Card>
            {filtered.map((h,i) => (
              <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                borderBottom: i<filtered.length-1?`1px solid ${D.border}`:"none" }}>
                <div style={{ width:34, height:34, borderRadius:8, backgroundColor:D.elevated,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Sparkles size={14} color={D.coral} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:D.text, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.theme}</p>
                  <p style={{ fontSize:11, color:D.textSub }}>
                    {h.client} · {h.type||"Post único"} · {h.platform||"Instagram"}
                    {h.date && ` · ${h.date}`}
                  </p>
                </div>
                <StatusBadge status={h.status} />
                <BtnSecondary size="sm" onClick={()=>{ setResult(h); setPage("result"); }}>
                  Abrir
                </BtnSecondary>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════
function SettingsPage({ aiConfig, setAiConfig, pendingCount }) {
  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <PageHeader title="Configurações de IA" sub="Gerencie os modelos conectados ao Copilot" />
      <div style={{ padding:"20px 24px", maxWidth:600 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {aiConfig.map(ai => (
            <Card key={ai.id} style={{ padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, backgroundColor:D.elevated,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {ai.logo}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:D.text }}>{ai.name}</p>
                    <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                      <div style={{ width:34, height:18, borderRadius:9,
                        backgroundColor: ai.active ? D.green : D.elevated,
                        border:`1px solid ${ai.active?D.green:D.border}`,
                        position:"relative", transition:"all 0.2s", cursor:"pointer" }}
                        onClick={()=>setAiConfig(prev=>prev.map(a=>a.id===ai.id?{...a,active:!a.active}:a))}>
                        <div style={{ width:12, height:12, borderRadius:"50%", backgroundColor:"white",
                          position:"absolute", top:2, transition:"left 0.2s",
                          left: ai.active ? 18 : 2 }} />
                      </div>
                    </label>
                  </div>
                  <p style={{ fontSize:11, color:D.textSub, marginBottom:4 }}>{ai.role}</p>
                  <p style={{ fontSize:11, color:D.textMute }}>{ai.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop:24, padding:"14px 16px", borderRadius:10,
          backgroundColor:D.cyanDim, border:`1px solid ${D.cyanBrd}` }}>
          <p style={{ fontSize:12, fontWeight:600, color:D.cyan, marginBottom:4 }}>
            Variáveis de ambiente necessárias
          </p>
          {["ANTHROPIC_API_KEY","VITE_OPENAI_API_KEY","VITE_SUPABASE_URL","VITE_SUPABASE_ANON_KEY"].map(k=>(
            <div key={k} style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", backgroundColor:D.green }} />
              <code style={{ fontSize:11, color:D.textSub, fontFamily:"monospace" }}>{k}</code>
            </div>
          ))}
          <p style={{ fontSize:11, color:D.textSub, marginTop:8 }}>
            Configure em Vercel → Settings → Environment Variables
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════
export default function App() {
  const [page, setPage]               = useState("dashboard");
  const [result, setResult]           = useState(null);
  const [clients, setClients]         = useState([]);
  const [history, setHistory]         = useState([]);
  const [references, setReferences]   = useState([]);
  const [preSelected, setPreSelected] = useState("");
  const [toast, setToast]             = useState(null);
  const [aiConfig, setAiConfig]       = useState([
    { id:"claude", name:"Claude (Anthropic)", role:"Análise visual · Estratégia · Revisão", logo:"🤖", active:true, desc:"API conectada via ANTHROPIC_API_KEY no Vercel." },
    { id:"gpt",    name:"GPT-4 + GPT Image-2", role:"Copywriting · Geração de imagem",      logo:"💬", active:true, desc:"Geração de imagem feita direto no browser (sem timeout)." },
    { id:"gemini", name:"Gemini Pro (Google)", role:"Apoio multimodal",                     logo:"✨", active:true, desc:"Suporte para análise de contexto ampliado e referências visuais." },
  ]);

  const showToast = msg => { setToast(msg); };
  const pendingCount = history.filter(h => h.status === "Em revisão").length;

  useEffect(() => {
    (async () => {
      const [{ data: cd }, { data: pd }, { data: rd }] = await Promise.all([
        supabase.from('clients').select('*').order('created_at',{ascending:false}),
        supabase.from('posts').select('*').order('created_at',{ascending:false}),
        supabase.from('referencias').select('*').order('created_at',{ascending:false}),
      ]);
      if (cd) setClients(cd.map(c=>({...c,contentType:c.content_type})));
      if (pd) setHistory(pd.map(p=>({
        id:p.id, client:p.client_name, theme:p.theme, type:p.type,
        platform:p.platform, goal:p.goal, status:p.status,
        date: new Date(p.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}),
        analysis:p.analysis, idea:p.idea, headline:p.headline,
        sub:p.sub, cta:p.cta, caption:p.caption, visual:p.visual, checklist:p.checklist,
      })));
      if (rd) setReferences(rd);
    })();
  }, []);

  const handleSetPage = p => { if (p!=="create") setPreSelected(""); setPage(p); };

  const addHistory = async item => {
    const { data } = await supabase.from('posts').insert({
      client_name:item.client, theme:item.theme, type:item.type,
      platform:item.platform, goal:item.goal, status:item.status,
      analysis:item.analysis, idea:item.idea, headline:item.headline,
      sub:item.sub, cta:item.cta, caption:item.caption,
      visual:item.visual, checklist:item.checklist,
    }).select().single();
    if (data) {
      const entry = { ...item, id:data.id, date:new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) };
      setHistory(prev=>[entry,...prev]);
      return data.id;
    }
    return null;
  };

  const updateHistory = async (r) => {
    if (!r?.id) return;
    await supabase.from('posts').update({status:'Aprovado'}).eq('id',r.id);
    setHistory(prev=>prev.map(h=>h.id===r.id?{...h,status:'Aprovado'}:h));
    showToast("Post aprovado!");
  };

  const addClient = async form => {
    const { data } = await supabase.from('clients').insert({
      name:form.name, segment:form.segment, tone:form.tone,
      content_type:form.contentType, instagram:form.instagram, notes:form.notes,
    }).select().single();
    if (data) { setClients(prev=>[{...data,contentType:data.content_type},...prev]); showToast("Cliente cadastrado!"); }
  };

  const updateClient = async (id, form) => {
    const { data } = await supabase.from('clients').update({
      name:form.name, segment:form.segment, tone:form.tone,
      content_type:form.contentType, instagram:form.instagram, notes:form.notes,
    }).eq('id',id).select().single();
    if (data) { setClients(prev=>prev.map(c=>c.id===id?{...data,contentType:data.content_type}:c)); showToast("Cliente atualizado!"); }
  };

  const deleteClient = async id => {
    await supabase.from('clients').delete().eq('id',id);
    setClients(prev=>prev.filter(c=>c.id!==id));
    showToast("Cliente removido.");
  };

  const addReference = async form => {
    const { data } = await supabase.from('referencias').insert(form).select().single();
    if (data) { setReferences(prev=>[data,...prev]); showToast("Referência adicionada!"); }
  };

  const deleteReference = async id => {
    await supabase.from('referencias').delete().eq('id',id);
    setReferences(prev=>prev.filter(r=>r.id!==id));
    showToast("Referência removida.");
  };

  const commonProps = { pendingCount, showToast };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", backgroundColor:D.bg }}>
        <Sidebar page={page} setPage={handleSetPage} pendingCount={pendingCount} />

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
          {page==="dashboard" && (
            <Dashboard history={history} clients={clients} setPage={handleSetPage}
              setPreSelectedClient={setPreSelected} {...commonProps} />
          )}
          {page==="create" && (
            <CreatePost setPage={handleSetPage} setResult={setResult} clients={clients}
              addHistory={addHistory} preSelectedClient={preSelected} {...commonProps} />
          )}
          {page==="result" && result && (
            <ResultPage result={result} setPage={handleSetPage}
              updateHistory={updateHistory} {...commonProps} />
          )}
          {page==="clients" && (
            <ClientsPage clients={clients} addClient={addClient}
              updateClient={updateClient} deleteClient={deleteClient}
              setPage={handleSetPage} setPreSelectedClient={setPreSelected} {...commonProps} />
          )}
          {page==="library" && (
            <LibraryPage references={references} clients={clients}
              addReference={addReference} deleteReference={deleteReference} {...commonProps} />
          )}
          {page==="history" && (
            <HistoryPage history={history} setResult={setResult}
              setPage={handleSetPage} {...commonProps} />
          )}
          {page==="settings" && (
            <SettingsPage aiConfig={aiConfig} setAiConfig={setAiConfig} {...commonProps} />
          )}
        </div>

        <MobileNav page={page} setPage={handleSetPage} pendingCount={pendingCount} />
        {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}
      </div>
    </>
  );
}
