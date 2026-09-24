/**
 * Puzzle Sync Tests
 *
 * Ensures the crossword engine produces a valid, error-free layout for every
 * prebuilt puzzle and that the generated grid stays perfectly in sync with the
 * puzzle's word list (answers, clues, cell letters, word membership).
 *
 * Checks per puzzle:
 *  1. Every word is placed (none dropped)
 *  2. Every placement fits inside the grid bounds
 *  3. Cell letters match each answer exactly (no letter conflicts)
 *  4. Every lettered cell belongs to at least one word
 *  5. Filling the grid with the answers completes the puzzle
 */

import { describe, it, expect } from "bun:test";
import {
  generateCrosswordLayout,
  checkWordComplete,
  checkPuzzleComplete,
} from "../crossword-engine";
import { PREBUILT_PUZZLES } from "@/data/puzzles";

describe("prebuilt puzzle layouts", () => {
  for (const puzzle of PREBUILT_PUZZLES) {
    describe(`${puzzle.icon} ${puzzle.title}`, () => {
      // The game page generates layouts with 50 retries — test the same path
      const grid = generateCrosswordLayout(puzzle.words, 50);

      it("places every word from the puzzle (nothing dropped)", () => {
        expect(grid.words.length).toBe(puzzle.words.length);

        const placed = grid.words.map((w) => w.answer).sort();
        const expected = puzzle.words.map((w) => w.answer).sort();
        expect(placed).toEqual(expected);

        // Clues & explanations must travel with their answers
        for (const word of grid.words) {
          const source = puzzle.words.find((w) => w.answer === word.answer);
          expect(source).toBeDefined();
          expect(word.clue).toBe(source!.clue);
          expect(word.explanation).toBe(source!.explanation);
        }
      });

      it("keeps every placement inside the grid bounds", () => {
        for (const word of grid.words) {
          const endRow =
            word.direction === "horizontal"
              ? word.startRow
              : word.startRow + word.answer.length - 1;
          const endCol =
            word.direction === "horizontal"
              ? word.startCol + word.answer.length - 1
              : word.startCol;

          expect(word.startRow).toBeGreaterThanOrEqual(0);
          expect(word.startCol).toBeGreaterThanOrEqual(0);
          expect(endRow).toBeLessThan(grid.rows);
          expect(endCol).toBeLessThan(grid.cols);
        }
      });

      it("has cell letters exactly matching each answer (no conflicts)", () => {
        for (const word of grid.words) {
          for (let i = 0; i < word.answer.length; i++) {
            const row =
              word.direction === "horizontal" ? word.startRow : word.startRow + i;
            const col =
              word.direction === "horizontal" ? word.startCol + i : word.startCol;

            const cell = grid.cells[row]?.[col];
            expect(cell).toBeDefined();
            expect(cell!.isBlocked).toBe(false);
            expect(cell!.letter).toBe(word.answer[i]);
          }
        }
      });

      it("marks every lettered cell as part of at least one word", () => {
        for (const row of grid.cells) {
          for (const cell of row) {
            if (!cell.isBlocked) {
              expect(cell.wordIds.length).toBeGreaterThan(0);
            }
          }
        }
      });

      it("is completable: filling in the answers finishes the puzzle", () => {
        const userGrid = grid.cells.map((row) =>
          row.map((cell) => (cell.isBlocked ? "" : cell.letter))
        );

        for (const word of grid.words) {
          expect(checkWordComplete(grid, userGrid, word.id)).toBe(true);
        }
        expect(checkPuzzleComplete(grid, userGrid)).toBe(true);
      });
    });
  }
});
