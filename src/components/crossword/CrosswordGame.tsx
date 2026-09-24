"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CrosswordGrid } from "@/types/crossword";

import type { Word } from "@/types/crossword";

interface CrosswordGameProps {
  puzzle: CrosswordGrid;
  userGrid: string[][];
  currentRow: number;
  currentCol: number;
  selectedDirection: "horizontal" | "vertical";
  foundWords: Set<string>;
  activeWord: Word | null;
  onCellClick: (row: number, col: number) => void;
  onCellInput: (row: number, col: number, letter: string) => void;
}

type CellVariant =
  | "active"
  | "highlight"
  | "found"
  | "correct"
  | "wrong"
  | "empty";

/**
 * Cell styles per state. Pastel backgrounds are light in BOTH light and dark
 * mode, so they always pair with dark text — white on pastel is unreadable
 * (~1.4:1 contrast).
 */
const CELL_VARIANT_CLASSES: Record<CellVariant, string> = {
  active:
    "bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] text-gray-900 shadow-md scale-110 z-10",
  highlight: "bg-gradient-to-br from-[#d4c5f9] to-[#b8a4e8] text-gray-900",
  found:
    "bg-gradient-to-br from-[#a8e6cf]/60 to-[#7ed5b0]/60 text-green-900 dark:text-green-950",
  correct:
    "bg-gradient-to-br from-[#a8e6cf]/80 to-[#7ed5b0]/80 text-green-900",
  wrong: "bg-gradient-to-br from-[#ffd3b6] to-[#ffb3a7] text-gray-900",
  empty: "bg-white dark:bg-gray-700 clay-pressed",
};

export default function CrosswordGame({
  puzzle,
  userGrid,
  currentRow,
  currentCol,
  selectedDirection,
  foundWords,
  activeWord,
  onCellClick,
  onCellInput,
}: CrosswordGameProps) {
  const { cells, rows, cols } = puzzle;

  return (
    <div className="clay-lg p-3 sm:p-6 overflow-x-auto">
      <div
        className="grid gap-1 sm:gap-[2px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 34}px`,
        }}
      >
        {cells.flat().map((cell, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const isActive = row === currentRow && col === currentCol;
          // Only highlight cells WITHIN the active word, not entire row/column
          const isHighlighted = activeWord
            ? (() => {
                const { startRow, startCol, direction, answer } = activeWord;
                if (direction === "horizontal") {
                  return (
                    row === startRow &&
                    col >= startCol &&
                    col < startCol + answer.length
                  );
                } else {
                  return (
                    col === startCol &&
                    row >= startRow &&
                    row < startRow + answer.length
                  );
                }
              })()
            : false;
          const userLetter = userGrid[row]?.[col] || "";
          const isCorrect =
            userLetter &&
            userLetter.toUpperCase() === cell.letter.toUpperCase();

          // Check if cell is part of a found word
          const isPartOfFoundWord = cell.wordIds.some((id) =>
            foundWords.has(id)
          );

          // Visual variant drives background AND text color (dark text on
          // pastel backgrounds so letters stay readable in both modes)
          const variant: CellVariant = isActive
            ? "active"
            : isHighlighted && !isPartOfFoundWord
            ? "highlight"
            : isPartOfFoundWord && isCorrect
            ? "found"
            : isCorrect
            ? "correct"
            : userLetter
            ? "wrong"
            : "empty";

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
                <div className="aspect-square bg-[#dde2ec] dark:bg-[#39415a] rounded-sm" />
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCellClick(row, col)}
                  className={cn(
                    "aspect-square w-full flex items-center justify-center",
                    "text-xs sm:text-sm font-bold",
                    "rounded-sm transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8e6cf]",
                    "select-none touch-manipulation",
                    // On mobile the board shrinks to fit the screen instead of
                    // overflowing behind the dark panel edges; on larger
                    // screens cells keep a comfortable 28px minimum.
                    "min-h-0 min-w-0 sm:min-h-7 sm:min-w-7",
                    CELL_VARIANT_CLASSES[variant]
                  )}
                >
                  <span className="relative z-10 text-[11px]">{userLetter || ""}</span>
                  {cell.number && (
                    <span
                      className={cn(
                        "absolute top-0 left-0.5 text-[7px] font-bold leading-none pointer-events-none select-none",
                        variant === "empty"
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-800"
                      )}
                    >
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
