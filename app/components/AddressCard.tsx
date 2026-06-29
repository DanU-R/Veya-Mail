"use client";

import { useState } from "react";

interface AddressCardProps {
  address: string;
  expiresAt: number;
  onGenerateNew: () => void;
  onExtend: () => void;
}

export function AddressCard({ address, expiresAt, onGenerateNew, onExtend }: AddressCardProps) {
  const [copied, setCopied] = useState(false);

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

  // Countdown timer
  const [now, setNow] = useState(Date.now());
  const left = Math.max(0, expiresAt * 1000 - now);
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  const totalSecs = Math.floor(left / 1000);

  if (typeof window !== "undefined") {
    setTimeout(() => setNow(Date.now()), 1000);
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left: email + copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-xs tracking-widest uppercase text-[var(--text-muted)]">
              Your temporary email
            </span>
            {totalSecs <= 60 && (
              <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                Expiring
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-lg md:text-xl font-medium text-[var(--text)] select-all truncate">
              {address}
            </code>
            <button
              onClick={handleCopy}
              className="btn btn-secondary shrink-0 text-xs px-3"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* Timer bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden max-w-xs">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(totalSecs / 600) * 100}%` }}
              />
            </div>
            <span className={`font-mono text-xs tabular-nums ${totalSecs <= 60 ? "text-red-500 font-medium" : "text-[var(--text-muted)]"}`}>
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex md:flex-col gap-2 shrink-0">
          <button onClick={onGenerateNew} className="btn btn-secondary text-xs whitespace-nowrap">
            ✕ New Address
          </button>
          <button onClick={onExtend} className="btn btn-secondary text-xs whitespace-nowrap">
            +10 min
          </button>
        </div>
      </div>
    </div>
  );
}
