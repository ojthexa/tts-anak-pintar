/**
 * Game scoring service
 * Handles score calculation, XP, combos, and rewards
 */

import { SCORING, XP } from "@/lib/constants";
import type { GameResult, Difficulty } from "@/types/game";

export interface ScoreResult {
  score: number;
  xpEarned: number;
  coinsEarned: number;
  combo: number;
  bonuses: string[];
}

/**
 * Calculate score for finding a word
 */
export function calculateWordScore(
  wordLength: number,
  wrongAttempts: number,
  hintsUsed: number,
  currentCombo: number
): ScoreResult {
  let score = SCORING.CORRECT_WORD + wordLength;
  const bonuses: string[] = [];

  // Wrong attempt penalty
  score += wrongAttempts * SCORING.WRONG_ATTEMPT;

  // Hint penalty
  score -= hintsUsed * SCORING.HINT_LETTER;

  // Combo bonus
  if (currentCombo > 1) {
    const comboMultiplier = 1 + (currentCombo - 1) * 0.1;
    score = Math.round(score * comboMultiplier);
    bonuses.push(`Combo x${comboMultiplier.toFixed(1)}`);
  }

  const xpEarned = XP.PER_CORRECT_WORD + wordLength;
  const coinsEarned = Math.max(1, Math.floor(score / 5));

  return {
    score,
    xpEarned,
    coinsEarned,
    combo: currentCombo,
    bonuses,
  };
}

/**
 * Calculate final puzzle completion score
 */
export function calculateFinalScore(
  totalWords: number,
  wordsFound: number,
  totalTimeSeconds: number,
  hintsUsed: number,
  wrongAttempts: number,
  maxCombo: number,
  difficulty: Difficulty
): GameResult {
  const accuracy = wordsFound / totalWords;
  const baseScore = wordsFound * SCORING.CORRECT_WORD;
  const timeBonus = calculateTimeBonus(totalTimeSeconds, difficulty);
  const accuracyBonus = calculateAccuracyBonus(accuracy);
  const comboBonus = calculateComboBonus(maxCombo);
  const hintPenalty = hintsUsed * SCORING.HINT_LETTER;
  const wrongPenalty = wrongAttempts * SCORING.WRONG_ATTEMPT;

  const totalScore = Math.max(0,
    baseScore + timeBonus + accuracyBonus + comboBonus - hintPenalty - wrongPenalty
  );

  // XP calculation
  const xpEarned = Math.round(
    XP.PER_CORRECT_WORD * wordsFound +
    XP.PER_PUZZLE_COMPLETE +
    (totalTimeSeconds < 120 ? XP.PER_STREAK_DAY * 5 : 0) +
    (accuracy === 1 ? XP.PER_ACHIEVEMENT : 0)
  );

  // Coins calculation
  const coinsEarned = Math.max(1, Math.floor(totalScore / 3));

  // Determine bonuses
  const bonuses: string[] = [];
  if (timeBonus > 0) bonuses.push("Kecepatan!");
  if (accuracy === 1) bonuses.push("Sempurna!");
  if (maxCombo >= 3) bonuses.push(`Kombo x${maxCombo}!`);
  if (hintsUsed === 0) bonuses.push("Tanpa Petunjuk!");

  return {
    puzzleId: "",
    score: totalScore,
    time: totalTimeSeconds,
    hintsUsed,
    wordsFound,
    totalWords,
    accuracy,
    xpEarned,
    coinsEarned,
    combo: maxCombo,
  };
}

/**
 * Calculate time bonus
 */
function calculateTimeBonus(seconds: number, difficulty: Difficulty): number {
  const thresholds: Record<Difficulty, number> = {
    easy: 120,
    medium: 180,
    hard: 300,
  };

  const threshold = thresholds[difficulty] || 180;
  if (seconds < threshold) {
    const ratio = (threshold - seconds) / threshold;
    return Math.round(ratio * SCORING.TIME_BONUS_POINTS * 10);
  }

  return 0;
}

/**
 * Calculate accuracy bonus
 */
function calculateAccuracyBonus(accuracy: number): number {
  if (accuracy >= 0.9) return 15;
  if (accuracy >= 0.75) return 10;
  if (accuracy >= 0.5) return 5;
  return 0;
}

/**
 * Calculate combo bonus
 */
function calculateComboBonus(maxCombo: number): number {
  if (maxCombo <= 1) return 0;
  return maxCombo * (maxCombo - 1) * 2;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / XP.LEVEL_BASE)) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return Math.round(XP.LEVEL_BASE * Math.pow(XP.LEVEL_MULTIPLIER, currentLevel));
}

/**
 * Apply difficulty multiplier
 */
export function difficultyMultiplier(difficulty: Difficulty): number {
  const multipliers: Record<Difficulty, number> = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };
  return multipliers[difficulty] || 1;
}
