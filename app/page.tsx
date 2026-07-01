"use client";

import { useState, useEffect } from "react";
import { createAddress, login, getDomains, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";

const SAVED_PASSWORD = process.env.NEXT_PUBLIC_VEYA_PASSWORD || "Bandulan123@";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [domains, setDomains] = useState<string[]>(["aivenue.web.id"]);
  const [selectedDomain, setSelectedDomain] = useState("aivenue.web.id");
  const [uname, setUname] = useState("");
  const [loading, setLoading] = useState(true);
  const [selMsg, setSelMsg] = useState<Message | null>(null);
  const [msgBody, setMsgBody] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [dark, setDark] = useState(true);

  // Init
  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem("veya_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setDark(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    const saved = localStorage.getItem("tempmail_token");
    if (saved) {
      setToken(saved);
      initDomains(saved);
      generate(saved);
    } else {
      login(SAVED_PASSWORD).then(res => {
        localStorage.setItem("tempmail_token", res.token);
        setToken(res.token);
        initDomains(res.token);
        generate(res.token);
      }).catch(() => setLoading(false));
    }
  }, []);

  const initDomains = async (t: string) => {
    try {
      const d = await getDomains(t);
      if (d.domains?.length) {
        setDomains(d.domains);
        setSelectedDomain(d.domains[0]);
      }
    } catch {}
  };

  const generate = async (t: string, customName?: string) => {
    try {
      setLoading(true);
      setSelMsg(null);
      const name = customName?.trim()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "";
      const finalName = name && name.length >= 3 ? name.slice(0, 20) : "";
      const d = await createAddress(t, finalName || undefined, 10, selectedDomain);
      setAddressId(d.id);
      setAddress(d.address);
      setUname(d.address.split("@")[0]);
      setMessages([]);
    } catch (e) {
      localStorage.removeItem("tempmail_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!token) return;
    const name = uname.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    generate(token, name || undefined);
  };

  // Poll messages
  useEffect(() => {
    if (!token || !addressId) return;
    
    const fetchMsgs = async () => {
      try {
        const { listMessages } = await import("@/lib/api");
        const res = await listMessages(token, addressId);
        if (res.messages) setMessages(res.messages);
      } catch {}
    };
    
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 4000);
    return () => clearInterval(interval);
  }, [token, addressId]);

  const openMsg = async (msg: Message) => {
    setSelMsg(msg);
    try {
      const { getMessage } = await import("@/lib/api");
      const detail = await getMessage(token!, msg.id);
      setMsgBody(detail.text_body || detail.html_body || "(no content)");
      setShowModal(true);
    } catch {
      setMsgBody("Failed to load message");
      setShowModal(true);
    }
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(address);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("veya_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await login(password);
      localStorage.setItem("tempmail_token", res.token);
      setToken(res.token);
      setShowLogin(false);
      setPassword("");
      initDomains(res.token);
      generate(res.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Wrong password");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("tempmail_token");
    setToken(null);
    setAddressId(null);
    setAddress("");
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Animated BG */}
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow-2" />

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[480px] mx-auto px-5 h-12 flex items-center justify-between relative z-10">
          <span className="font-display font-bold text-[17px] tracking-[3px]" style={{ color: "var(--text)" }}>
            VEYA
          </span>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="text-xs px-3 py-1.5 rounded-md transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {dark ? "☀" : "☾"}
            </button>
            {token ? (
              <>
                <button onClick={() => navigator.clipboard.writeText(address)}
                  className="text-xs px-3 py-1.5 rounded-md transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  ◈
                </button>
                <button onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-md transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  ✕
                </button>
              </>
            ) : (
              <button onClick={() => setShowLogin(!showLogin)}
                className="text-xs px-3 py-1.5 rounded-md transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                🔑
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-10">
        <div className="max-w-[480px] mx-auto px-5 py-10">
          {/* Hero */}
          <div className="text-center mb-7">
            <h1 className="text-[clamp(24px,4vw,38px)] font-[700] tracking-wide mb-1.5" style={{ color: "var(--text)" }}>
              Veya.
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Disposable email, instantly.</p>
          </div>

          {/* Generate bar */}
          <div className="rounded-[10px] p-3 mb-4 transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={uname}
                onChange={e => setUname(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                placeholder="custom or random"
                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm font-mono"
                style={{ color: "var(--text)" }}
              />
              <div style={{ width: 1, height: 20, background: "var(--border)" }} />
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="text-xs font-mono rounded-[5px] px-2 py-1.5 outline-none max-w-[130px]"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {domains.map(d => (
                  <option key={d} value={d}>@{d}</option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={loading || !token}
                className="text-xs font-semibold rounded-[7px] px-4 py-1.5 border-none cursor-pointer transition-all whitespace-nowrap"
                style={{ background: "var(--accent)", color: dark ? "#0f1117" : "#fff" }}
              >
                {loading ? "…" : "Generate"}
              </button>
            </div>
          </div>

          {/* Address card */}
          {address && (
            <div className="rounded-[10px] p-4 mb-4 fade-in"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <span className="text-sm font-semibold font-mono flex-1 min-w-[160px] break-all" style={{ color: "var(--text)" }}>
                  {address}
                </span>
                <span className="text-[9px] font-bold tracking-[0.5px] px-1.5 py-0.5 rounded-sm"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid transparent" }}>
                  ACTIVE
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={copyAddr}
                  className="flex items-center gap-1 text-[11px] font-medium rounded-md px-3 py-1.5 transition-all cursor-pointer"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  📋 Copy
                </button>
                <button onClick={() => navigator.clipboard.writeText(address)}
                  className="flex items-center gap-1 text-[11px] font-medium rounded-md px-3 py-1.5 transition-all cursor-pointer"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  ◈ QR
                </button>
                <button onClick={handleGenerate}
                  className="flex items-center gap-1 text-[11px] font-semibold rounded-md px-3 py-1.5 transition-all cursor-pointer border-none"
                  style={{ background: "var(--accent)", color: dark ? "#0f1117" : "#fff" }}>
                  ✦ New
                </button>
                <button
                  className="flex items-center gap-1 text-[11px] font-medium rounded-md px-3 py-1.5 transition-all cursor-pointer"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "#f87171" }}>
                  ✕ Delete
                </button>
              </div>
            </div>
          )}

          {/* Inbox */}
          <div>
            <h3 className="text-[10px] font-semibold tracking-[1.5px] uppercase flex items-center gap-1.5 mb-2"
              style={{ color: "var(--text-muted)" }}>
              Inbox <span className="text-[9px] px-1.5 py-[1px] rounded-sm"
                style={{ background: "var(--surface)", color: "var(--text-muted)" }}>{messages.length}</span>
            </h3>

            {messages.length === 0 && !loading && (
              <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
                <div className="text-[26px] mb-1.5">📭</div>
                <p className="text-sm">No emails yet</p>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-[8px] p-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="skeleton h-3 w-40 mb-2" />
                    <div className="skeleton h-2.5 w-28" />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1">
              {messages.map(m => (
                <div key={m.id}
                  onClick={() => openMsg(m)}
                  className="flex items-center gap-2.5 rounded-[8px] p-2.5 cursor-pointer transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{m.from_address}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{m.subject}</div>
                  </div>
                  <div className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {new Date(m.received_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-[11px] relative z-10"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        Powered by <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>Cloudflare</a>
        &nbsp;·&nbsp;
        <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>GitHub</a>
      </footer>

      {/* Modal overlay */}
      {showModal && selMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-5"
          onClick={() => setShowModal(false)}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="rounded-[10px] w-full max-w-[520px] max-h-[80vh] overflow-y-auto p-5 relative"
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-2.5 right-3.5 bg-none border-none cursor-pointer text-base"
              style={{ color: "var(--text-muted)" }}>
              ✕
            </button>
            <h2 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>{selMsg.subject}</h2>
            <div className="text-[11px] mb-3.5" style={{ color: "var(--text-muted)" }}>
              {selMsg.from_address} · {new Date(selMsg.received_at * 1000).toLocaleString()}
            </div>
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap rounded-[7px] p-3.5"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {msgBody}
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-5"
          onClick={() => setShowLogin(false)}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="rounded-[10px] w-full max-w-[320px] p-5"
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <form onSubmit={doLogin} className="space-y-3">
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Save your addresses across sessions</p>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full text-sm rounded-[8px] px-3.5 py-2.5 outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              {loginError && <p className="text-xs" style={{ color: "#ef4444" }}>{loginError}</p>}
              <button type="submit" disabled={loginLoading || !password}
                className="w-full text-xs font-semibold rounded-[8px] px-4 py-2.5 border-none cursor-pointer transition-all"
                style={{ background: "var(--accent)", color: dark ? "#0f1117" : "#fff", opacity: loginLoading || !password ? 0.5 : 1 }}>
                {loginLoading ? "…" : "Enter"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR modal */}
      {false && (
        <div>QR placeholder</div>
      )}
    </div>
  );
}
