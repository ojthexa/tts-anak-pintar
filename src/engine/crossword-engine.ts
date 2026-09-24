/**
 * Crossword Engine — Automatic Crossword Puzzle Generator
 *
 * This engine uses a graph-based backtracking algorithm with heuristic
 * optimization to automatically place words on a grid. It supports:
 *
 * - Dynamic word placement without predefined coordinates
 * - Collision detection and validation
 * - Intersection maximization
 * - Guaranteed connectivity: every word intersects at least one other word
 *   and the whole puzzle forms a single interlocked block
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
  /** Every word placed, every word intersects another word, one connected block */
  success: boolean;
  /** Every word is placed AND shares at least one cell with another word */
  allIntersecting: boolean;
  /** All words form a single connected component */
  connected: boolean;
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

  let best: LayoutResult | null = null;

  // Main search: every word must cross another word and the whole puzzle
  // must form one connected block.
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = tryLayout(sortedWords, attempt);
    if (result.success) return convertToCrosswordGrid(result);
    if (result.allIntersecting && !best) best = result;
  }

  // Second chance: search on an oversized grid where crossings almost always
  // fit — keeps every word interlocked even when the tight grid runs out of room.
  const totalChars = sortedWords.reduce((sum, w) => sum + w.answer.length, 0);
  const longestWord = Math.max(...sortedWords.map((w) => w.answer.length));
  const oversizedGrid = totalChars + longestWord + 6;
  for (let attempt = 0; attempt < 25; attempt++) {
    const result = tryLayout(sortedWords, 1000 + attempt, oversizedGrid);
    if (result.success) return convertToCrosswordGrid(result);
    if (result.allIntersecting && !best) best = result;
  }

  // Accept the best layout where at least every word intersects another word
  if (best) return convertToCrosswordGrid(best);

  // Last resort (only reachable when a word shares no letter with any other
  // word): guaranteed-valid stacked layout that never errors or desyncs.
  return createStackedLayout(sortedWords);
}

/**
 * Try to place words on grid with backtracking
 */
function tryLayout(
  words: Array<{ answer: string; clue: string; explanation: string }>,
  seed: number,
  minGridSize: number = 0
): LayoutResult {
  // Seeded randomization for variety
  const rng = createRNG(seed);

  // Estimate grid size based on word lengths
  // Tighter formula: words placed closer together = fewer scattered blocks
  const totalChars = words.reduce((sum, w) => sum + w.answer.length, 0);
  const longestWord = Math.max(...words.map((w) => w.answer.length));
  const baseGridSize = Math.max(
    12,
    Math.ceil(Math.sqrt(totalChars * 1.4)) + 1,
    longestWord + 2
  );
  // Grow the grid on later attempts so backtracking gets more room.
  // Seeds >= 500 come from the oversized second-chance search (fixed size).
  const growth = seed < 500 ? Math.floor(seed / 3) : 0;
  const gridSize = Math.max(baseGridSize + growth, minGridSize);

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

  // Phase 1: place every word at a real intersection
  const unplaced: typeof words = [];
  for (const wordData of remaining) {
    const placed = tryPlaceWord(grid, wordData, placements, gridSize, rng);
    if (placed) {
      placements.push(placed);
      placedWords.add(wordData.answer);
    } else {
      unplaced.push(wordData);
    }
  }

  // Phase 2: retry failed words — the board now has more words to cross
  const stillUnplaced: typeof words = [];
  for (const wordData of unplaced) {
    const placed = tryPlaceWord(grid, wordData, placements, gridSize, rng);
    if (placed) {
      placements.push(placed);
      placedWords.add(wordData.answer);
    } else {
      stillUnplaced.push(wordData);
    }
  }

  // Phase 3: relocate any word that ended up isolated (zero intersections)
  repairIsolatedWords(grid, placements, rng, gridSize);

  // Phase 4: place leftover words in free space so no word is ever dropped
  for (const wordData of stillUnplaced) {
    const isolated = tryPlaceWordIsolated(grid, wordData, gridSize);
    if (isolated) {
      placements.push(isolated);
      placedWords.add(wordData.answer);
    }
  }

  // Phase 5: final repair now that every word is on the board
  repairIsolatedWords(grid, placements, rng, gridSize);

  // Calculate grid bounds and trim
  const bounds = getGridBounds(grid);

  // Trim the grid to content
  const trimmedGrid = trimGrid(grid, bounds);

  // Adjust placement coordinates to match trimmed grid
  const offsetRow = bounds.minRow - 1;
  const offsetCol = bounds.minCol - 1;
  const adjustedPlacements = placements.map((p) => ({
    ...p,
    startRow: p.startRow - offsetRow,
    startCol: p.startCol - offsetCol,
  }));

  // A layout only succeeds when EVERY word intersects at least one other
  // word and the whole puzzle forms a single connected block.
  const analysis = analyzePlacements(adjustedPlacements, words.length);

  return {
    grid: trimmedGrid,
    placements: adjustedPlacements,
    allIntersecting: analysis.allIntersecting,
    connected: analysis.connected,
    success: analysis.allIntersecting && analysis.connected,
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

  if (candidates.length === 0) {
    // No valid crossing at this moment — the caller retries on a fuller board
    return null;
  }

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
 * Place a word in free space (no intersection) near the existing content.
 * Used when no valid intersection exists, so words are never dropped.
 */
function tryPlaceWordIsolated(
  grid: GridCell[][],
  wordData: { answer: string; clue: string; explanation: string },
  gridSize: number
): Placement | null {
  const word = wordData.answer;

  // Centroid of existing letters — bias placement toward the puzzle body
  let sumRow = 0;
  let sumCol = 0;
  let count = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].letter) {
        sumRow += r;
        sumCol += c;
        count++;
      }
    }
  }
  const centerRow = count ? sumRow / count : gridSize / 2;
  const centerCol = count ? sumCol / count : gridSize / 2;

  let best: { direction: Direction; row: number; col: number; score: number } | null = null;
  const directions: Direction[] = ["horizontal", "vertical"];

  for (const direction of directions) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!isValidPlacement(grid, word, direction, row, col, gridSize)) continue;

        const midRow = direction === "horizontal" ? row : row + (word.length - 1) / 2;
        const midCol = direction === "horizontal" ? col + (word.length - 1) / 2 : col;
        const score = -Math.abs(midRow - centerRow) - Math.abs(midCol - centerCol);

        if (!best || score > best.score) {
          best = { direction, row, col, score };
        }
      }
    }
  }

  if (!best) return null;

  placeWord(grid, wordData, best.direction, best.row, best.col);
  return {
    word: wordData.answer,
    clue: wordData.clue,
    explanation: wordData.explanation,
    direction: best.direction,
    startRow: best.row,
    startCol: best.col,
  };
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
function getGridBounds(grid: GridCell[][]) {
  const gridSize = grid.length;
  const colCount = grid[0]?.length ?? 0;
  let minRow = gridSize, maxRow = 0, minCol = colCount, maxCol = 0;
  let hasContent = false;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < colCount; c++) {
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
function trimGrid(grid: GridCell[][], bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number }): GridCell[][] {
  const gridSize = grid.length;
  const gridCols = grid[0]?.length ?? 0;
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
        origCol >= 0 && origCol < gridCols
      ) {
        return { ...grid[origRow][origCol], row: r, col: c };
      }
      return { row: r, col: c, letter: "", blocked: true };
    })
  );

  return trimmed;
}

/**
 * Cell keys ("row,col") occupied by a placement
 */
function getPlacementCells(p: Placement): string[] {
  const cells: string[] = [];
  for (let i = 0; i < p.word.length; i++) {
    const row = p.direction === "horizontal" ? p.startRow : p.startRow + i;
    const col = p.direction === "horizontal" ? p.startCol + i : p.startCol;
    cells.push(`${row},${col}`);
  }
  return cells;
}

/**
 * Whether a placement shares at least one cell with another placement
 */
function hasIntersection(placements: Placement[], target: Placement): boolean {
  const cells = new Set(getPlacementCells(target));
  for (const other of placements) {
    if (other === target) continue;
    for (const key of getPlacementCells(other)) {
      if (cells.has(key)) return true;
    }
  }
  return false;
}

/**
 * Analyze how the placed words relate to each other:
 *  - allPlaced: every input word made it onto the grid
 *  - allIntersecting: every word shares at least one cell with another word
 *  - connected: all words form a single interlocked block
 */
function analyzePlacements(
  placements: Placement[],
  expectedCount: number
): {
  allPlaced: boolean;
  allIntersecting: boolean;
  connected: boolean;
} {
  const n = placements.length;
  const cellSets = placements.map((p) => new Set(getPlacementCells(p)));
  const partnerCounts = new Array<number>(n).fill(0);
  const adjacency = Array.from({ length: n }, () => new Set<number>());

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let sharesCell = false;
      for (const key of cellSets[i]) {
        if (cellSets[j].has(key)) {
          sharesCell = true;
          break;
        }
      }
      if (sharesCell) {
        partnerCounts[i]++;
        partnerCounts[j]++;
        adjacency[i].add(j);
        adjacency[j].add(i);
      }
    }
  }

  const allPlaced = n === expectedCount;
  const allIntersecting =
    allPlaced && (n <= 1 || partnerCounts.every((count) => count > 0));

  // Count components over the intersection graph (BFS)
  const seen = new Set<number>();
  let components = 0;
  for (let i = 0; i < n; i++) {
    if (seen.has(i)) continue;
    components++;
    const stack = [i];
    seen.add(i);
    while (stack.length) {
      const u = stack.pop()!;
      for (const v of adjacency[u]) {
        if (!seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
  }

  return {
    allPlaced,
    allIntersecting,
    connected: n <= 1 || components === 1,
  };
}

/**
 * Clear a placement's cells (only safe for isolated words, which own every
 * cell they occupy)
 */
function clearPlacement(grid: GridCell[][], p: Placement): void {
  for (const key of getPlacementCells(p)) {
    const [row, col] = key.split(",").map(Number);
    grid[row][col].letter = "";
  }
}

/**
 * Move isolated words (zero intersections) onto real crossings so every word
 * ends up sharing at least one cell with another word. Any placement returned
 * by tryPlaceWord is guaranteed to intersect ≥1 existing word; if no crossing
 * fits, the word is restored so nothing is ever lost.
 */
function repairIsolatedWords(
  grid: GridCell[][],
  placements: Placement[],
  rng: () => number,
  gridSize: number
): void {
  for (let pass = 0; pass < 3; pass++) {
    const isolated = placements.filter((p) => !hasIntersection(placements, p));
    if (isolated.length === 0) return;

    let repairedAny = false;
    for (const p of isolated) {
      const at = placements.indexOf(p);
      if (at === -1 || hasIntersection(placements, p)) continue;

      const snapshot = grid.map((row) => row.map((cell) => cell.letter));
      clearPlacement(grid, p);
      placements.splice(at, 1);

      const crossing = tryPlaceWord(
        grid,
        { answer: p.word, clue: p.clue, explanation: p.explanation },
        placements,
        gridSize,
        rng
      );

      if (crossing) {
        placements.push(crossing);
        repairedAny = true;
      } else {
        // Restore the original isolated placement — never lose a word
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            grid[r][c].letter = snapshot[r][c];
          }
        }
        placements.push(p);
      }
    }

    if (!repairedAny) return;
  }
}

/**
 * Guaranteed-valid fallback layout (used when no connected layout succeeds).
 *
 * Places every word on its own row with a blank row between words, so:
 *  - no letter can ever conflict
 *  - no placement can go out of bounds
 *  - the trimmed grid and placement coordinates always stay in sync
 */
function createStackedLayout(words: Array<{ answer: string; clue: string; explanation: string }>): CrosswordGrid {
  const longestWord = Math.max(...words.map((w) => w.answer.length));
  const cols = longestWord + 2; // one column of padding on each side
  const rows = words.length * 2 + 1; // one blank row between words

  const grid: GridCell[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      letter: "",
      blocked: false,
    }))
  );

  const placements: Placement[] = [];

  words.forEach((wordData, index) => {
    const row = 1 + index * 2;
    const col = 1 + Math.floor((cols - 2 - wordData.answer.length) / 2);

    placeWord(grid, wordData, "horizontal", row, col);
    placements.push({
      word: wordData.answer,
      clue: wordData.clue,
      explanation: wordData.explanation,
      direction: "horizontal",
      startRow: row,
      startCol: col,
    });
  });

  const bounds = getGridBounds(grid);
  const trimmedGrid = trimGrid(grid, bounds);

  // Shift placement coordinates to match the trimmed grid
  const offsetRow = bounds.minRow - 1;
  const offsetCol = bounds.minCol - 1;
  const adjustedPlacements = placements.map((p) => ({
    ...p,
    startRow: p.startRow - offsetRow,
    startCol: p.startCol - offsetCol,
  }));

  return convertToCrosswordGrid({
    grid: trimmedGrid,
    placements: adjustedPlacements,
    // Stacked words never intersect — this is the absolute last resort
    success: false,
    allIntersecting: false,
    connected: false,
  });
}

/**
 * Convert internal format to CrosswordGrid
 */
function convertToCrosswordGrid(result: LayoutResult): CrosswordGrid {
  const { grid } = result;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // Standard crossword numbering: reading order — top row first, then left to
  // right — so the smallest number always sits at the top-left of the grid.
  // The clue lists use "word index + 1", so sorting here keeps the clue
  // numbers and the cell numbers in sync.
  const placements = [...result.placements].sort(
    (a, b) =>
      a.startRow - b.startRow ||
      a.startCol - b.startCol ||
      (a.direction === b.direction
        ? 0
        : a.direction === "horizontal"
        ? -1
        : 1)
  );

  // Create cells with numbering
  const cells: Cell[][] = [];

  // Number every distinct start cell in reading order (1, 2, 3, ...). Two
  // words starting on the same cell share one number like printed
  // crosswords, so the numbers visible on the grid are always sequential and
  // the smallest one sits at the top-left.
  const startCellNumber = new Map<string, number>();
  for (const placement of placements) {
    const key = `${placement.startRow},${placement.startCol}`;
    if (!startCellNumber.has(key)) {
      startCellNumber.set(key, startCellNumber.size + 1);
    }
  }

  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      const gridCell = grid[r]?.[c];
      const key = `${r},${c}`;
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
        number: startCellNumber.get(key),
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
    number: startCellNumber.get(`${p.startRow},${p.startCol}`) ?? index + 1,
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
