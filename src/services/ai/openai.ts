/**
 * AI Service for generating crossword puzzles using OpenAI
 */

import OpenAI from "openai";
import { getPromptTemplate } from "./prompts";
import type { AIGenerateRequest, AIGenerateResponse } from "@/types/ai";

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client (singleton)
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
}

/**
 * Generate crossword puzzle content using AI
 */
export async function generatePuzzleContent(
  request: AIGenerateRequest
): Promise<AIGenerateResponse | null> {
  const { subject, grade, difficulty, wordCount, language, theme } = request;

  try {
    const prompt = getPromptTemplate({
      subject,
      grade,
      difficulty,
      wordCount: getWordCount(difficulty),
      language: language || "id",
      theme,
    });

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational puzzle generator for Indonesian elementary school children. Output ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as AIGenerateResponse;
    return parsed;
  } catch (error) {
    console.error("Error generating puzzle content:", error);
    return null;
  }
}

/**
 * Generate sample puzzle for demo/preview
 */
export function generateSamplePuzzle(): AIGenerateResponse {
  return {
    title: "Rukun Iman & Islam",
    theme: "6 Rukun Iman & 5 Rukun Islam",
    words: [
      {
        answer: "SYAHADAT",
        clue: "Dua kalimat yang menjadi rukun Islam pertama",
        explanation: "Syahadat adalah kalimat 'Asyhadu alla ilaha illallah wa asyhadu anna Muhammadar Rasulullah' yang berarti aku bersaksi bahwa tiada Tuhan selain Allah dan Muhammad adalah utusan Allah",
        direction: "horizontal",
        start: [0, 0],
      },
      {
        answer: "SHALAT",
        clue: "Ibadah wajib yang dilakukan 5 waktu sehari semalam",
        explanation: "Shalat adalah ibadah yang terdiri dari gerakan dan doa tertentu yang dilakukan dengan menghadap kiblat",
        direction: "vertical",
        start: [0, 0],
      },
      {
        answer: "ZAKAT",
        clue: "Mengeluarkan sebagian harta yang wajib diberikan kepada yang berhak",
        explanation: "Zakat adalah rukun Islam keempat, membersihkan harta dengan memberikannya kepada fakir miskin dan yang berhak",
        direction: "horizontal",
        start: [6, 0],
      },
      {
        answer: "PUASA",
        clue: "Menahan diri dari makan dan minum dari terbit fajar hingga terbenam matahari",
        explanation: "Puasa di bulan Ramadan adalah rukun Islam keempat yang melatih kesabaran dan ketaqwaan",
        direction: "vertical",
        start: [0, 6],
      },
      {
        answer: "HAJI",
        clue: "Ibadah ke Baitullah di Mekkah yang dilakukan sekali seumur hidup bagi yang mampu",
        explanation: "Haji adalah rukun Islam kelima, berkunjung ke Ka'bah di Mekkah untuk melaksanakan ibadah tertentu",
        direction: "horizontal",
        start: [10, 0],
      },
      {
        answer: "IMALLAH",
        clue: "Rukun iman pertama, percaya kepada ...",
        explanation: "Iman kepada Allah adalah keyakinan bahwa Allah adalah Tuhan Yang Maha Esa, pencipta alam semesta",
        direction: "vertical",
        start: [0, 9],
      },
      {
        answer: "MALAIKAT",
        clue: "Makhluk Allah yang diciptakan dari cahaya, selalu taat beribadah",
        explanation: "Malaikat adalah makhluk gaib yang diciptakan Allah dari cahaya, tidak pernah durhaka dan selalu bertasbih",
        direction: "horizontal",
        start: [3, 6],
      },
      {
        answer: "JIBRIL",
        clue: "Malaikat yang bertugas menyampaikan wahyu",
        explanation: "Malaikat Jibril adalah penghulu para malaikat yang bertugas menyampaikan wahyu dari Allah kepada para nabi",
        direction: "vertical",
        start: [3, 6],
      },
      {
        answer: "WUDHU",
        clue: "Bersuci dengan air sebelum melaksanakan shalat",
        explanation: "Wudhu adalah cara bersuci dari hadas kecil dengan membasuh anggota tubuh tertentu menggunakan air suci",
        direction: "horizontal",
        start: [8, 4],
      },
      {
        answer: "MASJID",
        clue: "Tempat ibadah umat Islam",
        explanation: "Masjid adalah tempat suci bagi umat Islam untuk melaksanakan shalat berjamaah dan kegiatan keagamaan lainnya",
        direction: "vertical",
        start: [5, 8],
      },
    ],
    sourceMetadata: [
      { word: "SYAHADAT", type: "fiqh", reference: "Hadits Riwayat Muslim" },
      { word: "SHALAT", type: "fiqh", reference: "QS. Al-Baqarah: 43" },
      { word: "ZAKAT", type: "fiqh", reference: "QS. At-Taubah: 103" },
      { word: "PUASA", type: "fiqh", reference: "QS. Al-Baqarah: 183" },
      { word: "HAJI", type: "fiqh", reference: "QS. Ali Imran: 97" },
      { word: "IMALLAH", type: "quran", reference: "QS. Al-Ikhlas" },
      { word: "MALAIKAT", type: "quran", reference: "QS. Al-Fatir: 1" },
      { word: "JIBRIL", type: "quran", reference: "QS. Al-Baqarah: 97" },
      { word: "WUDHU", type: "fiqh", reference: "QS. Al-Maidah: 6" },
      { word: "MASJID", type: "general", reference: "QS. Al-Jin: 18" },
    ],
  };
}

/**
 * Get word count based on difficulty
 */
function getWordCount(difficulty: string): number {
  switch (difficulty) {
    case "easy": return 6;
    case "medium": return 10;
    case "hard": return 15;
    default: return 8;
  }
}

/**
 * Get cached AI puzzle (from local storage)
 */
export function getCachedAIPuzzle(key: string): AIGenerateResponse | null {
  try {
    const cached = localStorage.getItem(`ai_puzzle_${key}`);
    if (!cached) return null;

    const entry = JSON.parse(cached);
    const age = Date.now() - new Date(entry.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
      localStorage.removeItem(`ai_puzzle_${key}`);
      return null;
    }

    entry.usageCount += 1;
    localStorage.setItem(`ai_puzzle_${key}`, JSON.stringify(entry));
    return entry.response;
  } catch {
    return null;
  }
}

/**
 * Cache AI puzzle response
 */
export function cacheAIPuzzle(
  request: AIGenerateRequest,
  response: AIGenerateResponse
): void {
  try {
    const key = getCacheKey(request);
    const entry = {
      request,
      response,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    localStorage.setItem(`ai_puzzle_${key}`, JSON.stringify(entry));
  } catch {
    // Silently fail if localStorage is full
  }
}

/**
 * Generate cache key from request
 */
function getCacheKey(request: AIGenerateRequest): string {
  return `${request.subject}_${request.grade}_${request.difficulty}_${request.wordCount}`;
}
