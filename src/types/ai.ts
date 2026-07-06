import type { Direction } from "./crossword";
import type { Subject as GameSubject, Difficulty } from "./game";

export interface AIWordRequest {
  answer: string;
  clue: string;
  explanation: string;
  direction: Direction;
  startRow?: number;
  startCol?: number;
}

export interface AIWordResponse {
  answer: string;
  clue: string;
  explanation: string;
  direction: "horizontal" | "vertical";
  start: [number, number];
}

export interface AIGenerateRequest {
  subject: GameSubject;
  grade: number;
  difficulty: Difficulty;
  wordCount: number;
  language?: "id" | "en";
  theme?: string;
}

export interface AIGenerateResponse {
  title: string;
  theme: string;
  words: AIWordResponse[];
  sourceMetadata?: Array<{
    word: string;
    type: "quran" | "hadith_shahih" | "sirah" | "fiqh" | "arabic_vocab" | "general";
    reference?: string;
  }>;
}

export interface AICacheEntry {
  request: AIGenerateRequest;
  response: AIGenerateResponse;
  createdAt: string;
  usageCount: number;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  cachedResponses: number;
  costEstimate: number;
}
