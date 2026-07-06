export type UserRole = "student" | "teacher" | "parent" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  grade?: number;
  xp: number;
  coins: number;
  level: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserStats {
  totalPuzzles: number;
  completedPuzzles: number;
  totalScore: number;
  averageTime: number;
  bestStreak: number;
  currentStreak: number;
  accuracy: number;
  subjectsCompleted: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  xpReward: number;
  coinsReward: number;
}

export type AchievementCategory =
  | "milestone"
  | "subject"
  | "streak"
  | "perfection"
  | "speed"
  | "social";

export interface AchievementRequirement {
  type: "puzzles_completed" | "words_found" | "streak_days" | "perfect_score"
      | "subject_mastery" | "speed_clear" | "level_reached" | "xp_earned";
  value: number;
  subject?: string;
  difficulty?: string;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  level: number;
  rank: number;
}
