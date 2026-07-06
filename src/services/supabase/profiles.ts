/**
 * User profile data access service
 */

import { getSupabaseClient } from "./client";
import type { UserProfile, UserStats, LeaderboardEntry } from "@/types/user";

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    role: data.role,
    grade: data.grade,
    xp: data.xp,
    coins: data.coins,
    level: data.level,
    createdAt: data.created_at,
    lastLoginAt: data.last_login_at,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "displayName" | "avatarUrl" | "grade">>
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const dbUpdates: Record<string, unknown> = {};

  if (updates.displayName) dbUpdates.display_name = updates.displayName;
  if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.grade) dbUpdates.grade = updates.grade;

  const { error } = await supabase
    .from("profiles")
    .update(dbUpdates)
    .eq("id", userId);

  return !error;
}

/**
 * Add XP and coins to user
 */
export async function addReward(
  userId: string,
  xp: number,
  coins: number
): Promise<void> {
  const supabase = getSupabaseClient();

  // Get current values
  const profile = await getProfile(userId);
  if (!profile) return;

  const newXp = profile.xp + xp;
  const newCoins = profile.coins + coins;
  const newLevel = calculateLevel(newXp);

  await supabase
    .from("profiles")
    .update({
      xp: newXp,
      coins: newCoins,
      level: newLevel,
    })
    .eq("id", userId);

  // Check for level up achievements
  if (newLevel > profile.level) {
    await checkLevelAchievements(userId, newLevel);
  }
}

/**
 * Calculate level from XP
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Check and award level-based achievements
 */
async function checkLevelAchievements(userId: string, level: number): Promise<void> {
  const supabase = getSupabaseClient();

  const levelAchievements = [
    { level: 5, achievementId: "level_5" },
    { level: 10, achievementId: "level_10" },
    { level: 25, achievementId: "level_25" },
    { level: 50, achievementId: "level_50" },
  ];

  for (const la of levelAchievements) {
    if (level >= la.level) {
      await supabase.from("user_achievements").upsert({
        user_id: userId,
        achievement_id: la.achievementId,
      });
    }
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, xp, level")
    .order("xp", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((item, index) => ({
    userId: item.id,
    displayName: item.display_name,
    avatarUrl: item.avatar_url,
    score: item.xp,
    level: item.level,
    rank: index + 1,
  }));
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", userId);

  return (
    data?.map((ua) => ({
      userId: ua.user_id,
      achievementId: ua.achievement_id,
      unlockedAt: ua.unlocked_at,
      achievement: ua.achievements,
    })) || []
  );
}

/**
 * Award achievement
 */
export async function awardAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("user_achievements").upsert({
    user_id: userId,
    achievement_id: achievementId,
  });

  return !error;
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = getSupabaseClient();

  const { data: attempts } = await supabase
    .from("puzzle_attempts")
    .select("*")
    .eq("user_id", userId);

  const attempts_ = attempts || [];

  return {
    totalPuzzles: attempts_.length,
    completedPuzzles: attempts_.filter((a) => a.completed).length,
    totalScore: attempts_.reduce((sum, a) => sum + (a.score || 0), 0),
    averageTime: attempts_.length > 0
      ? attempts_.reduce((sum, a) => sum + (a.time_seconds || 0), 0) / attempts_.length
      : 0,
    bestStreak: 0, // Compute from login history
    currentStreak: 0,
    accuracy: attempts_.length > 0
      ? attempts_.reduce((sum, a) => sum + (a.accuracy || 0), 0) / attempts_.length
      : 0,
    subjectsCompleted: {},
  };
}

/**
 * Get all users (admin)
 */
export async function getAllUsers(limit: number = 50) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Update user role (admin)
 */
export async function updateUserRole(
  userId: string,
  role: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  return !error;
}
