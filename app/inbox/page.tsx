"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAddress, extendAddress, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";
import { AddressCard } from "../components/AddressCard";
import { MessageList } from "../components/MessageList";
import { MessageViewer } from "../components/MessageViewer";
import { QRCodeModal } from "../components/QRCodeModal";
import { ThemeToggle } from "../components/ThemeToggle";

export default function InboxPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [selected, setSelected] = useState<Message | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tempmail_token");
    if (!t) { router.push("/"); return; }
    setToken(t);
    generate(t);
  }, [router]);

  const generate = async (t: string) => {
    try {
      setLoading(true);
      const d = await createAddress(t, generateRandomUsername(), 10);
      setAddressId(d.id);
      setAddress(d.address);
      setExpiresAt(d.expires_at);
    } catch (e) {
      console.error(e);
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

  const handleLogout = () => {
    localStorage.removeItem("tempmail_token");
    router.push("/");
  };

  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <span className="font-display text-sm tracking-widest uppercase">Veya</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="btn btn-ghost text-xs"
          >
            ◈ QR
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-ghost text-xs">
            ✕ Exit
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 space-y-4 max-w-2xl w-full mx-auto">
        <AddressCard
          address={address}
          addressId={addressId || ""}
          expiresAt={expiresAt}
          onGenerateNew={() => token && generate(token)}
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
            addressId={addressId || ""}
            onSelectMessage={setSelected}
            onRefresh={() => {}}
          />
        )}
      </main>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} email={address} />
    </div>
  );
}
