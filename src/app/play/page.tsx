"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS, DIFFICULTIES, GRADES } from "@/lib/constants";
import type { GameMode, Subject, Difficulty } from "@/types/game";

export default function PlayPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [subject, setSubject] = useState<Subject>("islam");
  const [grade, setGrade] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const handleStartGame = () => {
    const params = new URLSearchParams({
      mode: selectedMode || "random",
      subject,
      grade: grade.toString(),
      difficulty,
    });
    router.push(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-3xl sm:text-4xl font-bold clay-text mb-2">
            Pilih Mode Bermain
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Pilih cara kamu ingin bermain!
          </p>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {gameModes.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedMode(mode.id as GameMode)}
              className={`clay p-6 text-left hover:scale-[1.02] transition-all duration-200 ${
                selectedMode === mode.id
                  ? "ring-2 ring-[#a8e6cf]"
                  : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{mode.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold clay-text mb-1">
                    {mode.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mode.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {mode.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#a8e6cf]/20 to-[#d4c5f9]/20 clay-text"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Configuration Panel */}
        <AnimatePresence>
          {selectedMode && selectedMode !== "daily" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="clay-lg p-6 sm:p-8 mb-8"
            >
              <h2 className="text-2xl font-bold clay-text mb-6 text-center">
                Atur Permainan
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-semibold clay-text mb-3">
                    Mata Pelajaran
                  </label>
                  <div className="space-y-2">
                    {Object.entries(SUBJECTS).map(([key, subj]) => (
                      <button
                        key={key}
                        onClick={() => setSubject(key as Subject)}
                        className={`clay-sm w-full p-3 flex items-center gap-2 hover:scale-[1.02] transition-all ${
                          subject === key ? "ring-2 ring-[#a8e6cf]" : ""
                        }`}
                      >
                        <span className="text-xl">{subj.icon}</span>
                        <span className="text-sm font-semibold clay-text">
                          {subj.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-semibold clay-text mb-3">
                    Kelas
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`clay-sm p-3 text-center hover:scale-[1.02] transition-all ${
                          grade === g ? "ring-2 ring-[#a8e6cf]" : ""
                        }`}
                      >
                        <div className="text-lg mb-1">
                          {["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"][g - 1]}
                        </div>
                        <div className="text-xs font-bold clay-text">
                          Kelas {g}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-sm font-semibold clay-text mb-3">
                    Kesulitan
                  </label>
                  <div className="space-y-2">
                    {(Object.entries(DIFFICULTIES) as [Difficulty, typeof DIFFICULTIES[Difficulty]][]).map(([key, diff]) => (
                      <button
                        key={key}
                        onClick={() => setDifficulty(key)}
                        className={`clay-sm w-full p-3 text-left hover:scale-[1.02] transition-all ${
                          difficulty === key ? "ring-2 ring-[#a8e6cf]" : ""
                        }`}
                      >
                        <div className="font-bold clay-text text-sm">
                          {diff.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {diff.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedMode ? 1 : 0 }}
          className="text-center"
        >
          {selectedMode && (
            <button
              onClick={handleStartGame}
              className="clay-lg px-12 py-5 text-xl font-bold clay-text hover:scale-105 transition-all duration-200 inline-flex items-center gap-3"
            >
              <span>🚀</span>
              Mulai Bermain!
            </button>
          )}
        </motion.div>

        {!selectedMode && (
          <p className="text-center text-gray-400 clay-text">
            Pilih mode bermain di atas untuk memulai
          </p>
        )}
      </div>
    </div>
  );
}

const gameModes = [
  {
    id: "daily",
    icon: "📅",
    title: "Daily Puzzle",
    description: "Teka-teki baru setiap hari! Selesaikan tantangan harian dan dapatkan hadiah spesial.",
    badges: ["Harian", "Hadiah"],
  },
  {
    id: "random",
    icon: "🎲",
    title: "Random Puzzle",
    description: "TTS acak tanpa batas! AI akan menghasilkan puzzle baru setiap kali bermain.",
    badges: ["Tak Terbatas", "AI"],
  },
  {
    id: "practice",
    icon: "📚",
    title: "Practice Mode",
    description: "Pilih mata pelajaran, kelas, dan tingkat kesulitan. Belajar sesuai keinginanmu!",
    badges: ["Belajar", "Kustom"],
  },
  {
    id: "challenge",
    icon: "⚡",
    title: "Challenge Mode",
    description: "Balap waktu! Selesaikan TTS secepat mungkin untuk skor tertinggi.",
    badges: ["Timer", "Kompetitif"],
  },
];
