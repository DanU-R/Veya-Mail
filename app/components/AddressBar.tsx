"use client";

import { useState } from "react";
import { Copy, RefreshCw, Clock, Check } from "lucide-react";
import { copyToClipboard, generateRandomUsername } from "@/lib/utils";
import { ExpiryTimer } from "./ExpiryTimer";

interface AddressBarProps {
  address: string;
  addressId: string;
  expiresAt: number;
  onGenerateNew: () => void;
  onExtend: () => void;
}

export function AddressBar({
  address,
  addressId,
  expiresAt,
  onGenerateNew,
  onExtend,
}: AddressBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Email Address */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Email:</span>
            <code className="code-block text-sm font-medium">{address}</code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <ExpiryTimer expiresAt={expiresAt} onExpire={onGenerateNew} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExtend}
            className="btn btn-secondary gap-1.5"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Extend</span>
          </button>
          
          <button
            onClick={onGenerateNew}
            className="btn btn-secondary gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>
    </div>
  );
}
