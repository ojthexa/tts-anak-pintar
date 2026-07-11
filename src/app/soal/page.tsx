"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SUBJECTS, DIFFICULTIES, GRADES } from "@/lib/constants";
import { PREBUILT_PUZZLES, PUZZLE_SHAPES } from "@/data/puzzles";
import type { Subject, Difficulty } from "@/types/game";
import type { PuzzleShape, PuzzleData } from "@/data/puzzles";

/** Unique subjects present in the puzzle data */
const ACTIVE_SUBJECTS = [...new Set(PREBUILT_PUZZLES.map((p) => p.subject))];
const ACTIVE_SHAPES = [...new Set(PREBUILT_PUZZLES.map((p) => p.shape))];
const ACTIVE_DIFFICULTIES = [...new Set(PREBUILT_PUZZLES.map((p) => p.difficulty))] as Difficulty[];
const ACTIVE_GRADES = [...new Set(PREBUILT_PUZZLES.map((p) => p.grade))].sort((a, b) => a - b);

export default function SoalPage() {
  const router = useRouter();
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleData | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  const [filterShape, setFilterShape] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered and searched puzzles
  const filteredPuzzles = useMemo(() => {
    return PREBUILT_PUZZLES.filter((p) => {
      if (filterSubject !== "all" && p.subject !== filterSubject) return false;
      if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty) return false;
      if (filterGrade !== null && p.grade !== filterGrade) return false;
      if (filterShape !== "all" && p.shape !== filterShape) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.theme.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [filterSubject, filterDifficulty, filterGrade, filterShape, searchQuery]);

  const handlePlay = () => {
    if (!selectedPuzzle) return;
    const params = new URLSearchParams({
      puzzleId: selectedPuzzle.id,
      subject: selectedPuzzle.subject,
      grade: selectedPuzzle.grade.toString(),
      difficulty: selectedPuzzle.difficulty,
      mode: "practice",
    });
    router.push(`/game?${params.toString()}`);
  };

  const hasActiveFilters =
    filterSubject !== "all" ||
    filterDifficulty !== "all" ||
    filterGrade !== null ||
    filterShape !== "all" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setFilterSubject("all");
    setFilterDifficulty("all");
    setFilterGrade(null);
    setFilterShape("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl mb-4"
          >
            🧩
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold clay-text mb-2">
            Daftar Soal TTS
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Pilih teka-teki yang ingin kamu mainkan. Tersedia{" "}
            <strong className="clay-text">{PREBUILT_PUZZLES.length} soal</strong>{" "}
            dari berbagai mata pelajaran!
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-6"
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari soal..."
              className="clay-sm w-full pl-12 pr-4 py-3 text-sm clay-text placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#a8e6cf] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 space-y-3"
        >
          {/* Subject Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <FilterChip
              active={filterSubject === "all"}
              onClick={() => setFilterSubject("all")}
              icon="📋"
              label="Semua"
            />
            {ACTIVE_SUBJECTS.map((s) => {
              const info = SUBJECTS[s as Subject];
              if (!info) return null;
              return (
                <FilterChip
                  key={s}
                  active={filterSubject === s}
                  onClick={() => setFilterSubject(s)}
                  icon={info.icon}
                  label={info.label}
                  color={info.color}
                />
              );
            })}
          </div>

          {/* Difficulty & Grade & Shape Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <FilterChip
              active={filterDifficulty === "all"}
              onClick={() => setFilterDifficulty("all")}
              icon="🎯"
              label="Semua Level"
              size="sm"
            />
            {ACTIVE_DIFFICULTIES.map((d) => (
              <FilterChip
                key={d}
                active={filterDifficulty === d}
                onClick={() => setFilterDifficulty(d)}
                icon={DIFFICULTIES[d]?.label === "Mudah" ? "🌱" : DIFFICULTIES[d]?.label === "Sedang" ? "🔥" : "💀"}
                label={DIFFICULTIES[d]?.label || d}
                size="sm"
              />
            ))}
            <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1" />
            {ACTIVE_GRADES.map((g) => (
              <FilterChip
                key={g}
                active={filterGrade === g}
                onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                icon={`${g}`}
                label={`Kelas ${g}`}
                size="sm"
              />
            ))}
            <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1" />
            <FilterChip
              active={filterShape === "all"}
              onClick={() => setFilterShape("all")}
              icon="🧩"
              label="Semua Bentuk"
              size="sm"
            />
            {ACTIVE_SHAPES.map((s) => {
              const info = PUZZLE_SHAPES[s];
              return (
                <FilterChip
                  key={s}
                  active={filterShape === s}
                  onClick={() => setFilterShape(s)}
                  icon={info.icon}
                  label={info.label}
                  size="sm"
                />
              );
            })}

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="clay-sm px-3 py-1.5 text-xs font-semibold text-red-500 hover:scale-105 transition-all"
              >
                ✕ Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Puzzle Grid */}
        {filteredPuzzles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPuzzles.map((puzzle, i) => (
              <PuzzleCard
                key={puzzle.id}
                puzzle={puzzle}
                isSelected={selectedPuzzle?.id === puzzle.id}
                onSelect={() => setSelectedPuzzle(puzzle)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clay-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold clay-text mb-2">
              Tidak Ada Soal Ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Coba ubah filter atau kata kunci pencarian
            </p>
            <button
              onClick={resetFilters}
              className="clay-lg px-6 py-3 font-bold clay-text hover:scale-105 transition-all"
            >
              Reset Semua Filter
            </button>
          </motion.div>
        )}

        {/* Selected Puzzle Detail / Play Button */}
        <AnimatePresence>
          {selectedPuzzle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 clay-lg p-6 sm:p-8"
            >
              <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
                <div className="flex items-start gap-4">
                  <div className="text-5xl shrink-0">{selectedPuzzle.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold clay-text mb-1">
                      {selectedPuzzle.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {selectedPuzzle.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const subjInfo = SUBJECTS[selectedPuzzle.subject as Subject];
                        if (subjInfo) {
                          return (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1"
                              style={{
                                backgroundColor: `${subjInfo.color}25`,
                                color: subjInfo.color,
                              }}
                            >
                              {subjInfo.icon} {subjInfo.label}
                            </span>
                          );
                        }
                        return null;
                      })()}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          selectedPuzzle.difficulty === "easy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : selectedPuzzle.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {DIFFICULTIES[selectedPuzzle.difficulty as Difficulty]?.label}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Kelas {selectedPuzzle.grade}
                      </span>
                      {(() => {
                        const shapeInfo = PUZZLE_SHAPES[selectedPuzzle.shape];
                        return (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 inline-flex items-center gap-1">
                            {shapeInfo?.icon} {shapeInfo?.label}
                          </span>
                        );
                      })()}
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {selectedPuzzle.words.length} kata
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Tema: {selectedPuzzle.theme}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:text-right">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePlay}
                    className="clay-lg px-10 py-4 text-lg font-bold clay-text inline-flex items-center gap-3 justify-center"
                  >
                    <span>🚀</span>
                    Mainkan Soal Ini!
                  </motion.button>
                  <button
                    onClick={() => setSelectedPuzzle(null)}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Batal pilih
                  </button>
                </div>
              </div>

              {/* Word Preview */}
              <details className="mt-6 group">
                <summary className="text-sm font-semibold clay-text cursor-pointer hover:opacity-70 transition-opacity">
                  📝 Lihat daftar pertanyaan ({selectedPuzzle.words.length} soal)
                </summary>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {selectedPuzzle.words.map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="clay-sm p-3 text-sm flex items-start gap-3"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <p className="clay-text font-semibold">{w.clue}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Jawaban:{" "}
                          <span className="font-mono font-bold text-[#a8e6cf]">
                            {w.answer.length} huruf
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </details>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          Menampilkan{" "}
          <strong className="clay-text">{filteredPuzzles.length}</strong> dari{" "}
          <strong className="clay-text">{PREBUILT_PUZZLES.length}</strong> soal
        </motion.div>
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  icon,
  label,
  color,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  color?: string;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${sizeClasses} rounded-full font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
        active
          ? "bg-gradient-to-r from-[#a8e6cf] to-[#7ed5b0] text-white shadow-lg shadow-[#a8e6cf]/30"
          : "clay-sm clay-text hover:shadow-md"
      }`}
      style={
        active && color
          ? {
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            }
          : undefined
      }
    >
      <span className={active ? "text-white" : ""}>
        {icon === "🌱" || icon === "🔥" || icon === "💀" ? (
          icon
        ) : (
          icon
        )}
      </span>
      {label}
    </motion.button>
  );
}

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const subjectInfo = SUBJECTS[puzzle.subject as keyof typeof SUBJECTS];
  const shapeInfo = PUZZLE_SHAPES[puzzle.shape];
  const difficultyInfo = DIFFICULTIES[puzzle.difficulty as Difficulty];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onSelect}
      className={`clay p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
        isSelected
          ? "ring-2 ring-[#a8e6cf] shadow-lg shadow-[#a8e6cf]/20"
          : "hover:shadow-xl"
      }`}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-[0.07] pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-[0.15]"
        style={{ backgroundColor: subjectInfo?.color || "#a8e6cf" }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 0.5 }}
            className="text-3xl"
          >
            {puzzle.icon}
          </motion.div>
          <div>
            <h3 className="text-base font-bold clay-text leading-tight">
              {puzzle.title}
            </h3>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
              {puzzle.words.length} soal
            </p>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#a8e6cf] to-[#7ed5b0] flex items-center justify-center shadow-lg"
          >
            <span className="text-white text-sm font-bold">✓</span>
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 relative z-10 leading-relaxed">
        {puzzle.description}
      </p>

      {/* Shape visualization - mini grid */}
      <div className="relative z-10 mb-3">
        <MiniShapePreview shape={puzzle.shape} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {subjectInfo && (
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-0.5"
            style={{
              backgroundColor: `${subjectInfo.color}18`,
              color: subjectInfo.color,
            }}
          >
            {subjectInfo.icon}
            {subjectInfo.label}
          </span>
        )}
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
            puzzle.difficulty === "easy"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : puzzle.difficulty === "medium"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {difficultyInfo?.label || puzzle.difficulty}
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          Kelas {puzzle.grade}
        </span>
        {shapeInfo && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 inline-flex items-center gap-0.5">
            {shapeInfo.icon}
            {shapeInfo.label}
          </span>
        )}
      </div>

      {/* Hover glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-transparent via-[#a8e6cf]/5 to-[#d4c5f9]/5 pointer-events-none transition-opacity duration-300"
      />
    </motion.div>
  );
}

/**
 * Mini shape preview showing the puzzle's crossword layout
 */
function MiniShapePreview({ shape }: { shape: PuzzleShape }) {
  // Generate a tiny preview grid based on shape type
  const preview = useMemo(() => {
    switch (shape) {
      case "classic": {
        // Classic: grid-like with some fills
        const g = [
          [1, 1, 1, 0, 0],
          [0, 1, 0, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 1, 0],
        ];
        return g;
      }
      case "diamond": {
        const g = [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0],
        ];
        return g;
      }
      case "cross": {
        const g = [
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [1, 1, 1, 1, 1],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
        ];
        return g;
      }
      case "crossCompact": {
        const g = [
          [0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1],
          [1, 1, 1, 1, 1],
          [1, 0, 1, 0, 1],
          [0, 1, 1, 1, 0],
        ];
        return g;
      }
      case "compact": {
        const g = [
          [1, 1, 1, 0, 0],
          [1, 0, 1, 1, 0],
          [1, 1, 1, 0, 1],
          [0, 1, 0, 1, 1],
          [0, 0, 1, 1, 0],
        ];
        return g;
      }
      default:
        return [
          [1, 1, 1, 0],
          [1, 0, 1, 0],
          [1, 1, 1, 1],
          [0, 0, 1, 0],
        ];
    }
  }, [shape]);

  return (
    <div className="flex gap-[1.5px] justify-start">
      {preview.map((row, ri) => (
        <div key={ri} className="flex flex-col gap-[1.5px]">
          {row.map((cell, ci) => (
            <div
              key={ci}
              className={`w-[4.5px] h-[4.5px] rounded-[0.5px] ${
                cell
                  ? "bg-gradient-to-br from-[#a8e6cf]/60 to-[#7ed5b0]/40 dark:from-[#a8e6cf]/40 dark:to-[#7ed5b0]/30"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


