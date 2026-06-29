import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veya — Disposable Email",
  description: "Layanan email sementara untuk testing dan privasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
