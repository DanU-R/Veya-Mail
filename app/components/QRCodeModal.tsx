"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function QRCodeModal({ isOpen, onClose, email }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-sm w-full text-center relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="btn btn-ghost absolute top-3 right-3 w-8 h-8 p-0 text-sm"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="font-display text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-4">
          Scan to copy
        </p>

        <div className="bg-white p-3 inline-block mb-4">
          <QRCodeCanvas value={email} size={160} />
        </div>

        <code className="font-mono text-sm block bg-[var(--color-accent-soft)] px-3 py-2">
          {email}
        </code>
      </div>
    </div>
  );
}
