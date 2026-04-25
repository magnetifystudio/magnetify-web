"use client";
import { useState, useEffect } from "react";

export function OfferTimer({
  expiryAt,
  color,
  size,
}: {
  expiryAt: string;
  color: string;
  size: "small" | "medium" | "large";
}) {
  const [time, setTime] = useState({ h: "00", m: "00", s: "00" });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiryAt).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTime({
        h: String(Math.floor(diff / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiryAt]);

  if (expired) return null;

  const textSize = { small: "text-[13px]", medium: "text-[16px]", large: "text-[20px]" }[size];

  return (
    <div
      className="mt-2 rounded-xl px-3 py-2 flex items-center justify-center gap-1.5"
      style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="font-black text-[12px]" style={{ color }}> : </span>}
          <span className={`font-black ${textSize}`} style={{ color }}>{val}</span>
        </span>
      ))}
      <span className="text-[9px] font-black uppercase tracking-widest ml-1" style={{ color: `${color}80` }}>left</span>
    </div>
  );
}