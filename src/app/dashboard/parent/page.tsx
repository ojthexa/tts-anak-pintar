"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { SUBJECTS } from "@/lib/constants";

interface ChildProgress {
  id: string;
  name: string;
  grade: number;
  xp: number;
  level: number;
  totalPuzzles: number;
  completedPuzzles: number;
  averageScore: number;
  weakSubjects: string[];
  strongSubjects: string[];
  lastActive: string;
}

export default function ParentDashboard() {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sample children data (would come from parent_children table in production)
  const [children] = useState<ChildProgress[]>([
    {
      id: "1",
      name: "Ahmad",
      grade: 3,
      xp: 450,
      level: 5,
      totalPuzzles: 34,
      completedPuzzles: 30,
      averageScore: 82,
      weakSubjects: ["english", "arabic"],
      strongSubjects: ["islam", "quran"],
      lastActive: "2026-07-06T10:30:00Z",
    },
    {
      id: "2",
      name: "Siti",
      grade: 1,
      xp: 120,
      level: 2,
      totalPuzzles: 12,
      completedPuzzles: 10,
      averageScore: 90,
      weakSubjects: [],
      strongSubjects: ["islam", "english"],
      lastActive: "2026-07-05T14:00:00Z",
    },
  ]);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold clay-text mb-2">
            👨‍👩‍👧‍👦 Dashboard Orang Tua
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Pantau progress belajar anak-anak Anda
          </p>
        </motion.div>

        {/* Children Cards */}
        <div className="space-y-6">
          {children.map((child, i) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay-lg p-6"
            >
              {/* Child Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full clay-colored flex items-center justify-center text-3xl">
                  👶
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold clay-text">{child.name}</h2>
                  <p className="text-sm text-gray-500">
                    Kelas {child.grade} SD · Level {child.level} ·{" "}
                    {child.xp} XP
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Terakhir aktif</div>
                  <div className="font-semibold clay-text text-sm">
                    {new Date(child.lastActive).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: "🧩", label: "Total TTS", value: child.totalPuzzles.toString() },
                  { icon: "✅", label: "Selesai", value: child.completedPuzzles.toString() },
                  { icon: "⭐", label: "Rata-rata Skor", value: child.averageScore.toString() },
                  { icon: "📊", label: "Progress", value: `${Math.round((child.completedPuzzles / Math.max(child.totalPuzzles, 1)) * 100)}%` },
                ].map((stat) => (
                  <div key={stat.label} className="clay-sm p-3 text-center">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="font-bold clay-text">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Subject Analysis */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold clay-text mb-2 flex items-center gap-2">
                    <span>💪</span> Mata Pelajaran Kuat
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {child.strongSubjects.length > 0 ? (
                      child.strongSubjects.map((subj) => {
                        const subject = Object.entries(SUBJECTS).find(
                          ([key]) => key === subj
                        );
                        return (
                          <span
                            key={subj}
                            className="clay-sm px-3 py-1 text-xs font-semibold"
                          >
                            {subject?.[1]?.icon} {subject?.[1]?.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400">Belum ada data</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold clay-text mb-2 flex items-center gap-2">
                    <span>📚</span> Perlu Ditingkatkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {child.weakSubjects.length > 0 ? (
                      child.weakSubjects.map((subj) => {
                        const subject = Object.entries(SUBJECTS).find(
                          ([key]) => key === subj
                        );
                        return (
                          <span
                            key={subj}
                            className="clay-sm px-3 py-1 text-xs font-semibold bg-orange-50 dark:bg-orange-900/20"
                          >
                            {subject?.[1]?.icon} {subject?.[1]?.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-green-500">Semua baik! ✅</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/play?subject=${child.weakSubjects[0] || "islam"}&grade=${child.grade}`}
                  className="clay-sm px-4 py-2 text-sm font-semibold clay-text hover:scale-105 transition-all"
                >
                  🎮 Ajak Bermain
                </Link>
                <Link
                  href="/leaderboard"
                  className="clay-sm px-4 py-2 text-sm font-semibold clay-text hover:scale-105 transition-all"
                >
                  🏆 Lihat Peringkat
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-lg p-6 mt-6"
        >
          <h2 className="text-xl font-bold clay-text mb-4">
            💡 Rekomendasi Belajar
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: "📖",
                text: "Ajak anak bermain TTS setiap hari untuk membangun kebiasaan belajar.",
              },
              {
                icon: "🎯",
                text: "Fokus pada mata pelajaran yang masih lemah untuk meningkatkan pemahaman.",
              },
              {
                icon: "🏆",
                text: "Berikan semangat dengan melihat pencapaian dan peringkat mereka.",
              },
              {
                icon: "⏰",
                text: "Luangkan 15-20 menit setiap hari untuk bermain TTS bersama.",
              },
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 clay-sm p-3">
                <span className="text-xl">{rec.icon}</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
