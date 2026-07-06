export type Direction = "horizontal" | "vertical";

export interface Word {
  id: string;
  answer: string;
  clue: string;
  explanation: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  /** Source metadata for Islamic content */
  sourceMetadata?: {
    type: "quran" | "hadith_shahih" | "sirah" | "fiqh" | "arabic_vocab" | "general";
    reference?: string;
  };
}

export interface Cell {
  row: number;
  col: number;
  letter: string;
  isBlocked: boolean;
  isActive: boolean;
  wordIds: string[];
  number?: number;
}

export interface CrosswordGrid {
  rows: number;
  cols: number;
  cells: Cell[][];
  words: Word[];
  title: string;
  theme: string;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  subject: string;
  grade: number;
  grid: CrosswordGrid;
  words: Word[];
  createdAt: string;
  isDaily?: boolean;
}

export interface WordPlacement {
  word: string;
  clue: string;
  explanation: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  intersections: number;
}

export interface CrosswordLayout {
  grid: string[][];
  words: WordPlacement[];
  emptyCells: number;
  totalCells: number;
  score: number;
}
