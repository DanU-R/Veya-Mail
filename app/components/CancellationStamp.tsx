"use client";

import { useEffect, useState } from "react";

interface CancellationStampProps {
  expiresAt: number;
  onExpire?: () => void;
}

export function CancellationStamp({ expiresAt, onExpire }: CancellationStampProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const total = expiresAt - (expiresAt - 600); // 600s = 10 min default
    let mounted = true;

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const left = Math.max(0, expiresAt - now);
      const pct = Math.max(0, Math.min(100, (left / 600) * 100));

      if (!mounted) return;

      setTimeLeft(left);
      setProgress(pct);
      setIsUrgent(left > 0 && left <= 60);

      if (left <= 0) {
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => { mounted = false; clearInterval(id); };
  }, [expiresAt, onExpire]);

  const fmt = (s: number) => {
    if (s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Circle geometry
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress / 100);

  return (
    <div
      className={`flex items-center gap-3 ${isUrgent ? "stamp-pulse" : ""}`}
      style={{ transform: "rotate(-8deg)" }}
      role="timer"
      aria-label={`${Math.floor(timeLeft / 60)} minutes and ${timeLeft % 60} seconds remaining`}
    >
      {/* SVG Ring */}
      <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
        {/* Background ring */}
        <circle
          cx="42" cy="42" r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="3"
        />
        {/* Progress ring */}
        <circle
          cx="42" cy="42" r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stamp-ring-fill"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
      </svg>

      {/* Center text */}
      <div className="flex flex-col -ml-20" style={{ width: 84, alignItems: "center" }}>
        <span className="font-mono text-sm font-medium leading-none">
          {fmt(timeLeft)}
        </span>
        <span className="font-sans text-[10px] text-[var(--color-text-muted)] leading-tight mt-0.5">
          remaining
        </span>
      </div>
    </div>
  );
}
