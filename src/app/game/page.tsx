"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CrosswordGame from "@/components/crossword/CrosswordGame";
import Confetti from "@/components/shared/Confetti";
import ShareScore from "@/components/shared/ShareScore";
import PrintPuzzle from "@/components/shared/PrintPuzzle";
import KeyboardHelp from "@/components/crossword/KeyboardHelp";
import { useAuth } from "@/providers/AuthProvider";
import { generateCrosswordLayout } from "@/engine/crossword-engine";
import { calculateFinalScore, calculateWordScore, calculateLevel } from "@/services/game/scoring";
import { saveGameAttempt } from "@/services/supabase/puzzles";
import { addReward } from "@/services/supabase/profiles";
import { formatTime } from "@/lib/utils";
import { isSoundEnabled, playCorrectSound, playWrongSound, playVictorySound, playComboSound } from "@/services/game/audio";
import { SUBJECTS, DIFFICULTIES } from "@/lib/constants";
import type { CrosswordGrid, Word } from "@/types/crossword";
import type { GameMode, Subject, Difficulty, GameResult } from "@/types/game";
import type { AIGenerateResponse } from "@/types/ai";

/** Challenge time limit in seconds per difficulty */
const CHALLENGE_TIME_LIMITS: Record<Difficulty, number> = {
  easy: 180,
  medium: 300,
  hard: 480,
};

/**
 * Game page wrapper with Suspense boundary for useSearchParams()
 * Required by Next.js to avoid static generation errors
 */
export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🧩
          </motion.div>
          <p className="clay-text font-bold">Memuat Game...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}

/**
 * Game content component that uses useSearchParams()
 * Must be wrapped in Suspense for static generation
 */
function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = ((searchParams?.get("mode") as GameMode) || "random") as GameMode;
  const subject = ((searchParams?.get("subject") as Subject) || "islam") as Subject;
  const grade = parseInt(searchParams?.get("grade") || "1");
  const difficulty = ((searchParams?.get("difficulty") as Difficulty) || "easy") as Difficulty;

  const [puzzle, setPuzzle] = useState<CrosswordGrid | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [selectedDirection, setSelectedDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeClueIndex, setActiveClueIndex] = useState<number | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const { user, profile, refreshProfile } = useAuth();

  // Challenge mode: time limit
  const timeLimit = mode === "challenge" ? CHALLENGE_TIME_LIMITS[difficulty] : null;
  const remainingTime = timeLimit ? Math.max(0, timeLimit - elapsedTime) : null;
  const isTimeUp = mode === "challenge" && remainingTime !== null && remainingTime <= 0;

  // Initialize puzzle
  useEffect(() => {
    const initPuzzle = async () => {
      setLoading(true);
      try {
        // Try AI-generated puzzle first, fall back to sample
        let aiData: AIGenerateResponse | null = null;

        try {
          const response = await fetch("/api/generate-puzzle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject,
              grade,
              difficulty,
              wordCount: difficulty === "easy" ? 6 : difficulty === "medium" ? 10 : 15,
              language: "id",
              theme: mode === "daily" ? "Puzzle Harian" : undefined,
            }),
          });

          if (response.ok) {
            aiData = await response.json();
          }
        } catch {
          console.warn("AI generation failed, using sample data");
        }

        const puzzleData = aiData || (await import("@/services/ai/openai")).generateSamplePuzzle();

        const grid = generateCrosswordLayout(
          puzzleData.words.map((w) => ({
            answer: w.answer,
            clue: w.clue,
            explanation: w.explanation,
          })),
          50
        );
        grid.title = puzzleData.title;
        grid.theme = puzzleData.theme;
        setPuzzle(grid);

        // Initialize user grid
        const userG: string[][] = Array.from({ length: grid.rows }, () =>
          Array.from({ length: grid.cols }, () => "")
        );
        setUserGrid(userG);

        // Find first active cell
        for (let r = 0; r < grid.rows; r++) {
          for (let c = 0; c < grid.cols; c++) {
            if (!grid.cells[r][c].isBlocked) {
              setCurrentRow(r);
              setCurrentCol(c);
              break;
            }
          }
          break;
        }
      } catch (error) {
        console.error("Failed to generate puzzle:", error);
      } finally {
        setLoading(false);
      }
    };
    initPuzzle();
  }, [subject, grade, difficulty, mode]);

  // Initialize start time on client (avoid hydration mismatch)
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  // Timer
  useEffect(() => {
    if (isCompleted || loading || startTime === 0) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Challenge mode: auto-submit when time runs out
      if (mode === "challenge" && timeLimit && elapsed >= timeLimit) {
        setIsCompleted(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isCompleted, loading, mode, timeLimit]);

  // Handle keyboard input
  const handleCellInput = useCallback(
    (row: number, col: number, letter: string) => {
      if (!puzzle || isCompleted) return;

      const newGrid = userGrid.map((r) => [...r]);
      newGrid[row][col] = letter.toUpperCase();
      setUserGrid(newGrid);
      setWrongAttempts((prev) => prev + 1);

      // Sound: wrong letter feedback (once per keystroke)
      const correctLetter = puzzle.cells[row][col].letter;
      if (correctLetter && letter.toUpperCase() !== correctLetter.toUpperCase()) {
        if (isSoundEnabled()) playWrongSound();
      }

      // Check if word is complete
      const cell = puzzle.cells[row][col];
      for (const wordId of cell.wordIds) {
        const word: Word | undefined = puzzle.words.find((w) => w.id === wordId);
        if (!word || foundWords.has(wordId)) continue;

        let isComplete = true;
        for (let i = 0; i < word.answer.length; i++) {
          const wr = word.direction === "horizontal" ? word.startRow : word.startRow + i;
          const wc = word.direction === "horizontal" ? word.startCol + i : word.startCol;
          if (newGrid[wr][wc]?.toUpperCase() !== word.answer[i].toUpperCase()) {
            isComplete = false;
            break;
          }
        }

        if (isComplete) {
          setFoundWords((prev) => new Set(prev).add(wordId));
          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo((prev) => Math.max(prev, newCombo));
          const scoreResult = calculateWordScore(word.answer.length, wrongAttempts, 0, newCombo);
          setScore((prev) => prev + scoreResult.score);
          setWrongAttempts(0);

          // Sound: correct + combo
          if (isSoundEnabled()) {
            if (newCombo >= 3) {
              playComboSound(newCombo);
            } else {
              playCorrectSound();
            }
          }

          // Track achievements
          const newAchievements: string[] = [];
          if (foundWords.size === 0) {
            newAchievements.push("first_puzzle");
          }
          if (newCombo >= 5) {
            newAchievements.push(`combo_${newCombo}`);
          }
          if (newAchievements.length > 0) {
            setUnlockedAchievements((prev) => [...prev, ...newAchievements]);
            // Toast notification for each achievement
            newAchievements.forEach((ach) => {
              const name = ach === "first_puzzle" ? "TTS Pertama! 🎯" : `Kombo x${ach.replace("combo_", "")}! 🔥`;
              toast.success(name, {
                description: ach === "first_puzzle" ? "Selamat! Kamu berhasil menyelesaikan teka-teki pertamamu!" : "Pertahankan kombo tinggimu!",
              });
            });
          }
        }
      }

      // Move to next cell
      const nextPos = getNextCell(puzzle, row, col, selectedDirection);
      if (nextPos) {
        setCurrentRow(nextPos.row);
        setCurrentCol(nextPos.col);
      }
    },
    [puzzle, userGrid, selectedDirection, isCompleted, foundWords]
  );

  // Handle navigation
  const handleNavigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!puzzle) return;

      let newRow = currentRow;
      let newCol = currentCol;

      switch (direction) {
        case "up":
          while (newRow > 0 && puzzle.cells[newRow - 1][newCol].isBlocked) newRow--;
          if (newRow > 0) newRow--;
          break;
        case "down":
          while (
            newRow < puzzle.rows - 1 &&
            puzzle.cells[newRow + 1][newCol].isBlocked
          )
            newRow++;
          if (newRow < puzzle.rows - 1) newRow++;
          break;
        case "left":
          while (newCol > 0 && puzzle.cells[newRow][newCol - 1].isBlocked)
            newCol--;
          if (newCol > 0) newCol--;
          break;
        case "right":
          while (
            newCol < puzzle.cols - 1 &&
            puzzle.cells[newRow][newCol + 1].isBlocked
          )
            newCol++;
          if (newCol < puzzle.cols - 1) newCol++;
          break;
      }

      if (!puzzle.cells[newRow][newCol].isBlocked) {
        setCurrentRow(newRow);
        setCurrentCol(newCol);
      }
    },
    [puzzle, currentRow, currentCol]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedDirection("vertical");
        handleNavigate("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedDirection("vertical");
        handleNavigate("down");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedDirection("horizontal");
        handleNavigate("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedDirection("horizontal");
        handleNavigate("right");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        // Clear current cell
        const newGrid = userGrid.map((r) => [...r]);
        newGrid[currentRow][currentCol] = "";
        setUserGrid(newGrid);
        // Go back
        handleNavigate(
          selectedDirection === "horizontal" ? "left" : "up"
        );
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        handleCellInput(currentRow, currentCol, e.key);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setSelectedDirection((prev) =>
          prev === "horizontal" ? "vertical" : "horizontal"
        );
      } else if (e.key === "?") {
        e.preventDefault();
        setShowKeyboardHelp(true);
      } else if (e.key === "Escape") {
        setShowKeyboardHelp(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentRow,
    currentCol,
    selectedDirection,
    handleCellInput,
    handleNavigate,
    userGrid,
    isCompleted,
  ]);

  // Save game result to DB
  const saveResult = useCallback(async (finalResult: GameResult) => {
    if (!user || !puzzle) return;
    try {
      await saveGameAttempt(user.id, "", finalResult);
      const prevLevel = profile?.level || 1;
      await addReward(user.id, finalResult.xpEarned, finalResult.coinsEarned);
      await refreshProfile();

      // Check for level up
      if (profile && calculateLevel(profile.xp + finalResult.xpEarned) > prevLevel) {
        toast.success("🎉 Naik Level!", {
          description: `Selamat! Kamu naik ke level ${prevLevel + 1}`,
        });
      }
    } catch {
      // Silently fail if backend is not configured
      console.warn("Failed to save game result to database");
    }
  }, [user, puzzle, profile, refreshProfile]);

  // Check puzzle completion
  useEffect(() => {
    if (!puzzle || foundWords.size === 0) return;
    if (foundWords.size === puzzle.words.length) {
      setIsCompleted(true);
      const finalResult = calculateFinalScore(
        puzzle.words.length,
        foundWords.size,
        elapsedTime,
        hintsUsed,
        wrongAttempts,
        maxCombo,
        difficulty
      );
      setResult(finalResult);

      // Save to database
      saveResult(finalResult);

      // Sound + confetti
      if (isSoundEnabled()) playVictorySound();
      toast.success("🎉 TTS Selesai!", {
        description: `Skor: ${finalResult.score} · +${finalResult.xpEarned} XP · +${finalResult.coinsEarned} 🪙`,
      });
      setTimeout(() => setShowConfetti(true), 200);
      setTimeout(() => setShowResult(true), 800);

      // Save daily puzzle completion
      if (mode === "daily") {
        localStorage.setItem("daily_puzzle_date", new Date().toDateString());
      }
    }
  }, [foundWords, puzzle, elapsedTime, hintsUsed, wrongAttempts, maxCombo, difficulty, mode, saveResult]);

  // Auto-submit when time's up in challenge mode
  useEffect(() => {
    if (isTimeUp && puzzle && !isCompleted) {
      setIsCompleted(true);
      const finalResult = calculateFinalScore(
        puzzle.words.length,
        foundWords.size,
        elapsedTime,
        hintsUsed,
        wrongAttempts,
        maxCombo,
        difficulty
      );
      setResult(finalResult);
      saveResult(finalResult);
      setTimeout(() => setShowResult(true), 500);
      toast.warning("⏰ Waktu Habis!", {
        description: `${foundWords.size} dari ${puzzle.words.length} kata berhasil ditemukan`,
      });
    }
  }, [isTimeUp]);

  // Check daily puzzle eligibility
  useEffect(() => {
    if (mode === "daily" && puzzle && !loading) {
      const today = new Date().toDateString();
      const lastPlayed = localStorage.getItem("daily_puzzle_date");
      if (lastPlayed === today) {
        console.log("Daily puzzle already completed today");
      }
    }
  }, [mode, puzzle, loading]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🧩
          </motion.div>
          <p className="clay-text font-bold">Menyiapkan TTS...</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="clay-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-xl font-bold clay-text mb-2">
            Gagal Membuat TTS
          </h2>
          <p className="text-gray-500 mb-6">
            Maaf, terjadi kesalahan saat membuat teka-teki. Coba lagi!
          </p>
          <button
            onClick={() => router.push("/play")}
            className="clay-lg px-8 py-3 font-bold clay-text"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-2 sm:px-4 py-4">
      {/* Game Header */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="clay-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold clay-text">{puzzle.title}</h1>
            <p className="text-sm text-gray-500">{puzzle.theme}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#a8e6cf]/20 to-[#d4c5f9]/20 clay-text font-semibold">
                {SUBJECTS[subject]?.icon} {SUBJECTS[subject]?.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#f8b4c8]/20 to-[#ffd3b6]/20 clay-text font-semibold">
                Kelas {grade}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#b8d4e3]/20 to-[#c7ecee]/20 clay-text font-semibold">
                {DIFFICULTIES[difficulty]?.label || difficulty}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="no-print">
              <PrintPuzzle puzzle={puzzle} userGrid={userGrid} />
            </div>
            <div className="clay-inset px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Skor</div>
              <div className="font-bold clay-text">{score}</div>
            </div>
            <div className="clay-inset px-4 py-2 text-center">
              <div className="text-xs text-gray-500">
                {mode === "challenge" ? "⏱️ Sisa" : "Waktu"}
              </div>
              <div className={`font-bold ${remainingTime !== null && remainingTime <= 60 ? "text-red-500" : "clay-text"}`}>
                {remainingTime !== null ? formatTime(remainingTime) : formatTime(elapsedTime)}
              </div>
            </div>
            <div className="clay-inset px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Kata</div>
              <div className="font-bold clay-text">
                {foundWords.size}/{puzzle.words.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Grid & Clues */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-4">
        {/* Crossword Grid */}
        <div className="lg:col-span-2">
          <CrosswordGame
            puzzle={puzzle}
            userGrid={userGrid}
            currentRow={currentRow}
            currentCol={currentCol}
            selectedDirection={selectedDirection}
            foundWords={foundWords}
            onCellClick={(row, col) => {
              // Toggle direction if clicking same cell
              if (row === currentRow && col === currentCol) {
                setSelectedDirection((prev) =>
                  prev === "horizontal" ? "vertical" : "horizontal"
                );
              } else {
                setCurrentRow(row);
                setCurrentCol(col);
              }
            }}
            onCellInput={handleCellInput}
          />
        </div>

        {/* Clues Panel */}
        <div>
          <CluesPanel
            puzzle={puzzle}
            foundWords={foundWords}
            activeClueIndex={activeClueIndex}
            onClueClick={(index) => {
              setActiveClueIndex(index);
              const word = puzzle.words[index];
              if (word) {
                setCurrentRow(word.startRow);
                setCurrentCol(word.startCol);
                setSelectedDirection(word.direction);
              }
            }}
            onKeyboardHelp={() => setShowKeyboardHelp(true)}
            onHint={() => {
              // Reveal first empty letter
              for (const word of puzzle.words) {
                if (foundWords.has(word.id)) continue;

                for (let i = 0; i < word.answer.length; i++) {
                  const row = word.direction === "horizontal"
                    ? word.startRow
                    : word.startRow + i;
                  const col = word.direction === "horizontal"
                    ? word.startCol + i
                    : word.startCol;

                  if (!userGrid[row]?.[col]) {
                    handleCellInput(row, col, word.answer[i]);
                    setHintsUsed((prev) => prev + 1);
                    setScore((prev) => prev - 5);
                    return;
                  }
                }
              }
            }}
            hintsUsed={hintsUsed}
          />
        </div>
      </div>

      {/* Confetti Animation */}
      <Confetti active={showConfetti} count={80} />

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="clay-lg p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold clay-text mb-2">
                {isTimeUp ? "⏰ Waktu Habis!" : "Selesai!"}
              </h2>
              <p className="text-gray-500 mb-6">
                {isTimeUp
                  ? `${foundWords.size} dari ${puzzle.words.length} kata berhasil ditemukan`
                  : "Kamu hebat! Semua kata berhasil ditemukan."
                }
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="clay-sm p-4">
                  <div className="text-2xl font-bold clay-text">
                    {result.score}
                  </div>
                  <div className="text-xs text-gray-500">Skor</div>
                </div>
                <div className="clay-sm p-4">
                  <div className="text-2xl font-bold clay-text">
                    +{result.xpEarned} XP
                  </div>
                  <div className="text-xs text-gray-500">XP Didapat</div>
                </div>
                <div className="clay-sm p-4">
                  <div className="text-2xl font-bold clay-text">
                    +{result.coinsEarned}
                  </div>
                  <div className="text-xs text-gray-500">🪙 Didapat</div>
                </div>
                <div className="clay-sm p-4">
                  <div className="text-2xl font-bold clay-text">
                    {formatTime(result.time)}
                  </div>
                  <div className="text-xs text-gray-500">Waktu</div>
                </div>
                <div className="clay-sm p-4">
                  <div className="text-2xl font-bold clay-text">
                    {Math.round(result.accuracy * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Akurasi</div>
                </div>
              </div>

              {/* Achievements unlocked */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-6 clay-sm p-4">
                  <p className="text-sm font-bold clay-text mb-2">🏆 Pencapaian Baru!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {unlockedAchievements.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ffeba7] to-[#ffd3b6] px-3 py-1 rounded-full text-xs font-bold clay-text">
                        ✨ {a === "first_puzzle" ? "TTS Pertama!" : `Kombo x${a.replace("combo_", "")}!`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Combo display */}
              {maxCombo >= 2 && (
                <div className="mb-4 text-sm clay-text">
                  🔥 Kombo Tertinggi: {maxCombo}x
                </div>
              )}

              {/* Share Score */}
              <div className="mb-4 flex justify-center no-print">
                <ShareScore result={result} puzzleTitle={puzzle?.title || ""} />
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push("/play")}
                  className="clay-sm px-6 py-3 font-bold clay-text hover:scale-105 transition-all"
                >
                  Main Lagi
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="clay-lg px-6 py-3 font-bold clay-text hover:scale-105 transition-all"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Help Modal */}
      <KeyboardHelp
        open={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </div>
  );
}

/**
 * Clues panel component
 */
function CluesPanel({
  puzzle,
  foundWords,
  activeClueIndex,
  onClueClick,
  onHint,
  hintsUsed,
  onKeyboardHelp,
}: {
  puzzle: CrosswordGrid;
  foundWords: Set<string>;
  activeClueIndex: number | null;
  onClueClick: (index: number) => void;
  onHint: () => void;
  hintsUsed: number;
  onKeyboardHelp: () => void;
}) {
  const horizontalClues = puzzle.words
    .map((w, i) => ({ ...w, index: i }))
    .filter((w) => w.direction === "horizontal");
  const verticalClues = puzzle.words
    .map((w, i) => ({ ...w, index: i }))
    .filter((w) => w.direction === "vertical");

  return (
    <div className="clay p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold clay-text">Petunjuk</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onKeyboardHelp()}
            className="clay-sm px-2.5 py-1.5 text-xs font-semibold clay-text hover:scale-105 transition-all"
            title="Pintasan keyboard"
          >
            ⌨️
          </button>
          <button
            onClick={onHint}
            disabled={hintsUsed >= 5}
            className="clay-sm px-3 py-1.5 text-sm font-semibold clay-text hover:scale-105 transition-all disabled:opacity-50"
          >
            💡 Petunjuk ({5 - hintsUsed})
          </button>
        </div>
      </div>

      {/* Horizontal clues */}
      <div>
        <h4 className="text-sm font-semibold clay-text mb-2 flex items-center gap-2">
          <span>➡️</span> Mendatar
        </h4>
        <div className="space-y-1">
          {horizontalClues.map((word) => (
            <button
              key={word.id}
              onClick={() => onClueClick(word.index)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                foundWords.has(word.id)
                  ? "opacity-50 line-through"
                  : activeClueIndex === word.index
                  ? "clay-pressed font-semibold"
                  : "hover:clay-pressed"
              }`}
            >
              <span className="font-bold mr-2">{word.index + 1}.</span>
              {word.clue}
              {foundWords.has(word.id) && (
                <span className="ml-2 text-green-500"> ✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical clues */}
      <div>
        <h4 className="text-sm font-semibold clay-text mb-2 flex items-center gap-2">
          <span>⬇️</span> Menurun
        </h4>
        <div className="space-y-1">
          {verticalClues.map((word) => (
            <button
              key={word.id}
              onClick={() => onClueClick(word.index)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                foundWords.has(word.id)
                  ? "opacity-50 line-through"
                  : activeClueIndex === word.index
                  ? "clay-pressed font-semibold"
                  : "hover:clay-pressed"
              }`}
            >
              <span className="font-bold mr-2">{word.index + 1}.</span>
              {word.clue}
              {foundWords.has(word.id) && (
                <span className="ml-2 text-green-500"> ✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Get next cell within the current word, following its direction.
 * If at the end of the word, fall back to simple grid navigation.
 */
function getNextCell(
  puzzle: CrosswordGrid,
  row: number,
  col: number,
  direction: "horizontal" | "vertical"
): { row: number; col: number } | null {
  // Find the word that contains this cell and matches the current direction
  const word = puzzle.words.find((w) => {
    if (w.direction !== direction) return false;
    const { startRow, startCol, answer } = w;
    if (direction === "horizontal") {
      return row === startRow && col >= startCol && col < startCol + answer.length;
    } else {
      return col === startCol && row >= startRow && row < startRow + answer.length;
    }
  });

  // Move within the word if we found one
  if (word) {
    if (direction === "horizontal") {
      const cellIndex = col - word.startCol;
      if (cellIndex + 1 < word.answer.length) {
        return { row, col: col + 1 };
      }
    } else {
      const cellIndex = row - word.startRow;
      if (cellIndex + 1 < word.answer.length) {
        return { row: row + 1, col };
      }
    }
  }

  // Fallback: simple grid navigation
  if (direction === "horizontal") {
    for (let c = col + 1; c < puzzle.cols; c++) {
      if (!puzzle.cells[row][c].isBlocked) return { row, col: c };
    }
    for (let r = row + 1; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (!puzzle.cells[r][c].isBlocked) return { row: r, col: c };
      }
    }
  } else {
    for (let r = row + 1; r < puzzle.rows; r++) {
      if (!puzzle.cells[r][col].isBlocked) return { row: r, col };
    }
    for (let c = col + 1; c < puzzle.cols; c++) {
      for (let r = 0; r < puzzle.rows; r++) {
        if (!puzzle.cells[r][c].isBlocked) return { row: r, col: c };
      }
    }
  }
  return null;
}
