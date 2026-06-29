"use client";

import { useState, useEffect, useRef } from "react";
import { getMessage, type MessageDetail } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface MessageViewerProps {
  token: string;
  messageId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function MessageViewer({ token, messageId, onBack, onDelete }: MessageViewerProps) {
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMessage(token, messageId);
        setMessage(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, messageId]);

  // Render HTML into sandboxed iframe
  useEffect(() => {
    if (!message?.html_body || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(message.html_body);
    doc.close();
  }, [message?.html_body, message?.id]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-5 w-48 mb-4 rounded" />
        <div className="skeleton h-4 w-full mb-2 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--color-text-muted)]">
        Message not found
      </div>
    );
  }

  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 dashed-divider flex items-center justify-between">
        <button onClick={onBack} className="btn btn-ghost text-xs">
          ← Back
        </button>
        <button onClick={onDelete} className="btn btn-ghost text-xs text-[var(--color-accent)]">
          ✕ Delete
        </button>
      </div>

      {/* Meta info */}
      <div className="p-4 dashed-divider text-xs text-[var(--color-text-muted)] space-y-1">
        <div className="flex gap-2">
          <span className="w-10 shrink-0">From:</span>
          <span className="font-medium text-[var(--color-text)]">{message.from_address}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-10 shrink-0">Subject:</span>
          <span className="font-medium text-[var(--color-text)]">{message.subject || "(No Subject)"}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-10 shrink-0">Date:</span>
          <span>{formatDate(message.received_at)}</span>
        </div>
      </div>

      {/* Body — sandboxed iframe */}
      <div className="flex-1 min-h-0">
        {message.html_body ? (
          <iframe
            ref={iframeRef}
            sandbox=""
            className="w-full h-full border-0 bg-white"
            title="Email content"
          />
        ) : (
          <pre className="p-4 text-sm whitespace-pre-wrap font-sans text-[var(--color-text)]">
            {message.text_body || "(No content)"}
          </pre>
        )}
      </div>
    </div>
  );
}
