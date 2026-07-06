"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CrosswordGrid } from "@/types/crossword";

interface CrosswordGameProps {
  puzzle: CrosswordGrid;
  userGrid: string[][];
  currentRow: number;
  currentCol: number;
  selectedDirection: "horizontal" | "vertical";
  foundWords: Set<string>;
  onCellClick: (row: number, col: number) => void;
  onCellInput: (row: number, col: number, letter: string) => void;
}

export default function CrosswordGame({
  puzzle,
  userGrid,
  currentRow,
  currentCol,
  selectedDirection,
  foundWords,
  onCellClick,
  onCellInput,
}: CrosswordGameProps) {
  const { cells, rows, cols } = puzzle;

  return (
    <div className="clay-lg p-4 sm:p-6 overflow-x-auto">
      <div
        className="grid gap-[2px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 44}px`,
        }}
      >
        {cells.flat().map((cell, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const isActive = row === currentRow && col === currentCol;
          const isHighlighted =
            (selectedDirection === "horizontal" && row === currentRow) ||
            (selectedDirection === "vertical" && col === currentCol);
          const userLetter = userGrid[row]?.[col] || "";
          const isCorrect =
            userLetter &&
            userLetter.toUpperCase() === cell.letter.toUpperCase();

          // Check if cell is part of a found word
          const isPartOfFoundWord = cell.wordIds.some((id) =>
            foundWords.has(id)
          );

          return (
            <div
              key={`${row}-${col}`}
              className={cn(
                "relative",
                cell.isBlocked
                  ? ""
                  : "cursor-pointer"
              )}
            >
              {cell.isBlocked ? (
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-sm" />
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCellClick(row, col)}
                  className={cn(
                    "aspect-square w-full flex items-center justify-center",
                    "text-sm sm:text-base font-bold",
                    "rounded-sm transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8e6cf]",
                    "select-none",
                    isActive
                      ? "bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] text-white shadow-md scale-110 z-10"
                      : isHighlighted && !isPartOfFoundWord
                      ? "bg-gradient-to-br from-[#d4c5f9] to-[#b8a4e8] text-white"
                      : isPartOfFoundWord && isCorrect
                      ? "bg-gradient-to-br from-[#a8e6cf]/60 to-[#7ed5b0]/60 text-green-800 dark:text-green-200"
                      : isCorrect
                      ? "bg-gradient-to-br from-[#a8e6cf]/80 to-[#7ed5b0]/80 text-white"
                      : userLetter
                      ? "bg-gradient-to-br from-[#ffd3b6] to-[#ffb3a7] text-white"
                      : "bg-white dark:bg-gray-700 clay-pressed"
                  )}
                  style={{
                    minWidth: "36px",
                    minHeight: "36px",
                  }}
                >
                  <span className="relative z-10">{userLetter || ""}</span>
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 leading-none pointer-events-none select-none">
                      {cell.number}
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          );
        })}
      </div>

      {/* Word count indicator */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>
          ✅ {foundWords.size}/{puzzle.words.length} kata ditemukan
        </span>
        <span>
          🔄 Tekan Tab untuk ganti arah
        </span>
      </div>
    </div>
  );
}
