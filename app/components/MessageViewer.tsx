"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { getMessage, type MessageDetail } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface MessageViewerProps {
  token: string;
  messageId: string;
  onBack: () => void;
  onDelete: () => void;
}

export function MessageViewer({
  token,
  messageId,
  onBack,
  onDelete,
}: MessageViewerProps) {
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHtml, setShowHtml] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const data = await getMessage(token, messageId);
        setMessage(data);
      } catch (error) {
        console.error("Failed to fetch message:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [token, messageId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm">Sanitizing content...</span>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="skeleton h-6 w-48 rounded mb-4"></div>
          <div className="skeleton h-4 w-full rounded mb-2"></div>
          <div className="skeleton h-4 w-full rounded mb-2"></div>
          <div className="skeleton h-4 w-3/4 rounded"></div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground">Message not found</p>
      </div>
    );
  }

  // Sanitize HTML untuk iframe (lebih aman)
  const sanitizeHtml = (html: string | null) => {
    if (!html) return "";
    // Hapus script, iframe, style, dll.
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/on\w+="[^"]*"/g, "") // Hapus event handlers
      .replace(/javascript:/gi, "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h2 className="text-lg font-semibold truncate">
            {message.subject || "(No Subject)"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHtml(!showHtml)}
            className="btn btn-secondary gap-1.5"
          >
            {showHtml ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{showHtml ? "HTML" : "Text"}</span>
          </button>
          <button
            onClick={onDelete}
            className="btn btn-danger gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Message Info */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium truncate">{message.from_address}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium truncate">testveya@aivenue.web.id</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{formatDate(message.received_at)}</span>
          </div>
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-auto p-4">
        {showHtml && message.html_body ? (
          <div className="prose dark:prose-invert max-w-none bg-secondary p-4 rounded-lg">
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.html_body) }}
            />
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg overflow-auto">
            {message.text_body || "No text content"}
          </pre>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>Content sanitized for security</span>
        </div>
      </div>
    </div>
  );
}
