"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode as QrCodeIcon, LogOut, RefreshCw } from "lucide-react";
import { createAddress, extendAddress, type Message } from "@/lib/api";
import { generateRandomUsername } from "@/lib/utils";
import { AddressBar } from "../components/AddressBar";
import { MessageList } from "../components/MessageList";
import { MessageViewer } from "../components/MessageViewer";
import { QRCodeModal } from "../components/QRCodeModal";
import { ThemeToggle } from "../components/ThemeToggle";

export default function InboxPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("tempmail_token");
    if (!storedToken) {
      router.push("/");
      return;
    }
    setToken(storedToken);
    generateNewAddress(storedToken);
  }, [router]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("tempmail_token");
    router.push("/");
  };

  // Generate new address
  const generateNewAddress = async (token: string) => {
    try {
      setLoading(true);
      const username = generateRandomUsername();
      const data = await createAddress(token, username, 10); // 10 menit default
      setAddressId(data.id);
      setAddress(data.address);
      setExpiresAt(data.expires_at);
    } catch (error) {
      console.error("Failed to create address:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extend address
  const handleExtend = async () => {
    if (!token || !addressId) return;
    try {
      const data = await extendAddress(token, addressId, 10); // Tambah 10 menit
      setExpiresAt(data.expires_at);
    } catch (error) {
      console.error("Failed to extend address:", error);
    }
  };

  // Refresh messages
  const handleRefresh = () => {
    // MessageList udah auto-refresh
  };

  // Handle select message
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  // Handle delete message
  const handleDeleteMessage = () => {
    setSelectedMessage(null);
  };

  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">TempMail</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRCode(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Show QR Code"
          >
            <QrCodeIcon className="h-5 w-5 text-muted-foreground" />
          </button>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="btn btn-secondary gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-4 max-w-4xl w-full mx-auto">
        {/* Address Bar */}
        <AddressBar
          address={address}
          addressId={addressId || ""}
          expiresAt={expiresAt}
          onGenerateNew={() => generateNewAddress(token)}
          onExtend={handleExtend}
        />

        {/* Message Content */}
        <div className="flex-1 flex gap-4">
          {selectedMessage ? (
            <MessageViewer
              token={token}
              messageId={selectedMessage.id}
              onBack={() => setSelectedMessage(null)}
              onDelete={handleDeleteMessage}
            />
          ) : (
            <MessageList
              token={token}
              addressId={addressId || ""}
              onSelectMessage={handleSelectMessage}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        email={address}
      />
    </div>
  );
}
