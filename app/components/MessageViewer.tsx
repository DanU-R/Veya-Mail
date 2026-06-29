"use client";

import { useState, useEffect, useRef } from "react";
import { getMessage, type MessageDetail } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Props {
  token: string;
  messageId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function MessageViewer({ token, messageId, onBack, onDelete }: Props) {
  const [msg, setMsg] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMessage(token, messageId);
        setMsg(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, messageId]);

  useEffect(() => {
    if (!msg?.html_body || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(msg.html_body);
    doc.close();
  }, [msg?.html_body, msg?.id]);

  if (loading) {
    return (
      <div className="card p-6 space-y-3">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
        Message not found or has been deleted
      </div>
    );
  }

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <button onClick={onBack} className="btn btn-ghost text-xs">← Back</button>
        <button onClick={onDelete} className="btn btn-ghost text-xs text-[var(--danger)]">✕ Delete</button>
      </div>

      {/* Meta */}
      <div className="px-5 py-3 border-b border-[var(--border)] space-y-1 text-sm">
        <div className="flex gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-12 shrink-0">From:</span>
          <span className="text-[var(--text)] font-medium truncate">{msg.from_address}</span>
        </div>
        <div className="flex gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-12 shrink-0">Subject:</span>
          <span className="text-[var(--text)] truncate">{msg.subject || "(No subject)"}</span>
        </div>
        <div className="flex gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-12 shrink-0">Date:</span>
          <span>{formatDate(msg.received_at)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {msg.html_body ? (
          <iframe
            ref={iframeRef}
            sandbox=""
            className="w-full h-full border-0 bg-white"
            title="Email"
          />
        ) : (
          <pre className="p-5 text-sm whitespace-pre-wrap font-sans text-[var(--text)]">
            {msg.text_body || "(No content)"}
          </pre>
        )}
      </div>
    </div>
  );
}
