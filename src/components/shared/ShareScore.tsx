"use client";

import { useState } from "react";
import type { GameResult } from "@/types/game";
import { formatTime } from "@/lib/utils";

interface ShareScoreProps {
  result: GameResult;
  puzzleTitle: string;
}

export default function ShareScore({ result, puzzleTitle }: ShareScoreProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const shareText = `🧩 TTS Anak Pintar\n━━━━━━━━━━━━━━\n📖 ${puzzleTitle}\n━━━━━━━━━━━━━━\n⭐ Skor: ${result.score}\n🏆 XP: +${result.xpEarned}\n⏱️ Waktu: ${formatTime(result.time)}\n🎯 Akurasi: ${Math.round(result.accuracy * 100)}%\n🔥 Kombo: ${result.combo}x\n━━━━━━━━━━━━━━\nAyo main TTS Anak Pintar! 🎮\n`;

  const handleShare = async () => {
    // Try Web Share API first
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `TTS Anak Pintar - ${puzzleTitle}`,
          text: shareText,
          url: window.location.origin,
        });
        setShared(true);
        return;
      } catch {
        // User cancelled or API not available
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
      alert("Salin teks berikut:\n\n" + shareText);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="clay-sm px-4 py-2 text-sm font-semibold clay-text hover:scale-105 transition-all flex items-center gap-2"
      aria-label="Bagikan skor"
    >
      {copied ? "✅ Tersalin!" : shared ? "✅ Terbagi!" : "📤 Bagikan Skor"}
    </button>
  );
}
