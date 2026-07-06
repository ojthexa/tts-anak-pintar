/**
 * API Route for secure server-side AI puzzle generation
 * Proxy for OpenAI calls - keeps API key server-side
 */

import { NextResponse } from "next/server";
import { getPromptTemplate } from "@/services/ai/prompts";
import type { AIGenerateRequest, AIGenerateResponse } from "@/types/ai";

/**
 * POST /api/generate-puzzle
 * Generate crossword puzzle content using AI
 */
export async function POST(request: Request) {
  // Lazy-init OpenAI client (avoid build-time initialization error)
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
  try {
    const body = (await request.json()) as AIGenerateRequest;
    const { subject, grade, difficulty, wordCount, language, theme } = body;

    if (!subject || !grade || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: subject, grade, difficulty" },
        { status: 400 }
      );
    }

    const prompt = getPromptTemplate({
      subject,
      grade,
      difficulty,
      wordCount: wordCount || getWordCount(difficulty),
      language: language || "id",
      theme,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational puzzle generator for Indonesian elementary school children. Output ONLY valid JSON.",
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
    if (!content) {
      return NextResponse.json(
        { error: "AI failed to generate content" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as AIGenerateResponse;

    return NextResponse.json({
      ...parsed,
      _meta: {
        model: response.model,
        tokens: response.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Error in generate-puzzle API:", error);
    return NextResponse.json(
      { error: "Failed to generate puzzle" },
      { status: 500 }
    );
  }
}

function getWordCount(difficulty: string): number {
  switch (difficulty) {
    case "easy":
      return 6;
    case "medium":
      return 10;
    case "hard":
      return 15;
    default:
      return 8;
  }
}
