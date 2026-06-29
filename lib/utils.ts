// Format Unix timestamp ke string
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

// Potong text buat snippet
export function truncate(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) return text || "";
  return text.slice(0, maxLength) + "…";
}

// Generate random username (3-8 karakter)
export function generateRandomUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 6) + 3;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
