"use client";

import { useState, useEffect } from "react";
import { createAddress, extendAddress, login, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";
import { AddressCard } from "./components/AddressCard";
import { MessageList } from "./components/MessageList";
import { MessageViewer } from "./components/MessageViewer";
import { QRCodeModal } from "./components/QRCodeModal";
import { ThemeToggle } from "./components/ThemeToggle";

export default function HomePage() {
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

  // On mount: check for saved token
  useEffect(() => {
    const saved = localStorage.getItem("tempmail_token");
    if (saved) {
      setToken(saved);
      generate(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const generate = async (t: string) => {
    try {
      setLoading(true);
      const d = await createAddress(t, generateRandomUsername(), 10);
      setAddressId(d.id);
      setAddress(d.address);
      setExpiresAt(d.expires_at);
    } catch (e) {
      console.error("Generate failed, token may be expired", e);
      // Token expired → show login prompt
      localStorage.removeItem("tempmail_token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!token || !addressId) return;
    try {
      const d = await extendAddress(token, addressId, 10);
      setExpiresAt(d.expires_at);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await login(password);
      localStorage.setItem("tempmail_token", res.token);
      setToken(res.token);
      setShowLogin(false);
      setPassword("");
      generate(res.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Wrong password");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tempmail_token");
    setToken(null);
    setAddressId(null);
    setAddress("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <span className="font-display text-sm tracking-widest uppercase">Veya</span>
        <div className="flex items-center gap-2">
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
      </header>

      {/* Login dropdown (kecil, di pojok) */}
      {showLogin && !token && (
        <div className="absolute top-16 right-4 z-50 card p-4 w-64 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Login to save your addresses
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input text-sm"
              autoFocus
            />
            {loginError && (
              <p className="text-xs text-[var(--color-accent)]">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="btn btn-primary w-full text-xs"
            >
              {loginLoading ? "…" : "Enter"}
            </button>
          </form>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 p-4 space-y-4 max-w-2xl w-full mx-auto">
        {loading && !addressId && (
          <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">Loading…</div>
        )}

        {!token && !loading && (
          <div className="card p-12 text-center animate-stamp-in">
            <span className="font-display text-xl tracking-widest uppercase block mb-2">Veya</span>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Disposable email — no signup needed
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-6">
              Enter the shared password to generate an address
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setShowLogin(true); }} className="max-w-xs mx-auto">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="input text-sm flex-1"
                />
                <button
                  type="submit"
                  disabled={!password}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogin(e as any);
                  }}
                  className="btn btn-primary text-xs"
                >
                  Go
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-[var(--color-accent)] mt-2">{loginError}</p>
              )}
            </form>
          </div>
        )}

        {token && addressId && (
          <>
            <AddressCard
              address={address}
              addressId={addressId}
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
                onRefresh={() => {}}
              />
            )}
          </>
        )}
      </main>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} email={address} />
    </div>
  );
}
