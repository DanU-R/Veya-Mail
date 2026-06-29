// Format timestamp ke tanggal yang mudah dibaca
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merge (buat avoid conflict)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Unix timestamp ke string
// Contoh: 1782718818 -> "29 Jun 2026, 15:33"
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format sisa waktu (countdown)
// Contoh: 300 detik -> "5m 0s"
export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return "Expired";
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Potong text buat snippet
// Contoh: "Ini email panjang..." -> "Ini email pan..."
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Copy text ke clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback buat browser lama
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

// Generate random username (3-8 karakter alfanumerik)
export function generateRandomUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 6) + 3; // 3-8 karakter
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
