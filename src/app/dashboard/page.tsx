"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { SUBJECTS, ACHIEVEMENTS } from "@/lib/constants";
import { formatTime, formatDate } from "@/lib/utils";
import { getUserStats, getUserPuzzleHistory } from "@/services/supabase/puzzles";

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPuzzles: 0,
    totalScore: 0,
    averageTime: 0,
    totalXp: 0,
    accuracy: 0,
    currentStreak: 0,
  });
  const [recentGames, setRecentGames] = useState<Array<{
    id: string;
    score: number;
    xp_earned: number;
    time_seconds: number;
    words_found: number;
    total_words: number;
    accuracy: number;
    created_at: string;
  }>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load real stats from database
  useEffect(() => {
    if (!profile?.id) return;
    const loadStats = async () => {
      try {
        const data = await getUserStats(profile.id);
        setStats({
          totalPuzzles: data.totalPuzzles,
          totalScore: data.totalScore,
          averageTime: data.averageTime,
          totalXp: data.totalXp,
          accuracy: data.accuracy,
          currentStreak: 0,
        });
      } catch {
        // Use defaults
      }
    };
    loadStats();

    const loadHistory = async () => {
      try {
        const data = await getUserPuzzleHistory(profile.id, 5);
        setRecentGames(data || []);
      } catch {
        // Use empty
      }
    };
    loadHistory();
  }, [profile?.id]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🧩
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-lg p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full clay-colored flex items-center justify-center text-4xl">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "👤"
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold clay-text mb-1">
                Halo, {profile.displayName}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {profile.role === "student" ? "Siswa" : profile.role === "teacher" ? "Guru" : "Orang Tua"} 
                {" "}· Level {profile.level}
              </p>
            </div>

            {/* XP & Coins */}
            <div className="flex gap-4">
              <div className="clay-sm px-4 py-3 text-center">
                <div className="text-lg font-bold clay-text">{profile.xp} XP</div>
                <div className="text-xs text-gray-500">Total XP</div>
              </div>
              <div className="clay-sm px-4 py-3 text-center">
                <div className="text-lg font-bold clay-text">{profile.coins} 🪙</div>
                <div className="text-xs text-gray-500">Koin</div>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Level {profile.level}</span>
              <span>Level {profile.level + 1}</span>
            </div>
            <div className="clay-inset h-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((profile.xp % 100) / 100) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#a8e6cf] to-[#7ed5b0] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "🧩", label: "Total TTS", value: stats.totalPuzzles.toString() },
            { icon: "⭐", label: "Total Skor", value: stats.totalScore.toString() },
            { icon: "⚡", label: "Rata-rata Waktu", value: formatTime(Math.round(stats.averageTime)) },
            { icon: "🎯", label: "Akurasi", value: `${Math.round(stats.accuracy * 100)}%` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay p-4 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-lg font-bold clay-text">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold clay-text mb-4">Mulai Bermain</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📅", label: "Daily Puzzle", href: "/game?mode=daily", desc: "Tantangan hari ini" },
              { icon: "🎲", label: "Random", href: "/play", desc: "TTS acak" },
              { icon: "📚", label: "Practice", href: "/play", desc: "Pilih pelajaran" },
              { icon: "⚡", label: "Challenge", href: "/play", desc: "Mode cepat" },
            ].map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="clay p-4 hover:scale-[1.02] transition-all duration-200"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h3 className="font-bold clay-text">{action.label}</h3>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Subjects Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold clay-text mb-4">Mata Pelajaran</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(SUBJECTS).map(([key, subject]) => (
              <Link
                key={key}
                href={`/play?subject=${key}`}
                className="clay p-4 hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{subject.icon}</span>
                  <h3 className="font-bold clay-text">{subject.label}</h3>
                </div>
                <div className="clay-inset h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.random() * 60}%`,
                      backgroundColor: subject.color,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold clay-text mb-4">Pencapaian</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ACHIEVEMENTS.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="clay-sm p-3 text-center hover:scale-[1.02] transition-all"
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-bold clay-text">
                  {achievement.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  +{achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold clay-text mb-4">🎮 Riwayat Game Terakhir</h2>
          {recentGames.length > 0 ? (
            <div className="clay overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full clay-colored flex items-center justify-center text-lg">
                      🧩
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold clay-text text-sm">
                          Skor {game.score}
                        </span>
                        <span className="text-xs bg-gradient-to-r from-[#a8e6cf]/20 to-[#d4c5f9]/20 px-2 py-0.5 rounded-full">
                          +{game.xp_earned} XP
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {game.words_found}/{game.total_words} kata · {formatTime(game.time_seconds)} · {Math.round(game.accuracy * 100)}% akurasi
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {formatDate(game.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="clay p-8 text-center">
              <div className="text-3xl mb-2">🎮</div>
              <p className="text-gray-500 text-sm">
                Belum ada riwayat game. Yuk main sekarang!
              </p>
              <Link
                href="/play"
                className="clay-sm mt-4 px-6 py-2 font-semibold clay-text inline-block hover:scale-105 transition-all"
              >
                🚀 Mulai Bermain
              </Link>
            </div>
          )}
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold clay-text mb-4">Integrasi</h2>
          <Link
            href="/dashboard/github"
            className="clay p-4 sm:p-6 hover:scale-[1.02] transition-all duration-200 flex items-center gap-4"
          >
            <div className="text-4xl">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor" style={{ color: "#4a5568" }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold clay-text text-lg">GitHub</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cari repositori, lihat bintang, dan jelajahi kode publik
              </p>
            </div>
            <div className="clay-sm px-4 py-2 text-sm font-semibold clay-text">
              Buka →
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
