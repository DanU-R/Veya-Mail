"use client";

import { useEffect, useState } from "react";
import { listMessages, deleteMessage, type Message } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";

interface Props {
  token: string;
  addressId: string;
  onSelectMessage: (m: Message) => void;
}

export function MessageList({ token, addressId, onSelectMessage }: Props) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const data = await listMessages(token, addressId);
      setMsgs(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeleting(id);
      await deleteMessage(token, id);
      setMsgs((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 8000);
    return () => clearInterval(id);
  }, [token, addressId]);

  if (loading && msgs.length === 0) {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Inbox</span>
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="skeleton h-4 w-1/4 rounded" />
            <div className="skeleton h-4 w-2/4 rounded" />
            <div className="skeleton h-4 w-1/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && msgs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-2xl mb-2">📬</p>
        <p className="text-sm text-[var(--text-muted)]">No messages yet</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Send an email to this address and it will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium">
          Inbox <span className="text-[var(--text-muted)] font-normal">({msgs.length})</span>
        </span>
        <button onClick={fetch} className="btn btn-ghost text-xs">Refresh</button>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {msgs.map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelectMessage(msg)}
            className="px-5 py-3.5 cursor-pointer message-item"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate">
                    {msg.from_address}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                    {formatDate(msg.received_at)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] truncate">
                  {msg.subject || "(No subject)"}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                  {truncate(msg.snippet || "", 100)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(msg.id, e)}
                disabled={deleting === msg.id}
                className="btn btn-ghost text-xs px-2 py-1 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
