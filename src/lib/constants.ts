import type { Subject, Difficulty } from "@/types/game";

export const APP_NAME = "TTS Anak Pintar";
export const APP_DESCRIPTION = "Educational Crossword Puzzle Game for Indonesian Elementary School Students";
export const APP_VERSION = "1.0.0";

export const GRADES = [1, 2, 3, 4, 5, 6] as const;

export const SUBJECTS: Record<Subject, { label: string; description: string; icon: string; color: string }> = {
  islam: {
    label: "Agama Islam",
    description: "Rukun Islam, Rukun Iman, Nabi, Malaikat, Wudhu, Sholat, Puasa, Zakat, Haji, Akhlak",
    icon: "🕌",
    color: "#a8e6cf",
  },
  quran: {
    label: "Al-Qur'an",
    description: "Nama surat, Juz, Makna surat, Ayat pilihan, Tajwid, Huruf hijaiyah",
    icon: "📖",
    color: "#d4c5f9",
  },
  hadith: {
    label: "Hadits",
    description: "Hadits pendek, Makna hadits, Adab, Kejujuran, Kebersihan, Menuntut ilmu",
    icon: "📜",
    color: "#f8b4c8",
  },
  arabic: {
    label: "Bahasa Arab",
    description: "Kosakata, Anggota tubuh, Hewan, Buah, Warna, Angka, Hari, Bulan, Profesi",
    icon: "🖋️",
    color: "#ffd3b6",
  },
  english: {
    label: "Bahasa Inggris",
    description: "Animal, Fruit, Color, Family, School, Number, Greeting, Food, Profession",
    icon: "🔤",
    color: "#b8d4e3",
  },
  general: {
    label: "Pengetahuan Umum",
    description: "Indonesia, Sains, Matematika, Tumbuhan, Hewan, Transportasi, Luar Angkasa",
    icon: "🌟",
    color: "#ffeba7",
  },
};

export const DIFFICULTIES: Record<Difficulty, { label: string; minWords: number; maxWords: number; description: string }> = {
  easy: { label: "Mudah", minWords: 5, maxWords: 8, description: "5-8 kata" },
  medium: { label: "Sedang", minWords: 8, maxWords: 12, description: "8-12 kata" },
  hard: { label: "Sulit", minWords: 12, maxWords: 20, description: "12-20 kata" },
};

export const SCORING = {
  CORRECT_WORD: 10,
  WRONG_ATTEMPT: -2,
  HINT_LETTER: -5,
  HINT_WORD: -15,
  HINT_CLUE_50: -3,
  COMBO_MULTIPLIER: 1.5,
  TIME_BONUS_THRESHOLD: 120, // seconds
  TIME_BONUS_POINTS: 5,
  PERFECT_BONUS: 20,
} as const;

export const XP = {
  PER_CORRECT_WORD: 15,
  PER_PUZZLE_COMPLETE: 50,
  PER_ACHIEVEMENT: 100,
  PER_STREAK_DAY: 10,
  LEVEL_BASE: 100,
  LEVEL_MULTIPLIER: 1.5,
} as const;

export const ACHIEVEMENTS = [
  { id: "first_puzzle", name: "Pertama Kali", description: "Selesaikan teka-teki pertamamu!", icon: "🎯", xpReward: 50, coinsReward: 25 },
  { id: "hundred_words", name: "Seratus Kata", description: "Temukan 100 kata!", icon: "💯", xpReward: 200, coinsReward: 100 },
  { id: "islam_expert", name: "Ahli Agama", description: "Selesaikan 10 TTS Agama Islam", icon: "🕌", xpReward: 150, coinsReward: 75 },
  { id: "arabic_master", name: "Master Bahasa Arab", description: "Selesaikan 10 TTS Bahasa Arab", icon: "🖋️", xpReward: 150, coinsReward: 75 },
  { id: "english_hero", name: "English Hero", description: "Selesaikan 10 TTS Bahasa Inggris", icon: "🔤", xpReward: 150, coinsReward: 75 },
  { id: "hadith_lover", name: "Pecinta Hadits", description: "Selesaikan 5 TTS Hadits", icon: "📜", xpReward: 100, coinsReward: 50 },
  { id: "perfect_score", name: "Sempurna!", description: "Dapatkan skor sempurna dalam satu TTS", icon: "⭐", xpReward: 300, coinsReward: 150 },
  { id: "streak_7", name: "7 Hari Berturut-turut", description: "Main 7 hari berturut-turut", icon: "🔥", xpReward: 200, coinsReward: 100 },
  { id: "streak_30", name: "30 Hari Berturut-turut", description: "Main 30 hari berturut-turut", icon: "💪", xpReward: 500, coinsReward: 250 },
  { id: "speed_demon", name: "Cepat Cermat", description: "Selesaikan TTS dalam waktu kurang dari 2 menit", icon: "⚡", xpReward: 200, coinsReward: 100 },
  { id: "general_knowledge", name: "Serba Tahu", description: "Selesaikan 10 TTS Pengetahuan Umum", icon: "🌟", xpReward: 150, coinsReward: 75 },
  { id: "quran_lover", name: "Pencinta Al-Quran", description: "Selesaikan 10 TTS Al-Quran", icon: "📖", xpReward: 150, coinsReward: 75 },
];

export const GAME_LIMITS = {
  CHALLENGE_TIME_MINUTES: 5,
  MAX_HINTS_PER_GAME: 5,
  PRACTICE_GRADE_MIN: 1,
  PRACTICE_GRADE_MAX: 6,
} as const;

export const SOUND_PATHS = {
  CORRECT: "/sounds/correct.mp3",
  WRONG: "/sounds/wrong.mp3",
  COMPLETE: "/sounds/complete.mp3",
  HINT: "/sounds/hint.mp3",
  CLICK: "/sounds/click.mp3",
  VICTORY: "/sounds/victory.mp3",
} as const;

export const GRID_CONFIG = {
  MIN_SIZE: 8,
  MAX_SIZE: 20,
  DEFAULT_CELL_SIZE: 36,
  CELL_GAP: 2,
} as const;
