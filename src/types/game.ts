export type GameMode = "daily" | "random" | "practice" | "challenge";
export type Difficulty = "easy" | "medium" | "hard";
export type Subject =
  | "islam"
  | "quran"
  | "hadith"
  | "arabic"
  | "english"
  | "general";

export interface GameConfig {
  mode: GameMode;
  subject?: Subject;
  grade: number;
  difficulty: Difficulty;
  wordCount?: number;
}

export interface GameState {
  puzzleId: string;
  mode: GameMode;
  grid: string[][];
  userGrid: string[][];
  currentRow: number;
  currentCol: number;
  selectedDirection: "horizontal" | "vertical";
  startTime: number;
  elapsedTime: number;
  isCompleted: boolean;
  score: number;
  combo: number;
  hintsUsed: number;
  lettersRevealed: number;
  wordsRevealed: number;
  wrongAttempts: number;
  foundWords: Set<string>;
  activeWordId: string | null;
}

export interface GameResult {
  puzzleId: string;
  score: number;
  time: number;
  hintsUsed: number;
  wordsFound: number;
  totalWords: number;
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  combo: number;
}

export interface PracticeConfig {
  subject: Subject;
  grade: number;
  difficulty: Difficulty;
}

export interface ChallengeConfig {
  subject?: Subject;
  grade: number;
  difficulty: Difficulty;
  timeLimit: number; // minutes
}
