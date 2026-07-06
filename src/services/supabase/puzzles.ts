/**
 * Puzzle data access service
 */

import { getSupabaseClient } from "./client";
import type { CrosswordPuzzle } from "@/types/crossword";
import type { GameResult, Subject, Difficulty } from "@/types/game";

/**
 * Save a generated puzzle
 */
export async function savePuzzle(puzzle: CrosswordPuzzle): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("puzzles")
    .insert({
      id: puzzle.id,
      title: puzzle.title,
      theme: puzzle.theme,
      difficulty: puzzle.difficulty,
      subject: puzzle.subject,
      grade: puzzle.grade,
      grid_data: JSON.stringify(puzzle.grid),
      words: JSON.stringify(puzzle.words),
      is_daily: puzzle.isDaily || false,
      created_at: puzzle.createdAt,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error saving puzzle:", error);
    return null;
  }

  return data.id;
}

/**
 * Get daily puzzle
 */
export async function getDailyPuzzle(): Promise<CrosswordPuzzle | null> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("is_daily", true)
    .gte("created_at", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return formatPuzzleData(data);
}

/**
 * Get puzzle by ID
 */
export async function getPuzzleById(id: string): Promise<CrosswordPuzzle | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return formatPuzzleData(data);
}

/**
 * Get cached AI puzzle
 */
export async function getCachedPuzzle(
  subject: Subject,
  grade: number,
  difficulty: Difficulty
): Promise<CrosswordPuzzle | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("subject", subject)
    .eq("grade", grade)
    .eq("difficulty", difficulty)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return formatPuzzleData(data);
}

/**
 * Save game attempt
 */
export async function saveGameAttempt(
  userId: string,
  puzzleId: string,
  result: GameResult
): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from("puzzle_attempts").insert({
    user_id: userId,
    puzzle_id: puzzleId,
    score: result.score,
    time_seconds: result.time,
    hints_used: result.hintsUsed,
    words_found: result.wordsFound,
    total_words: result.totalWords,
    accuracy: result.accuracy,
    xp_earned: result.xpEarned,
    coins_earned: result.coinsEarned,
    completed: true,
  });
}

/**
 * Get user's puzzle history
 */
export async function getUserPuzzleHistory(
  userId: string,
  limit: number = 20
) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("puzzle_attempts")
    .select("*, puzzles(title, subject, difficulty, grade)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("puzzle_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true);

  if (!data || data.length === 0) {
    return {
      totalPuzzles: 0,
      totalScore: 0,
      averageTime: 0,
      totalXp: 0,
      accuracy: 0,
    };
  }

  return {
    totalPuzzles: data.length,
    totalScore: data.reduce((sum, a) => sum + a.score, 0),
    averageTime: data.reduce((sum, a) => sum + a.time_seconds, 0) / data.length,
    totalXp: data.reduce((sum, a) => sum + a.xp_earned, 0),
    accuracy: data.reduce((sum, a) => sum + a.accuracy, 0) / data.length,
  };
}

/**
 * Format puzzle data from database
 */
function formatPuzzleData(data: Record<string, unknown>): CrosswordPuzzle {
  return {
    id: data.id as string,
    title: data.title as string,
    theme: data.theme as string,
    difficulty: data.difficulty as Difficulty,
    subject: data.subject as string,
    grade: data.grade as number,
    grid: typeof data.grid_data === "string"
      ? JSON.parse(data.grid_data)
      : data.grid_data,
    words: typeof data.words === "string"
      ? JSON.parse(data.words as string)
      : data.words,
    createdAt: data.created_at as string,
    isDaily: data.is_daily as boolean,
  };
}

/**
 * Get all puzzles (admin)
 */
export async function getAllPuzzles(limit: number = 50, offset: number = 0) {
  const supabase = getSupabaseClient();
  const { data, count } = await supabase
    .from("puzzles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  return { puzzles: data || [], total: count || 0 };
}

/**
 * Delete a puzzle (admin)
 */
export async function deletePuzzle(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("puzzles").delete().eq("id", id);
  return !error;
}

/**
 * Approve a puzzle (admin)
 */
export async function approvePuzzle(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("puzzles")
    .update({ approved: true })
    .eq("id", id);
  return !error;
}
