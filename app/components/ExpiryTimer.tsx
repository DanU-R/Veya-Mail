"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ExpiryTimerProps {
  expiresAt: number;
  onExpire?: () => void;
}

export function ExpiryTimer({ expiresAt, onExpire }: ExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const left = expiresAt - now;
      return left > 0 ? left : 0;
    };

    const updateTimer = () => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      
      // Calculate progress (0-100%)
      const totalDuration = expiresAt - (expiresAt - 600); // 10 menit default
      const currentProgress = (left / totalDuration) * 100;
      setProgress(Math.max(0, Math.min(100, currentProgress)));
      
      if (left <= 0) {
        onExpire?.();
      }
    };

    setTimeLeft(calculateTimeLeft());
    updateTimer();

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Expired";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>Expires in {formatTime(timeLeft)}</span>
      </div>
      <div className="progress-bar mt-1">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
