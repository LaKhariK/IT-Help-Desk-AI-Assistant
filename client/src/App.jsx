import { useState, useEffect, useCallback, useRef } from "react";
import { ticketsApi, aiApi, kbApi } from "./utils/api";
import { C, priorities, statusColors } from "./utils/theme";

// ── Icons ─────────────────────────────────────────────────────────────
function Icon({ name, size = 16, color = "currentColor" }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke={color} strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke={color} strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke={color} strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke={color} strokeWidth="2"/></>,
    ticket: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" fill="none" stroke={color}/>,
    chat: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" fill="none" stroke={color}/>,
    kb: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" fill="none" stroke={color}/>,
    plus: <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none"/>,
    send: <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" fill="none" stroke={color}/>,
    x: <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none"/>,
    robot: <><rect x="3" y="11" width="18" height="10" rx="2" fill="none" stroke={color} strokeWidth="2"/><path d="M12 11V7" stroke={color} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="5" r="2" fill="none" stroke={color} strokeWidth="2"/><path d="M8 15h.01M16 15h.01" stroke={color} strokeWidth="3" strokeLinecap="round"/><path d="M7 11V9a5 5 0 0110 0v2" fill="none" stroke={color} strokeWidth="2"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={color} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={color} strokeWidth="2"/></>,
    sparkle: <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    comment: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{icons[name]}</svg>;
}

// ── Shared styles ─────────────────────────────────────────────────────
const inp = (extra = {}) => ({ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", ...extra });
const btn = (bg = C.accent, extra = {}) => ({ background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, ...extra });

function Badge({ label, color, bg }) {
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>;
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email || !password) return setError("Email and password required.");
    if (tab === "register" && !name) return setError("Full name required.");
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = tab === "login" ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: `0 0 32px ${C.accent}44` }}>
            <Icon name="alert" size={26} color="#fff"/>
          </div>
          <h1 style={{ color: C.textPrimary, margin: "0 0 4px", fontSize: 24, fontWeight: 800 }}>ServiceDesk AI</h1>
          <p style={{ color: C.textSecondary, margin: 0, fontSize: 13 }}>IT Help Desk Portal</p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", background: C.card, borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(null); }} style={{ flex: 1, background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.textSecondary, border: "none", borderRadius: 6, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "#2D1B1B", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: C.red, fontSize: 13 }}>{error}</div>}

          {tab === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>FULL NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inp()}/>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>EMAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" style={inp()}/>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PASSWORD</label>
            <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" type="password" style={inp()}/>
          </div>
          <button onClick={submit} disabled={loading} style={{ ...btn(C.accent, { width: "100%", justifyContent: "center", padding: 13, fontSize: 15, borderRadius: 10, opacity: loading ? 0.7 : 1 }) }}>
            {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "tickets", label: "Incidents", icon: "ticket" },
  { id: "ai", label: "AI Assistant", icon: "chat" },
  { id: "kb", label: "Knowledge Base", icon: "kb" },
];

function Sidebar({ page, setPage, onNewTicket, user, onLogout, onDeleteAccount }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="alert" size={18} color="#fff"/>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textPrimary }}>ServiceDesk</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: 0.8 }}>AI POWERED</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "0 10px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, fontWeight: 600, fontSize: 13, textAlign: "left", background: page === n.id ? `${C.accent}18` : "transparent", color: page === n.id ? C.accent : C.textSecondary }}>
            <Icon name={n.icon} size={16} color={page === n.id ? C.accent : C.textSecondary}/>{n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}` }}>
        <button onClick={onNewTicket} style={{ ...btn(C.accent, { width: "100%", justifyContent: "center", marginBottom: 12 }) }}>
          <Icon name="plus" size={14} color="#fff"/> New Ticket
        </button>

        <div style={{ position: "relative" }}>
          <div onClick={() => setShowMenu(!showMenu)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px", borderRadius: 8, background: showMenu ? `${C.accent}12` : "transparent" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            </div>
          </div>

          {showMenu && (
            <div style={{ position: "absolute", bottom: "110%", left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", zIndex: 100 }}>
              <button onClick={() => { setShowMenu(false); onLogout(); }} style={{ width: "100%", background: "none", border: "none", color: C.textSecondary, padding: "10px 14px", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <Icon name="x" size={14}/> Sign Out
              </button>
              <button onClick={() => { setShowMenu(false); onDeleteAccount(); }} style={{ width: "100%", background: "none", border: "none", color: C.red, padding: "10px 14px", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = "#2D1B1B"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <Icon name="trash" size={14}/> Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────
function Dashboard({ tickets }) {
  const open = tickets.filter(t => t.status === "Open").length;
  const inProg = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;
  const critical = tickets.filter(t => t.priority === "Critical").length;

  const StatCard = ({ label, value, color, sub }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
      <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
      <p style={{ color: C.textSecondary, margin: "0 0 28px", fontSize: 14 }}>Live overview of your IT service desk.</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <StatCard label="Open" value={open} color={C.accent} sub="Awaiting assignment"/>
        <StatCard label="In Progress" value={inProg} color={C.yellow} sub="Being worked on"/>
        <StatCard label="Resolved" value={resolved} color={C.green} sub="Resolved or closed"/>
        <StatCard label="Critical" value={critical} color={C.red} sub="Immediate attention"/>
      </div>
      <h3 style={{ color: C.textSecondary, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>RECENT INCIDENTS</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tickets.slice(0, 6).map(t => {
          const p = priorities[t.priority] || priorities.Medium;
          return (
            <div key={t.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ color: C.accent, fontFamily: "monospace", fontWeight: 700, fontSize: 12, width: 74, flexShrink: 0 }}>{t.id}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{t.category} · {new Date(t.created).toLocaleDateString()}</div>
              </div>
              <Badge label={t.priority} color={p.color} bg={p.bg}/>
              <span style={{ color: statusColors[t.status] || C.textMuted, fontWeight: 700, fontSize: 12 }}>{t.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TICKET LIST ───────────────────────────────────────────────────────
function TicketList({ tickets, onSelect, onNew }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = tickets.filter(t => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: C.textPrimary, margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>All Incidents</h2>
          <p style={{ color: C.textSecondary, margin: 0, fontSize: 14 }}>{filtered.length} tickets</p>
        </div>
        <button onClick={onNew} style={btn(C.accent)}>
          <Icon name="plus" size={15} color="#fff"/> New Ticket
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" style={inp({ flex: 1, minWidth: 200 })}/>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Open", "In Progress", "Resolved", "Closed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? C.accent : C.card, color: statusFilter === s ? "#fff" : C.textSecondary, border: `1px solid ${statusFilter === s ? C.accent : C.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 90px 110px 110px", padding: "10px 18px", borderBottom: `1px solid ${C.border}`, color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
          <span>ID</span><span>TITLE</span><span>CATEGORY</span><span>PRIORITY</span><span>STATUS</span><span>DATE</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted }}>No tickets found.</div>
        ) : filtered.map((t, i) => {
          const p = priorities[t.priority] || priorities.Medium;
          return (
            <div key={t.id} onClick={() => onSelect(t)} style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 90px 110px 110px", padding: "14px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", alignItems: "center" }}
              onMouseEnter={e => e.currentTarget.style.background = C.surface}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ color: C.accent, fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>{t.id}</span>
              <span style={{ color: C.textPrimary, fontSize: 13, fontWeight: 500, paddingRight: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
              <span style={{ color: C.textSecondary, fontSize: 12 }}>{t.category}</span>
              <Badge label={t.priority} color={p.color} bg={p.bg}/>
              <span style={{ color: statusColors[t.status] || C.textMuted, fontWeight: 700, fontSize: 12 }}>{t.status}</span>
              <span style={{ color: C.textMuted, fontSize: 12 }}>{new Date(t.created).toLocaleDateString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NEW TICKET MODAL ──────────────────────────────────────────────────
function NewTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Software", priority: "Medium", reporter: "" });
  const [triage, setTriage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTriage = async () => {
    setAnalyzing(true);
    try {
      const result = await aiApi.triage(form.title, form.description);
      setTriage(result);
      if (result.category) set("category", result.category);
      if (result.priority) set("priority", result.priority);
    } catch { setError("AI triage failed."); }
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Title required.");
    setSubmitting(true);
    try {
      const ticket = await ticketsApi.create({ ...form, aiSummary: triage?.summary || null });
      onCreated(ticket);
      onClose();
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: 560, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ color: C.textPrimary, margin: 0, fontSize: 18, fontWeight: 700 }}>New Incident</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary }}><Icon name="x" size={20}/></button>
        </div>
        {error && <div style={{ background: "#2D1B1B", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: C.red, fontSize: 13 }}>{error}</div>}
        <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>TITLE *</label>
        <input style={inp({ marginBottom: 12 })} placeholder="Brief description" value={form.title} onChange={e => set("title", e.target.value)}/>
        <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>DESCRIPTION</label>
        <textarea style={inp({ height: 90, resize: "vertical", marginBottom: 12 })} placeholder="Details, error messages, steps…" value={form.description} onChange={e => set("description", e.target.value)}/>
        <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>YOUR NAME</label>
        <input style={inp({ marginBottom: 12 })} placeholder="Full name" value={form.reporter} onChange={e => set("reporter", e.target.value)}/>
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>CATEGORY</label>
            <select style={inp()} value={form.category} onChange={e => set("category", e.target.value)}>
              {["Hardware","Software","Network","Access","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", color: C.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>PRIORITY</label>
            <select style={inp()} value={form.priority} onChange={e => set("priority", e.target.value)}>
              {["Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleTriage} disabled={analyzing || !form.title || !form.description} style={{ ...btn(C.purple, { width: "100%", justifyContent: "center", marginBottom: 16, opacity: analyzing || !form.title || !form.description ? 0.5 : 1 }) }}>
          <Icon name="sparkle" size={15} color="#fff"/> {analyzing ? "Analyzing…" : "AI Triage — Auto-categorize & suggest fixes"}
        </button>
        {triage && (
          <div style={{ background: C.card, border: `1px solid ${C.purple}44`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ color: C.purple, fontWeight: 700, fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>✨ AI TRIAGE</div>
            <div style={{ color: C.textPrimary, fontSize: 13, marginBottom: 10 }}>{triage.summary}</div>
            {triage.suggestedSteps?.map((s, i) => (
              <div key={i} style={{ color: C.textSecondary, fontSize: 12, display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>{i+1}.</span> {s}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btn(C.card, { color: C.textSecondary })}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={btn(C.accent, { opacity: submitting ? 0.5 : 1 })}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TICKET DETAIL MODAL ───────────────────────────────────────────────
function TicketDetailModal({ ticket: init, onClose, onUpdate }) {
  const [ticket, setTicket] = useState(init);
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([{ role: "assistant", text: `Hi! I'm reviewing **${init.id}** — "${init.title}". How can I help?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", text }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const { reply } = await aiApi.ticketChat(ticket.id, newMsgs.map(m => ({ role: m.role, content: m.text })));
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch { setMessages(m => [...m, { role: "assistant", text: "Sorry, couldn't reach the AI." }]); }
    setLoading(false);
  };

  const updateStatus = async (status) => {
    const updated = await ticketsApi.update(ticket.id, { status });
    setTicket(updated); onUpdate(updated);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    const c = await ticketsApi.addComment(ticket.id, { text: comment, author: "Agent" });
    setTicket(t => ({ ...t, comments: [...t.comments, c] }));
    setComment("");
  };

  const summarize = async () => {
    setSummarizing(true);
    try {
      const { aiSummary } = await aiApi.summarize(ticket.id);
      const updated = { ...ticket, aiSummary };
      setTicket(updated); onUpdate(updated);
    } catch {}
    setSummarizing(false);
  };

  const p = priorities[ticket.priority] || priorities.Medium;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: 720, height: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ color: C.accent, fontFamily: "monospace", fontWeight: 700 }}>{ticket.id}</span>
              <Badge label={ticket.priority} color={p.color} bg={p.bg}/>
              <select value={ticket.status} onChange={e => updateStatus(e.target.value)} style={{ background: C.card, border: `1px solid ${C.border}`, color: statusColors[ticket.status] || C.textSecondary, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {["Open","In Progress","Resolved","Closed"].map(s => <option key={s} style={{ color: C.textPrimary }}>{s}</option>)}
              </select>
            </div>
            <div style={{ color: C.textPrimary, fontWeight: 600, fontSize: 15 }}>{ticket.title}</div>
            <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{ticket.category} · {ticket.reporter} · {new Date(ticket.created).toLocaleDateString()}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary }}><Icon name="x" size={20}/></button>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, paddingLeft: 24 }}>
          {[["chat","AI Chat"],["details","Details & Comments"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: tab === id ? C.accent : C.textSecondary, borderBottom: tab === id ? `2px solid ${C.accent}` : "2px solid transparent" }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: "10px 24px", background: C.card, borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.textSecondary }}>
          <span style={{ color: C.textMuted, fontWeight: 600, fontSize: 11, marginRight: 8 }}>DESC</span>{ticket.description || "No description."}
        </div>

        {tab === "chat" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.role === "user" ? C.accent : C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.role === "user" ? <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>U</span> : <Icon name="robot" size={15} color="#fff"/>}
                  </div>
                  <div style={{ maxWidth: "76%", background: m.role === "user" ? `${C.accent}18` : C.card, border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: C.textPrimary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
              ))}
              {loading && <div style={{ color: C.textMuted, fontSize: 13, paddingLeft: 42 }}>Thinking…</div>}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask the AI about this ticket…" style={inp({ flex: 1 })}/>
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={btn(C.accent, { padding: "10px 16px", opacity: loading || !input.trim() ? 0.5 : 1 })}><Icon name="send" size={15} color="#fff"/></button>
            </div>
          </>
        )}

        {tab === "details" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>AI SUMMARY</span>
                <button onClick={summarize} disabled={summarizing} style={btn(C.purple, { padding: "6px 12px", fontSize: 11, opacity: summarizing ? 0.5 : 1 })}>
                  <Icon name="sparkle" size={12} color="#fff"/> {summarizing ? "Generating…" : ticket.aiSummary ? "Refresh" : "Generate"}
                </button>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: ticket.aiSummary ? C.textPrimary : C.textMuted, lineHeight: 1.6 }}>
                {ticket.aiSummary || "No summary yet. Click Generate."}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>DETAILS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Assignee", ticket.assignee], ["Reporter", ticket.reporter], ["Category", ticket.category], ["Priority", ticket.priority], ["Created", new Date(ticket.created).toLocaleString()], ["Updated", new Date(ticket.updated).toLocaleString()]].map(([k, v]) => (
                  <div key={k} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ color: C.textPrimary, fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>COMMENTS ({ticket.comments.length})</div>
              {ticket.comments.map(c => (
                <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: C.accent, fontWeight: 700, fontSize: 12 }}>{c.author}</span>
                    <span style={{ color: C.textMuted, fontSize: 11 }}>{new Date(c.created).toLocaleString()}</span>
                  </div>
                  <div style={{ color: C.textPrimary, fontSize: 13 }}>{c.text}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="Add a comment…" style={inp({ flex: 1 })}/>
                <button onClick={addComment} disabled={!comment.trim()} style={btn(C.accent, { padding: "10px 16px", opacity: !comment.trim() ? 0.5 : 1 })}><Icon name="comment" size={15} color="#fff"/></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI CHAT PAGE ──────────────────────────────────────────────────────
function AIChat() {
  const [history, setHistory] = useState([{ role: "assistant", text: "Hello! I'm your IT Help Desk AI. What's going on today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput("");
    const newHistory = [...history, { role: "user", text }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const { reply } = await aiApi.chat(newHistory.map(m => ({ role: m.role, content: m.text })));
      setHistory(h => [...h, { role: "assistant", text: reply }]);
    } catch { setHistory(h => [...h, { role: "assistant", text: "I'm having trouble connecting. Please try again." }]); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <h2 style={{ color: C.textPrimary, margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>AI Assistant</h2>
      <p style={{ color: C.textSecondary, margin: "0 0 16px", fontSize: 14 }}>Powered by Claude — ask anything IT-related.</p>
      <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {history.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.role === "user" ? C.accent : C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {m.role === "user" ? <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>U</span> : <Icon name="robot" size={17} color="#fff"/>}
              </div>
              <div style={{ maxWidth: "76%", background: m.role === "user" ? `${C.accent}1A` : C.surface, border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: C.textMuted, fontSize: 13, paddingLeft: 48 }}>Thinking…</div>}
          <div ref={bottomRef}/>
        </div>
        {history.length === 1 && (
          <div style={{ padding: "0 20px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["My computer is slow", "VPN not working", "Reset my password", "Printer offline"].map(s => (
              <button key={s} onClick={() => send(s)} style={{ background: `${C.accent}18`, color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{s}</button>
            ))}
          </div>
        )}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Describe your IT issue…" style={inp({ flex: 1 })}/>
          <button onClick={() => send()} disabled={loading || !input.trim()} style={btn(C.accent, { padding: "10px 16px", opacity: loading || !input.trim() ? 0.5 : 1 })}><Icon name="send" size={16} color="#fff"/></button>
        </div>
      </div>
    </div>
  );
}

// ── KNOWLEDGE BASE ────────────────────────────────────────────────────
function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { kbApi.getAll().then(d => setArticles(d.articles)).catch(() => {}); }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setAnswer(null);
    try { const { answer: a } = await aiApi.kbSearch(query); setAnswer(a); } catch {}
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Knowledge Base</h2>
      <p style={{ color: C.textSecondary, margin: "0 0 24px", fontSize: 14 }}>Search IT docs or ask the AI a question.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="e.g. How do I connect to VPN on Mac?" style={inp({ flex: 1 })}/>
        <button onClick={search} disabled={loading || !query.trim()} style={btn(C.accent, { opacity: loading || !query.trim() ? 0.5 : 1 })}>
          {loading ? "Searching…" : "Ask AI"}
        </button>
      </div>
      {answer && (
        <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ color: C.accent, fontWeight: 700, fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>✨ AI ANSWER</div>
          <div style={{ color: C.textPrimary, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{answer}</div>
        </div>
      )}
      <h3 style={{ color: C.textSecondary, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>ARTICLES</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {articles.map(a => (
          <div key={a.id} onClick={() => setQuery(a.title)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "88"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{a.title}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {a.tags.map(t => <span key={t} style={{ background: `${C.accent}18`, color: C.accent, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>{t}</span>)}
            </div>
            <div style={{ color: C.textMuted, fontSize: 11 }}>{a.views.toLocaleString()} views</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const color = type === "error" ? C.red : C.green;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: C.card, border: `1px solid ${color}`, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}/>
      <span style={{ color: C.textPrimary, fontSize: 13 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer" }}><Icon name="x" size={14}/></button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const loadTickets = useCallback(async () => {
    try { const { tickets: data } = await ticketsApi.getAll(); setTickets(data); }
    catch { showToast("Failed to load tickets.", "error"); }
  }, []);

  useEffect(() => { if (user) loadTickets(); }, [user, loadTickets]);

  if (!user) return <Login onLogin={setUser}/>;

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    try {
      await fetch("/api/auth/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) });
      setUser(null);
    } catch { showToast("Failed to delete account.", "error"); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", overflow: "hidden" }}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2D3748; border-radius: 3px; } @keyframes spin { to { transform: rotate(360deg); } } input, textarea, select { font-family: inherit; } input::placeholder, textarea::placeholder { color: #4A5568; }`}</style>

      <Sidebar page={page} setPage={p => { setPage(p); setSelected(null); }} onNewTicket={() => setShowNew(true)} user={user} onLogout={() => setUser(null)} onDeleteAccount={deleteAccount}/>

      <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {page === "dashboard" && <Dashboard tickets={tickets}/>}
        {page === "tickets" && <TicketList tickets={tickets} onSelect={t => setSelected(tickets.find(x => x.id === t.id) || t)} onNew={() => setShowNew(true)}/>}
        {page === "ai" && <AIChat/>}
        {page === "kb" && <KnowledgeBase/>}
      </main>

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={t => { setTickets(p => [t, ...p]); showToast(`Ticket ${t.id} created.`); }}/>}
      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} onUpdate={u => { setTickets(p => p.map(t => t.id === u.id ? u : t)); setSelected(u); }}/>}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
    </div>
  );
}
