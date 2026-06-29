"use client";

import { X, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function QRCodeModal({ isOpen, onClose, email }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-sm w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            QR Code
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Scan to copy email address to your device
          </p>

          {/* QR Code */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-6">
            <QRCodeCanvas value={email} size={192} />
          </div>

          {/* Email Address */}
          <div className="bg-secondary rounded-lg px-4 py-3">
            <code className="text-sm font-mono text-foreground break-all">
              {email}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
