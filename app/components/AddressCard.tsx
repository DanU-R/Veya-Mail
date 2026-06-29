"use client";

import { useState } from "react";
import { CancellationStamp } from "./CancellationStamp";

interface AddressCardProps {
  address: string;
  addressId: string;
  expiresAt: number;
  onGenerateNew: () => void;
  onExtend: () => void;
}

export function AddressCard({
  address,
  addressId,
  expiresAt,
  onGenerateNew,
  onExtend,
}: AddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card ticket-edge-top ticket-edge-bottom p-6 animate-stamp-in">
      <div className="flex flex-col items-center text-center gap-4">
        {/* Wordmark */}
        <span className="font-display text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
          Veya
        </span>

        {/* Email address — font-mono */}
        <div className="flex items-center gap-2">
          <code className="font-mono text-lg font-medium text-[var(--color-text)] select-all">
            {address}
          </code>
        </div>

        {/* Copy + actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-primary text-xs"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={onGenerateNew}
            className="btn btn-secondary text-xs"
          >
            ✕ New
          </button>
          <button
            onClick={onExtend}
            className="btn btn-secondary text-xs"
          >
            + Extend
          </button>
        </div>

        {/* Cancellation Stamp — countdown */}
        <CancellationStamp expiresAt={expiresAt} onExpire={onGenerateNew} />
      </div>
    </div>
  );
}
