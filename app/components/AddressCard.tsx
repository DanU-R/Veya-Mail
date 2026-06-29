"use client";

import { useState, useEffect } from "react";

interface AddressCardProps {
  address: string;
  expiresAt: number;
  onGenerateNew: () => void;
  onExtend: () => void;
}

export function AddressCard({ address, expiresAt, onGenerateNew, onExtend }: AddressCardProps) {
  const [copied, setCopied] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setShowStamp(true);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [address]);

  const left = Math.max(0, expiresAt * 1000 - now);
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  const totalSecs = Math.floor(left / 1000);
  const isExpiring = totalSecs <= 60;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="ticket">
      {/* Stamp */}
      <div className={`stamp ${showStamp ? "stamp-animate" : ""} ${isExpiring ? "stamp-pulse" : ""}`}>
        <span>{mins}:{secs.toString().padStart(2, "0")}</span>
        <small>remaining</small>
      </div>

      <div className="ticket-edge"></div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs tracking-widest uppercase text-[var(--text-muted)]">
            Your temporary address
          </span>
          {isExpiring && (
            <span className="text-[10px] font-medium text-white bg-[var(--accent)] px-1.5 py-0.5 rounded">
              Expiring
            </span>
          )}
        </div>

        {/* Email display */}
        <div className="flex items-center gap-3 bg-[var(--bg)] rounded-lg p-3 mb-3">
          <code className="font-mono text-lg font-medium text-[var(--text)] flex-1 select-all truncate">
            {address}
          </code>
          <button onClick={handleCopy} className="btn btn-primary text-xs shrink-0 px-3 py-1.5">
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden max-w-xs">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${isExpiring ? "bg-[var(--accent)]" : "bg-[var(--accent)]"}`}
              style={{ width: `${Math.min(100, (totalSecs / 600) * 100)}%` }}
            />
          </div>
          <div className="flex gap-1.5">
            <button onClick={onGenerateNew} className="btn btn-secondary text-xs px-2.5 py-1">
              ✕ New
            </button>
            <button onClick={onExtend} className="btn btn-secondary text-xs px-2.5 py-1">
              +10m
            </button>
          </div>
        </div>
      </div>
      <div className="ticket-edge"></div>
    </div>
  );
}
