"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS, DIFFICULTIES, GRADES } from "@/lib/constants";
import { PREBUILT_PUZZLES, PUZZLE_SHAPES } from "@/data/puzzles";
import type { GameMode, Subject, Difficulty } from "@/types/game";
import type { PuzzleShape, PuzzleData } from "@/data/puzzles";

export default function PlayPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [subject, setSubject] = useState<Subject>("islam");
  const [grade, setGrade] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [selectedPuzzle, setSelectedPuzzle] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<PuzzleShape | null>(null);
  const [puzzleSubjectFilter, setPuzzleSubjectFilter] = useState<string>("all");

  // Filter puzzles based on mode, subject, difficulty, grade
  const filteredPuzzles = useMemo(() => {
    return PREBUILT_PUZZLES.filter((p) => {
      if (puzzleSubjectFilter !== "all" && p.subject !== puzzleSubjectFilter) return false;
      if (selectedShape && p.shape !== selectedShape) return false;
      return true;
    });
  }, [puzzleSubjectFilter, selectedShape]);

  const handleStartGame = () => {
    const params = new URLSearchParams({
      mode: selectedMode || "random",
      subject,
      grade: grade.toString(),
      difficulty,
    });

    // If a specific puzzle is selected, pass its ID
    if (selectedPuzzle) {
      params.set("puzzleId", selectedPuzzle);
    }

    router.push(`/game?${params.toString()}`);
  };

  const handleSelectPuzzle = (puzzleId: string) => {
    setSelectedPuzzle(selectedPuzzle === puzzleId ? null : puzzleId);
    // Auto-fill subject/difficulty/grade from selected puzzle
    const puzzle = PREBUILT_PUZZLES.find((p) => p.id === puzzleId);
    if (puzzle) {
      setSubject(puzzle.subject as Subject);
      setDifficulty(puzzle.difficulty as Difficulty);
      setGrade(puzzle.grade);
    }
  };

  // Get unique shapes used in filtered puzzles
  const shapesInPuzzles = useMemo(() => {
    return [...new Set(filteredPuzzles.map((p) => p.shape))];
  }, [filteredPuzzles]);

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {gameModes.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedMode(mode.id as GameMode)}
              className={`clay p-5 text-left hover:scale-[1.02] transition-all duration-200 ${
                selectedMode === mode.id
                  ? "ring-2 ring-[#a8e6cf]"
                  : ""
              }`}
            >
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="text-lg font-bold clay-text mb-1">
                {mode.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
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
            </motion.button>
          ))}
        </div>

        {/* Puzzle Selection */}
        <AnimatePresence>
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold clay-text">
                    Pilih TTS
                  </h2>
                  <p className="text-sm text-gray-500">
                    Atur sendiri atau pilih teka-teki yang sudah tersedia
                  </p>
                </div>
              </div>

              {/* Filter by Subject */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setPuzzleSubjectFilter("all")}
                  className={`clay-sm px-3 py-1.5 text-xs font-semibold hover:scale-105 transition-all ${
                    puzzleSubjectFilter === "all" ? "ring-2 ring-[#a8e6cf]" : ""
                  }`}
                >
                  Semua
                </button>
                {Object.entries(SUBJECTS).map(([key, subj]) => (
                  <button
                    key={key}
                    onClick={() => setPuzzleSubjectFilter(key)}
                    className={`clay-sm px-3 py-1.5 text-xs font-semibold hover:scale-105 transition-all inline-flex items-center gap-1 ${
                      puzzleSubjectFilter === key ? "ring-2 ring-[#a8e6cf]" : ""
                    }`}
                  >
                    <span>{subj.icon}</span>
                    {subj.label}
                  </button>
                ))}
              </div>

              {/* Shape Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedShape(null)}
                  className={`clay-sm px-3 py-1.5 text-xs font-semibold hover:scale-105 transition-all ${
                    !selectedShape ? "ring-2 ring-[#a8e6cf]" : ""
                  }`}
                >
                  Semua Bentuk
                </button>
                {Object.entries(PUZZLE_SHAPES).map(([key, shape]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedShape(key as PuzzleShape)}
                    className={`clay-sm px-3 py-1.5 text-xs font-semibold hover:scale-105 transition-all inline-flex items-center gap-1 ${
                      selectedShape === key ? "ring-2 ring-[#a8e6cf]" : ""
                    }`}
                  >
                    <span>{shape.icon}</span>
                    {shape.label}
                  </button>
                ))}
              </div>

              {/* Puzzle Grid */}
              {filteredPuzzles.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPuzzles.map((puzzle, i) => (
                    <PuzzleCard
                      key={puzzle.id}
                      puzzle={puzzle}
                      isSelected={selectedPuzzle === puzzle.id}
                      onSelect={() => handleSelectPuzzle(puzzle.id)}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="clay-lg p-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="clay-text font-semibold">
                    Tidak ada teka-teki dengan filter ini
                  </p>
                  <button
                    onClick={() => {
                      setPuzzleSubjectFilter("all");
                      setSelectedShape(null);
                    }}
                    className="clay-sm px-4 py-2 mt-4 text-sm font-semibold clay-text hover:scale-105 transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {/* Or generate random */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setSelectedPuzzle(null);
                    handleStartGame();
                  }}
                  className="clay-sm px-6 py-3 text-sm font-semibold clay-text hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <span>🎲</span>
                  Atau buat TTS Acak
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Panel (for non-daily modes) */}
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
                          {["1\uFE0F\u20E3", "2\uFE0F\u20E3", "3\uFE0F\u20E3", "4\uFE0F\u20E3", "5\uFE0F\u20E3", "6\uFE0F\u20E3"][g - 1]}
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
              {selectedPuzzle ? "Mainkan TTS Pilihan!" : "Mulai Bermain!"}
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

/**
 * Puzzle Card Component
 */
function PuzzleCard({
  puzzle,
  isSelected,
  onSelect,
  index,
}: {
  puzzle: PuzzleData;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const shapeInfo = PUZZLE_SHAPES[puzzle.shape];
  const subjectInfo = SUBJECTS[puzzle.subject as keyof typeof SUBJECTS];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onSelect}
      className={`clay p-4 text-left hover:scale-[1.02] transition-all duration-200 relative overflow-hidden ${
        isSelected ? "ring-2 ring-[#a8e6cf]" : ""
      }`}
    >
      {/* Decorative background */}
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: subjectInfo?.color || "#a8e6cf" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{puzzle.icon}</span>
          <div>
            <h3 className="text-sm font-bold clay-text leading-tight">
              {puzzle.title}
            </h3>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 relative">
        {puzzle.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 relative">
        {/* Subject badge */}
        {subjectInfo && (
          <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-medium"
            style={{
              backgroundColor: `${subjectInfo.color}25`,
              color: subjectInfo.color,
            }}
          >
            {subjectInfo.icon}
            {subjectInfo.label}
          </span>
        )}

        {/* Difficulty badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          puzzle.difficulty === "easy"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : puzzle.difficulty === "medium"
            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}>
          {DIFFICULTIES[puzzle.difficulty as Difficulty]?.label || puzzle.difficulty}
        </span>

        {/* Grade badge */}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
          Kelas {puzzle.grade}
        </span>

        {/* Shape badge */}
        {shapeInfo && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium inline-flex items-center gap-0.5">
            {shapeInfo.icon}
            {shapeInfo.label}
          </span>
        )}
      </div>
    </motion.button>
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
