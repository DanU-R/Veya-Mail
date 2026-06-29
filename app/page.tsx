"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { ThemeToggle } from "./components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await login(password);
      localStorage.setItem("tempmail_token", token);
      router.push("/inbox");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="card p-8 animate-stamp-in">
            <div className="text-center mb-6">
              <span className="font-display text-2xl tracking-widest uppercase block">
                Veya
              </span>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Disposable email
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="input"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost text-sm px-2 py-1"
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>

              {error && (
                <p className="text-xs text-[var(--color-accent)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="btn btn-primary w-full"
              >
                {loading ? "…" : "Enter"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-[11px] text-[var(--color-text-muted)]">
        Veya — disposable email service
      </footer>
    </div>
  );
}
