"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { listMessages, deleteMessage, type Message } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";

interface MessageListProps {
  token: string;
  addressId: string;
  onSelectMessage: (message: Message) => void;
  onRefresh: () => void;
}

export function MessageList({
  token,
  addressId,
  onSelectMessage,
  onRefresh,
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await listMessages(token, addressId);
      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(messageId);
      await deleteMessage(token, messageId);
      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [token, addressId]);

  // Skeleton Loading
  const SkeletonItem = () => (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="skeleton h-4 w-32 rounded"></div>
            <div className="skeleton h-3 w-20 rounded"></div>
          </div>
          <div className="skeleton h-4 w-full rounded mb-1"></div>
          <div className="skeleton h-3 w-48 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (loading && messages.length === 0) {
    return (
      <div className="card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Inbox</h3>
            <button
              onClick={onRefresh}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Refresh
            </button>
          </div>
        </div>
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <Mail className="h-12 w-12 mb-4 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">No messages yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Send an email to this address
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Inbox</h3>
          <button
            onClick={onRefresh}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => onSelectMessage(message)}
            className="p-4 cursor-pointer message-item"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">
                    {truncate(message.from_address, 30)}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(message.received_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground truncate">
                    {truncate(message.subject || "(No Subject)", 40)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {truncate(message.snippet || "", 60)}
                </p>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={(e) => handleDelete(message.id, e)}
                  disabled={deletingId === message.id}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  {deletingId === message.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
