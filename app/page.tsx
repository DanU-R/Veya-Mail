"use client";

import { useState, useEffect } from "react";
import { createAddress, extendAddress, login, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";
import { AddressCard } from "./components/AddressCard";
import { MessageList } from "./components/MessageList";
import { MessageViewer } from "./components/MessageViewer";
import { QRCodeModal } from "./components/QRCodeModal";
import { ThemeToggle } from "./components/ThemeToggle";

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

  useEffect(() => {
    const saved = localStorage.getItem("tempmail_token");
    if (saved) { setToken(saved); generate(saved); }
    else { setLoading(false); }
  }, []);

  const generate = async (t: string) => {
    try {
      setLoading(true);
      const d = await createAddress(t, generateRandomUsername(), 10);
      setAddressId(d.id);
      setAddress(d.address);
      setExpiresAt(d.expires_at);
    } catch { localStorage.removeItem("tempmail_token"); setToken(null); }
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
          <div className="flex items-center gap-1">
            {addressId && (
              <button onClick={() => setShowQR(true)} className="btn btn-ghost text-xs">◈ QR</button>
            )}
            <ThemeToggle />
            {token ? (
              <button onClick={handleLogout} className="btn btn-ghost text-xs">✕ Logout</button>
            ) : (
              <button onClick={() => setShowLogin(!showLogin)} className="btn btn-ghost text-xs">
                🔑 Login
              </button>
            )}
          </div>
        </div>

        {/* Login dropdown */}
        {showLogin && !token && (
          <div className="absolute top-14 right-4 z-50 card p-4 w-64 shadow-lg">
            <form onSubmit={handleLogin} className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">Login to save your addresses</p>
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
        {!token && !loading && (
          <div className="card p-10 text-center">
            <span className="font-display text-2xl tracking-widest uppercase block mb-2">Veya</span>
            <p className="text-sm text-[var(--text-muted)] mb-6">Disposable email — no signup needed</p>
            <form onSubmit={(e) => { e.preventDefault(); setShowLogin(true); }} className="max-w-xs mx-auto">
              <div className="flex gap-2">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" className="input text-sm flex-1" />
                <button type="submit" disabled={!password} onClick={e => {
                  e.preventDefault(); handleLogin(e as any);
                }} className="btn btn-primary text-xs">Go</button>
              </div>
              {loginError && <p className="text-xs text-red-500 mt-2">{loginError}</p>}
            </form>
          </div>
        )}

        {token && addressId && (
          <>
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
      </main>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} email={address} />
    </div>
  );
}
