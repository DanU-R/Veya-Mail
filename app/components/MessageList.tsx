"use client";

import { useEffect, useState } from "react";
import { listMessages, deleteMessage, type Message } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";

interface MessageListProps {
  token: string;
  addressId: string;
  onSelectMessage: (message: Message) => void;
  onRefresh: () => void;
}

export function MessageList({ token, addressId, onSelectMessage, onRefresh }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await listMessages(token, addressId);
      setMessages(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteMessage(token, id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [token, addressId]);

  // Skeleton
  if (loading && messages.length === 0) {
    return (
      <div className="card">
        <div className="p-4 flex justify-between items-center dashed-divider">
          <span className="font-display text-xs tracking-widest uppercase text-[var(--color-text-muted)]">Inbox</span>
          <button onClick={onRefresh} className="btn btn-ghost text-xs">Refresh</button>
        </div>
        {[1,2,3].map((i) => (
          <div key={i} className="p-4 message-item">
            <div className="skeleton h-4 w-32 mb-2 rounded" />
            <div className="skeleton h-3 w-48 mb-1 rounded" />
            <div className="skeleton h-3 w-64 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty
  if (!loading && messages.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <span className="font-display text-3xl text-[var(--color-text-muted)] mb-2">✉</span>
        <p className="text-sm text-[var(--color-text-muted)]">No messages yet</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Send an email to this address</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 flex justify-between items-center dashed-divider">
        <span className="font-display text-xs tracking-widest uppercase text-[var(--color-text-muted)]">Inbox</span>
        <button onClick={onRefresh} className="btn btn-ghost text-xs">Refresh</button>
      </div>

      <div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelectMessage(msg)}
            className="p-4 cursor-pointer message-item"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate">{truncate(msg.from_address, 30)}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                    {formatDate(msg.received_at)}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text)] truncate">
                  {msg.subject || "(No Subject)"}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                  {truncate(msg.snippet || "", 80)}
                </p>
              </div>

              <button
                onClick={(e) => handleDelete(msg.id, e)}
                disabled={deletingId === msg.id}
                className="btn btn-ghost text-xs px-2 py-1 shrink-0"
              >
                {deletingId === msg.id ? "…" : "✕"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
