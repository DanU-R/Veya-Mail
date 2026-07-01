// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tempmail-worker.danuranggana9.workers.dev";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string): Promise<Response> {
  const headers = new Headers(options.headers);
  if (token) headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "API Error");
  }
  return response;
}

// AUTH
export async function login(password: string): Promise<{ token: string }> {
  const response = await fetchWithAuth("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return response.json();
}

// DOMAINS
export async function getDomains(token: string): Promise<{ domains: string[] }> {
  const response = await fetchWithAuth("/api/domains", { method: "GET" }, token);
  return response.json();
}

// ADDRESSES
export async function createAddress(
  token: string,
  username?: string,
  ttlMinutes?: number,
  domain?: string
): Promise<{ id: string; address: string; created_at: number; expires_at: number }> {
  const response = await fetchWithAuth(
    "/api/addresses",
    {
      method: "POST",
      body: JSON.stringify({ username, ttl_minutes: ttlMinutes, domain }),
    },
    token
  );
  return response.json();
}

export async function getAddress(
  token: string, addressId: string
): Promise<{ id: string; address: string; created_at: number; expires_at: number; is_expired: boolean }> {
  const response = await fetchWithAuth(`/api/addresses/${addressId}`, { method: "GET" }, token);
  return response.json();
}

export async function extendAddress(
  token: string, addressId: string, ttlMinutes?: number
): Promise<{ id: string; expires_at: number }> {
  const response = await fetchWithAuth(`/api/addresses/${addressId}/extend`, {
    method: "POST",
    body: JSON.stringify({ ttl_minutes: ttlMinutes }),
  }, token);
  return response.json();
}

// MESSAGES
export interface Message { id: string; from_address: string; subject: string; snippet: string; received_at: number; }

export async function listMessages(token: string, addressId: string): Promise<{ messages: Message[] }> {
  const response = await fetchWithAuth(`/api/addresses/${addressId}/messages`, { method: "GET" }, token);
  return response.json();
}

export interface MessageDetail extends Message { html_body: string | null; text_body: string | null; }

export async function getMessage(token: string, messageId: string): Promise<MessageDetail> {
  const response = await fetchWithAuth(`/api/messages/${messageId}`, { method: "GET" }, token);
  return response.json();
}

export async function deleteMessage(token: string, messageId: string): Promise<{ success: boolean }> {
  const response = await fetchWithAuth(`/api/messages/${messageId}`, { method: "DELETE" }, token);
  return response.json();
}

export async function deleteAllMessages(token: string, addressId: string): Promise<{ success: boolean }> {
  const response = await fetchWithAuth(`/api/addresses/${addressId}/messages`, { method: "DELETE" }, token);
  return response.json();
}