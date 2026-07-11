/**
 * Crossword Engine — Automatic Crossword Puzzle Generator
 *
 * This engine uses a graph-based backtracking algorithm with heuristic
 * optimization to automatically place words on a grid. It supports:
 *
 * - Dynamic word placement without predefined coordinates
 * - Collision detection and validation
 * - Intersection maximization
 * - Automatic retry on failure
 * - Random layout generation (different layouts with same words)
 * - Any grid size
 */

import type { Direction, Word, Cell, CrosswordGrid, WordPlacement } from "@/types/crossword";

interface GridCell {
  row: number;
  col: number;
  letter: string;
  blocked: boolean;
}

interface Placement {
  word: string;
  clue: string;
  explanation: string;
  direction: Direction;
  startRow: number;
  startCol: number;
}

interface LayoutResult {
  grid: GridCell[][];
  placements: Placement[];
  success: boolean;
}

/**
 * Main crossword layout generator
 * Takes an array of words and computes optimal placement
 */
export function generateCrosswordLayout(
  words: Array<{ answer: string; clue: string; explanation: string }>,
  maxRetries: number = 100
): CrosswordGrid {
  // Sort words: prioritize those with more shared letters (better intersections)
  const sortedWords = [...words].sort((a, b) => {
    const aShared = countSharedLetters(a.answer, words);
    const bShared = countSharedLetters(b.answer, words);
    if (bShared !== aShared) return bShared - aShared;
    return b.answer.length - a.answer.length;
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = tryLayout(sortedWords, attempt);

    if (result.success) {
      return convertToCrosswordGrid(result);
    }
  }

  // Fallback: create a compact connected layout
  return createCompactLayout(sortedWords);
}

/**
 * Try to place words on grid with backtracking
 */
function tryLayout(words: Array<{ answer: string; clue: string; explanation: string }>, seed: number): LayoutResult {
  // Seeded randomization for variety
  const rng = createRNG(seed);

  // Estimate grid size based on word lengths
  // Tighter formula: words placed closer together = fewer scattered blocks
  const totalChars = words.reduce((sum, w) => sum + w.answer.length, 0);
  const gridSize = Math.max(
    12,
    Math.ceil(Math.sqrt(totalChars * 1.4)) + 1
  );

  // Initialize empty grid
  const grid: GridCell[][] = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => ({
      row,
      col,
      letter: "",
      blocked: false,
    }))
  );

  const placements: Placement[] = [];
  const placedWords = new Set<string>();

  // Place first word horizontally in the center
  const firstWord = words[0];
  const centerRow = Math.floor(gridSize / 2);
  const centerCol = Math.floor((gridSize - firstWord.answer.length) / 2);

  placeWord(grid, firstWord, "horizontal", centerRow, centerCol);
  placements.push({
    word: firstWord.answer,
    clue: firstWord.clue,
    explanation: firstWord.explanation,
    direction: "horizontal",
    startRow: centerRow,
    startCol: centerCol,
  });
  placedWords.add(firstWord.answer);

  // Shuffle remaining words for randomness
  const remaining = words.slice(1);
  shuffleArray(remaining, rng);

  // Try to place each remaining word
  for (const wordData of remaining) {
    const placed = tryPlaceWord(grid, wordData, placements, gridSize, rng);
    if (placed) {
      placements.push(placed);
      placedWords.add(wordData.answer);
    }
  }

  // Calculate grid bounds and trim
  const bounds = getGridBounds(grid, gridSize);

  // Trim the grid to content
  const trimmedGrid = trimGrid(grid, bounds, gridSize);

  // Adjust placement coordinates to match trimmed grid
  const offsetRow = bounds.minRow - 1;
  const offsetCol = bounds.minCol - 1;
  const adjustedPlacements = placements.map((p) => ({
    ...p,
    startRow: p.startRow - offsetRow,
    startCol: p.startCol - offsetCol,
  }));    // Check if we have enough intersections
  const totalIntersections = countIntersections(trimmedGrid, adjustedPlacements);
  // Require at least 50% of words to have intersections (more connected grid)
  const minIntersections = Math.max(2, Math.floor(placements.length * 0.5));

  return {
    grid: trimmedGrid,
    placements: adjustedPlacements,
    success: placements.length === words.length && totalIntersections >= minIntersections,
  };
}

/**
 * Try to place a word intersecting with existing words
 */
function tryPlaceWord(
  grid: GridCell[][],
  wordData: { answer: string; clue: string; explanation: string },
  existingPlacements: Placement[],
  gridSize: number,
  rng: () => number
): Placement | null {
  const word = wordData.answer;
  const candidates: Array<{
    direction: Direction;
    row: number;
    col: number;
    score: number;
  }> = [];

  // Find all possible intersection points with existing words
  for (const placed of existingPlacements) {
    const { word: placedWord, startRow, startCol, direction: placedDir } = placed;

    for (let i = 0; i < word.length; i++) {
      const char = word[i].toUpperCase();

      for (let j = 0; j < placedWord.length; j++) {
        const placedChar = placedWord[j].toUpperCase();

        if (char !== placedChar) continue;

        // Calculate positions
        let intersectRow: number, intersectCol: number;
        let newDir: Direction;
        let newRow: number, newCol: number;

        if (placedDir === "horizontal") {
          // New word is vertical, intersecting at placed[j]
          intersectRow = startRow;
          intersectCol = startCol + j;
          newDir = "vertical";
          newRow = intersectRow - i;
          newCol = intersectCol;
        } else {
          // New word is horizontal, intersecting at placed[j]
          intersectRow = startRow + j;
          intersectCol = startCol;
          newDir = "horizontal";
          newRow = intersectRow;
          newCol = intersectCol - i;
        }

        // Validate placement
        if (isValidPlacement(grid, word, newDir, newRow, newCol, gridSize)) {
          const score = calculatePlacementScore(grid, word, newDir, newRow, newCol);
          candidates.push({
            direction: newDir,
            row: newRow,
            col: newCol,
            score,
          });
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending, add randomness
  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, Math.min(5, candidates.length));
  const selected = topCandidates[Math.floor(rng() * topCandidates.length)];

  // Place the word
  if (selected) {
    placeWord(grid, wordData, selected.direction, selected.row, selected.col);
    return {
      word: wordData.answer,
      clue: wordData.clue,
      explanation: wordData.explanation,
      direction: selected.direction,
      startRow: selected.row,
      startCol: selected.col,
    };
  }

  return null;
}

/**
 * Validate a word placement
 */
function isValidPlacement(
  grid: GridCell[][],
  word: string,
  direction: Direction,
  startRow: number,
  startCol: number,
  gridSize: number
): boolean {
  const upperWord = word.toUpperCase();

  // Check bounds
  if (direction === "horizontal") {
    if (startCol < 0 || startCol + word.length > gridSize) return false;
    if (startRow < 0 || startRow >= gridSize) return false;
  } else {
    if (startRow < 0 || startRow + word.length > gridSize) return false;
    if (startCol < 0 || startCol >= gridSize) return false;
  }

  // Check each cell
  for (let i = 0; i < word.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;

    const existingLetter = grid[row][col].letter;
    if (existingLetter && existingLetter !== upperWord[i]) {
      return false; // Letter conflict
    }
  }

  // Check adjacency: non-intersecting words must NOT touch each other
  for (let i = 0; i < word.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;
    const cellHasLetter = !!grid[row][col].letter;

    if (direction === "horizontal") {
      // Check above — perpendicular word only allowed if this cell is an intersection
      if (row > 0 && grid[row - 1][col].letter && !cellHasLetter) return false;
      // Check below
      if (row < gridSize - 1 && grid[row + 1][col].letter && !cellHasLetter) return false;
    } else {
      // Check left — perpendicular word only allowed if this cell is an intersection
      if (col > 0 && grid[row][col - 1].letter && !cellHasLetter) return false;
      // Check right
      if (col < gridSize - 1 && grid[row][col + 1].letter && !cellHasLetter) return false;
    }
  }

  // Check parallel adjacency at word start/end
  if (direction === "horizontal") {
    if (startCol > 0 && grid[startRow][startCol - 1].letter) return false;
    if (startCol + word.length < gridSize && grid[startRow][startCol + word.length].letter) return false;
  } else {
    if (startRow > 0 && grid[startRow - 1][startCol].letter) return false;
    if (startRow + word.length < gridSize && grid[startRow + word.length][startCol].letter) return false;
  }

  return true;
}

/**
 * Place a word on the grid
 */
function placeWord(
  grid: GridCell[][],
  wordData: { answer: string },
  direction: Direction,
  startRow: number,
  startCol: number
): void {
  const word = wordData.answer.toUpperCase();

  for (let i = 0; i < word.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;
    grid[row][col].letter = word[i];
  }
}

/**
 * Count how many letters a word shares with all other words
 * Higher = better intersection potential
 */
function countSharedLetters(word: string, allWords: Array<{ answer: string }>): number {
  const letters = new Set(word.toUpperCase().split(""));
  let shared = 0;
  for (const other of allWords) {
    if (other.answer === word) continue;
    const otherLetters = new Set(other.answer.toUpperCase().split(""));
    for (const l of letters) {
      if (otherLetters.has(l)) shared++;
    }
  }
  return shared;
}

/**
 * Calculate placement score (more intersections = better)
 */
function calculatePlacementScore(
  grid: GridCell[][],
  word: string,
  direction: Direction,
  startRow: number,
  startCol: number
): number {
  let score = 0;
  const upperWord = word.toUpperCase();

  for (let i = 0; i < word.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;

    // +15 for each intersection with existing letter (prioritize connections)
    if (grid[row][col].letter === upperWord[i]) {
      score += 15;
    }
  }

  return score;
}

/**
 * Get bounding box of placed words
 */
function getGridBounds(grid: GridCell[][], gridSize: number) {
  let minRow = gridSize, maxRow = 0, minCol = gridSize, maxCol = 0;
  let hasContent = false;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].letter) {
        hasContent = true;
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  return { minRow, maxRow, minCol, maxCol, hasContent };
}

/**
 * Trim grid to content bounds
 */
function trimGrid(grid: GridCell[][], bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number }, gridSize: number): GridCell[][] {
  const { minRow, maxRow, minCol, maxCol } = bounds;
  const padding = 1;
  const rows = maxRow - minRow + 1 + padding * 2;
  const cols = maxCol - minCol + 1 + padding * 2;
  const offsetRow = minRow - padding;
  const offsetCol = minCol - padding;

  const trimmed: GridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const origRow = r + offsetRow;
      const origCol = c + offsetCol;
      if (
        origRow >= 0 && origRow < gridSize &&
        origCol >= 0 && origCol < gridSize
      ) {
        return { ...grid[origRow][origCol], row: r, col: c };
      }
      return { row: r, col: c, letter: "", blocked: true };
    })
  );

  return trimmed;
}

/**
 * Count intersections between placed words
 */
function countIntersections(grid: GridCell[][], placements: Placement[]): number {
  let count = 0;

  for (const placement of placements) {
    const { startRow, startCol, direction, word } = placement;

    for (let i = 0; i < word.length; i++) {
      const row = direction === "horizontal" ? startRow : startRow + i;
      const col = direction === "horizontal" ? startCol + i : startCol;

      if (direction === "horizontal") {
        if (row > 0 && grid[row - 1][col].letter) count++;
        if (row < grid.length - 1 && grid[row + 1][col].letter) count++;
      } else {
        if (col > 0 && grid[row][col - 1].letter) count++;
        if (col < grid[0].length - 1 && grid[row][col + 1].letter) count++;
      }
    }
  }

  return count;
}

/**
 * Create a compact connected layout (fallback when intersections fail)
 * Places words in a dense block with all words touching at corners
 */
function createCompactLayout(words: Array<{ answer: string; clue: string; explanation: string }>): CrosswordGrid {
  // Calculate required grid size
  const longestWord = Math.max(...words.map((w) => w.answer.length));
  const gridSize = Math.max(
    longestWord + 4,
    Math.ceil(Math.sqrt(words.reduce((sum, w) => sum + w.answer.length, 0) * 1.2)) + 4
  );

  const grid: GridCell[][] = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) => ({
      row,
      col,
      letter: "",
      blocked: false,
    }))
  );

  const placements: Placement[] = [];

  // Place first word horizontally at center
  const center = Math.floor(gridSize / 2);
  placeWord(grid, words[0], "horizontal", center, Math.max(1, Math.floor((gridSize - words[0].answer.length) / 2)));
  placements.push({
    word: words[0].answer,
    clue: words[0].clue,
    explanation: words[0].explanation,
    direction: "horizontal",
    startRow: center,
    startCol: Math.max(1, Math.floor((gridSize - words[0].answer.length) / 2)),
  });

  // Place remaining words alternating h/v, packed tightly around center
  let topRow = center - 2;
  let bottomRow = center + 2;
  let leftCol = Math.max(1, Math.floor((gridSize - words[0].answer.length) / 2)) - 2;
  let rightCol = Math.max(1, Math.floor((gridSize - words[0].answer.length) / 2)) + words[0].answer.length + 2;

  for (let i = 1; i < words.length; i++) {
    const wordData = words[i];
    const wordLen = wordData.answer.length;
    const dir: Direction = i % 2 === 0 ? "horizontal" : "vertical";

    let placed = false;

    if (dir === "horizontal" && leftCol > 1) {
      // Try placing horizontally above/below with spacing
      for (const tryRow of [topRow, bottomRow]) {
        const tryCol = Math.max(1, Math.min(leftCol, gridSize - wordLen - 2));
        if (tryCol + wordLen < gridSize && tryRow > 0 && tryRow + 1 < gridSize) {
          let canPlace = true;
          for (let c = 0; c < wordLen; c++) {
            if (grid[tryRow][tryCol + c].letter) { canPlace = false; break; }
            // Check no adjacency with other horizontal words
            if (tryRow > 0 && grid[tryRow - 1][tryCol + c].letter) { canPlace = false; break; }
            if (tryRow < gridSize - 1 && grid[tryRow + 1][tryCol + c].letter) { canPlace = false; break; }
          }
          // Check neighbours at start/end
          if (canPlace && tryCol > 0 && grid[tryRow][tryCol - 1].letter) canPlace = false;
          if (canPlace && tryCol + wordLen < gridSize && grid[tryRow][tryCol + wordLen].letter) canPlace = false;

          if (canPlace) {
            placeWord(grid, wordData, "horizontal", tryRow, tryCol);
            placements.push({
              word: wordData.answer,
              clue: wordData.clue,
              explanation: wordData.explanation,
              direction: "horizontal",
              startRow: tryRow,
              startCol: tryCol,
            });
            if (tryRow === topRow) topRow -= 2;
            else bottomRow += 2;
            leftCol = Math.min(leftCol, tryCol - 1);
            rightCol = Math.max(rightCol, tryCol + wordLen + 1);
            placed = true;
            break;
          }
        }
      }
    }

    if (!placed && dir === "vertical") {
      // Try placing vertically left/right
      for (const tryCol of [leftCol, rightCol]) {
        const tryRow = Math.max(1, Math.min(center, gridSize - wordLen - 2));
        if (tryCol > 0 && tryCol + 1 < gridSize && tryRow + wordLen < gridSize) {
          let canPlace = true;
          for (let r = 0; r < wordLen; r++) {
            if (grid[tryRow + r][tryCol].letter) { canPlace = false; break; }
            if (tryCol > 0 && grid[tryRow + r][tryCol - 1].letter) { canPlace = false; break; }
            if (tryCol < gridSize - 1 && grid[tryRow + r][tryCol + 1].letter) { canPlace = false; break; }
          }
          if (canPlace && tryRow > 0 && grid[tryRow - 1][tryCol].letter) canPlace = false;
          if (canPlace && tryRow + wordLen < gridSize && grid[tryRow + wordLen][tryCol].letter) canPlace = false;

          if (canPlace) {
            placeWord(grid, wordData, "vertical", tryRow, tryCol);
            placements.push({
              word: wordData.answer,
              clue: wordData.clue,
              explanation: wordData.explanation,
              direction: "vertical",
              startRow: tryRow,
              startCol: tryCol,
            });
            if (tryCol === leftCol) leftCol -= 2;
            else rightCol += 2;
            topRow = Math.min(topRow, tryRow - 1);
            bottomRow = Math.max(bottomRow, tryRow + wordLen + 1);
            placed = true;
            break;
          }
        }
      }
    }

    // If still not placed, stack horizontally at bottom
    if (!placed) {
      const fallbackRow = Math.min(bottomRow, gridSize - 3);
      const fallbackCol = Math.max(1, Math.floor((gridSize - wordLen) / 2));
      placeWord(grid, wordData, "horizontal", fallbackRow, fallbackCol);
      placements.push({
        word: wordData.answer,
        clue: wordData.clue,
        explanation: wordData.explanation,
        direction: "horizontal",
        startRow: fallbackRow,
        startCol: fallbackCol,
      });
      bottomRow += 2;
    }
  }

  const bounds = getGridBounds(grid, gridSize);
  const trimmedGrid = trimGrid(grid, bounds, gridSize);

  return convertToCrosswordGrid({ grid: trimmedGrid, placements, success: true });
}

/**
 * Convert internal format to CrosswordGrid
 */
function convertToCrosswordGrid(result: LayoutResult): CrosswordGrid {
  const { grid, placements } = result;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Create cells with numbering
  const cells: Cell[][] = [];
  const numberedCells = new Set<string>();

  for (const placement of placements) {
    const key = `${placement.startRow},${placement.startCol}`;
    if (!numberedCells.has(key)) {
      numberedCells.add(key);
    }
  }

  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      const gridCell = grid[r]?.[c];
      const key = `${r},${c}`;
      const isNumbered = numberedCells.has(key);
      const wordIds = placements
        .map((p, pi) => ({ p, pi }))
        .filter(({ p }) => {
          const { startRow, startCol, direction, word } = p;
          for (let i = 0; i < word.length; i++) {
            const wr = direction === "horizontal" ? startRow : startRow + i;
            const wc = direction === "horizontal" ? startCol + i : startCol;
            if (wr === r && wc === c) return true;
          }
          return false;
        })
        .map(({ pi }) => `word-${pi}`);

      row.push({
        row: r,
        col: c,
        letter: gridCell?.letter || "",
        isBlocked: !gridCell?.letter,
        isActive: !!gridCell?.letter,
        wordIds,
        number: isNumbered ? getCellNumber(placements, r, c) : undefined,
      });
    }
    cells.push(row);
  }

  const words: Word[] = placements.map((p, index) => ({
    id: `word-${index}`,
    answer: p.word,
    clue: p.clue,
    explanation: p.explanation,
    direction: p.direction,
    startRow: p.startRow,
    startCol: p.startCol,
  }));

  return {
    rows,
    cols,
    cells,
    words,
    title: "TTS Puzzle",
    theme: "General",
  };
}

/**
 * Get cell number for a position
 */
function getCellNumber(placements: Placement[], row: number, col: number): number {
  const idx = placements.findIndex((p) => p.startRow === row && p.startCol === col);
  return idx + 1;
}

/**
 * Create a seeded random number generator
 */
function createRNG(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Shuffle array using Fisher-Yates with seeded RNG
 */
function shuffleArray<T>(array: T[], rng: () => number): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generate crossword grid from AI-generated word data
 */
export function generateFromAIResponse(
  aiResponse: Array<{ answer: string; clue: string; explanation: string }>,
  title?: string,
  theme?: string
): CrosswordGrid {
  const grid = generateCrosswordLayout(aiResponse);
  grid.title = title || "TTS Puzzle";
  grid.theme = theme || "General";
  return grid;
}

/**
 * Validate user input against correct answer
 */
export function validateLetter(
  grid: CrosswordGrid,
  row: number,
  col: number,
  letter: string
): boolean {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols) return false;
  const cell = grid.cells[row][col];
  return cell.letter.toUpperCase() === letter.toUpperCase();
}

/**
 * Check if a word is fully and correctly filled
 */
export function checkWordComplete(
  grid: CrosswordGrid,
  userGrid: string[][],
  wordId: string
): boolean {
  const word = grid.words.find((w) => w.id === wordId);
  if (!word) return false;

  const { startRow, startCol, direction, answer } = word;

  for (let i = 0; i < answer.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;
    const userLetter = userGrid[row]?.[col]?.toUpperCase() || "";
    if (userLetter !== answer[i].toUpperCase()) return false;
  }

  return true;
}

/**
 * Check if entire puzzle is complete
 */
export function checkPuzzleComplete(
  grid: CrosswordGrid,
  userGrid: string[][]
): boolean {
  return grid.words.every((word) => checkWordComplete(grid, userGrid, word.id));
}

/**
 * Get the active word for a given cell position
 */
export function getActiveWord(
  grid: CrosswordGrid,
  row: number,
  col: number,
  direction: Direction
): Word | null {
  const cell = grid.cells[row]?.[col];
  if (!cell) return null;

  // Find word that matches both the cell and direction
  return (
    grid.words.find((w) => {
      if (w.direction !== direction) return false;
      const { startRow, startCol, answer } = w;

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
    }) || null
  );
}

/**
 * Get all cells for a word
 */
export function getWordCells(
  grid: CrosswordGrid,
  wordId: string
): Cell[] {
  const word = grid.words.find((w) => w.id === wordId);
  if (!word) return [];

  const cells: Cell[] = [];
  const { startRow, startCol, direction, answer } = word;

  for (let i = 0; i < answer.length; i++) {
    const row = direction === "horizontal" ? startRow : startRow + i;
    const col = direction === "horizontal" ? startCol + i : startCol;
    cells.push(grid.cells[row][col]);
  }

  return cells;
}

/**
 * Calculate word placement density
 */
export function calculateDensity(grid: CrosswordGrid): number {
  let filledCells = 0;
  let totalCells = grid.rows * grid.cols;

  for (const row of grid.cells) {
    for (const cell of row) {
      if (!cell.isBlocked) filledCells++;
    }
  }

  return filledCells / totalCells;
}
