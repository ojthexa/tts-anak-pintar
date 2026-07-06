import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format time in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format XP number
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Get today's date seed for daily puzzle
 */
export function getDailySeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Get grade label in Indonesian
 */
export function getGradeLabel(grade: number): string {
  const labels: Record<number, string> = {
    1: "Kelas 1 SD",
    2: "Kelas 2 SD",
    3: "Kelas 3 SD",
    4: "Kelas 4 SD",
    5: "Kelas 5 SD",
    6: "Kelas 6 SD",
  };
  return labels[grade] || `Kelas ${grade}`;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
  };
  return colors[difficulty] || "text-gray-500";
}

/**
 * Get difficulty badge color
 */
export function getDifficultyBadge(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-700";
}

/**
 * Get subject emoji
 */
export function getSubjectEmoji(subject: string): string {
  const emojis: Record<string, string> = {
    islam: "🕌",
    quran: "📖",
    hadith: "📜",
    arabic: "🖋️",
    english: "🔤",
    general: "🌟",
  };
  return emojis[subject] || "📝";
}

/**
 * Get subject color
 */
export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    islam: "#a8e6cf",
    quran: "#d4c5f9",
    hadith: "#f8b4c8",
    arabic: "#ffd3b6",
    english: "#b8d4e3",
    general: "#ffeba7",
  };
  return colors[subject] || "#e6e9f0";
}
