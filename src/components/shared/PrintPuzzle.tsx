"use client";

import { playClickSound } from "@/services/game/audio";
import type { CrosswordGrid } from "@/types/crossword";

interface PrintPuzzleProps {
  puzzle: CrosswordGrid;
  userGrid: string[][];
}

export default function PrintPuzzle({ puzzle, userGrid }: PrintPuzzleProps) {
  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="clay-sm px-3 py-1.5 text-sm font-semibold clay-text hover:scale-105 transition-all flex items-center gap-1.5 no-print"
      aria-label="Cetak TTS"
    >
      🖨️ Cetak
    </button>
  );
}
