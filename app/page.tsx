"use client";

import { useState, useEffect } from "react";
import { createAddress, extendAddress, login, getDomains, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";
import { AddressCard } from "./components/AddressCard";
import { MessageList } from "./components/MessageList";
import { MessageViewer } from "./components/MessageViewer";
import { QRCodeModal } from "./components/QRCodeModal";
import { ThemeToggle } from "./components/ThemeToggle";

const SAVED_PASSWORD = process.env.NEXT_PUBLIC_VEYA_PASSWORD || "Bandulan123@";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [selected, setSelected] = useState<Message | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [autoLoginDone, setAutoLoginDone] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  // Auto-login on first visit
  useEffect(() => {
    const saved = localStorage.getItem("tempmail_token");
    if (saved) {
      setToken(saved);
      generate(saved);
    } else {
      // Auto-login with saved password
      login(SAVED_PASSWORD).then(res => {
        localStorage.setItem("tempmail_token", res.token);
        setToken(res.token);
        generate(res.token);
        getDomains(res.token).then(d => { setDomains(d.domains); setSelectedDomain(d.domains[0] || ""); });
      }).catch(() => {
        setLoading(false);
      });
    }
    setAutoLoginDone(true);
  }, []);

  const generate = async (t: string) => {
    try {
      setLoading(true);
      const d = await createAddress(t, generateRandomUsername(), 10, selectedDomain);
      setAddressId(d.id);
      setAddress(d.address);
      setExpiresAt(d.expires_at);
    } catch {
      localStorage.removeItem("tempmail_token");
      setToken(null);
    }
    finally { setLoading(false); }
  };

  const handleExtend = async () => {
    if (!token || !addressId) return;
    try { const d = await extendAddress(token, addressId, 10); setExpiresAt(d.expires_at); }
    catch (e) { console.error(e); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    try {
      const res = await login(password);
      localStorage.setItem("tempmail_token", res.token);
      setToken(res.token); setShowLogin(false); setPassword("");
      generate(res.token);
      getDomains(res.token).then(d => { setDomains(d.domains); setSelectedDomain(d.domains[0] || ""); });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Wrong password");
    } finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("tempmail_token");
    setToken(null); setAddressId(null); setAddress("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-base tracking-widest uppercase">Veya</span>
          <div className="flex items-center gap-2">
            {address && (
              <>
                <span className="font-mono text-xs text-[var(--text-muted)] hidden sm:block">{address}</span>
                <button onClick={() => setShowQR(true)} className="btn-ghost text-xs px-2 py-1">◈ QR</button>
              </>
            )}
            <ThemeToggle />
            {token ? (
              <button onClick={handleLogout} className="btn-ghost text-xs px-2 py-1">✕ Logout</button>
            ) : (
              <button onClick={() => setShowLogin(!showLogin)} className="btn-ghost text-xs px-2 py-1">🔑 Login</button>
            )}
          </div>
        </div>

        {/* Login dropdown */}
        {showLogin && !token && (
          <div className="absolute top-14 right-4 z-50 card p-4 w-64 shadow-lg">
            <form onSubmit={handleLogin} className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">Save your addresses across sessions</p>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" className="input text-sm" autoFocus />
              {loginError && <p className="text-xs text-red-500">{loginError}</p>}
              <button type="submit" disabled={loginLoading || !password}
                className="btn btn-primary w-full text-xs">
                {loginLoading ? "…" : "Enter"}
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="card p-10 text-center">
            <div className="skeleton h-6 w-40 mx-auto mb-3"></div>
            <div className="skeleton h-4 w-60 mx-auto"></div>
          </div>
        )}

        {/* No token — show generate */}
        {!token && !loading && (
          <div className="card p-10 text-center">
            <span className="font-display text-2xl tracking-widest uppercase block mb-2">Veya</span>
            <p className="text-sm text-[var(--text-muted)] mb-6">Disposable email — one click</p>
            <button
              onClick={() => {
                login(SAVED_PASSWORD).then(res => {
                  localStorage.setItem("tempmail_token", res.token);
                  setToken(res.token);
                  generate(res.token);
                  getDomains(res.token).then(d => { setDomains(d.domains); setSelectedDomain(d.domains[0] || ""); });
                }).catch(err => setLoginError("Auto-login failed"));
              }}
              className="btn btn-primary text-sm px-6 py-2.5"
            >
              ✨ Generate Email
            </button>
          </div>
        )}

        {/* Logged in — show address + inbox */}
        {token && addressId && (
          <>
            {domains.length > 1 && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>Domain:</span>
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  className="input text-xs py-1 px-2 w-auto"
                >
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <AddressCard
              address={address}
              expiresAt={expiresAt}
              onGenerateNew={() => generate(token)}
              onExtend={handleExtend}
            />

            {selected ? (
              <MessageViewer
                token={token}
                messageId={selected.id}
                onBack={() => setSelected(null)}
                onDelete={() => setSelected(null)}
              />
            ) : (
              <MessageList
                token={token}
                addressId={addressId}
                onSelectMessage={setSelected}
              />
            )}
          </>
        )}

        {/* Footer features */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: "⚡", title: "Instant", desc: "One click" },
            { icon: "🔒", title: "Private", desc: "No signup" },
            { icon: "♻️", title: "Auto-delete", desc: "Self destruct" },
          ].map((f, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <h4 className="font-display text-xs tracking-wider uppercase">{f.title}</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} email={address} />
    </div>
  );
}
