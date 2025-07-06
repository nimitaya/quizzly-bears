import axios from "axios";
import Config from "react-native-config";
import { Difficulty, Category } from "../types";
import { AiQuestions, QuestionStructure } from "@/utilities/quiz-logic/data";
import { Alert } from "react-native";
import CustomAlert from "@/components/CustomAlert";

const GROQ_API_URL =
  process.env.EXPO_PUBLIC_GROQ_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() || "";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || "";

const DELAY_MS = 3000;
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastCorrectIndex = -1;
let repeatCount = 0;

function getNextCorrectOption(): string {
  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * 4);
    if (nextIndex === lastCorrectIndex) {
      repeatCount++;
    } else {
      repeatCount = 0;
    }
  } while (repeatCount > 1);
  lastCorrectIndex = nextIndex;
  return OPTION_KEYS[nextIndex];
}

const promptGenerator = (
  topic: string,
  difficulty: Difficulty,
  questionCount: number
): string => {
  const questionTypes = ["conceptual", "practical", "analytical", "applied"];
  const randomSeed = Math.floor(Math.random() * 10000);
  const timestamp = Date.now();

  return `You are a professional quiz question generator.

Your task: Generate EXACTLY ${questionCount} ORIGINAL and UNIQUE multiple-choice questions about this topic: "${topic}"

DIFFICULTY LEVEL: ${difficulty}

Each question must:
- Be based SPECIFICALLY on the topic: "${topic}"
- Contain only 1 correct answer
- Include 4 options: optionA, optionB, optionC, optionD
- Use RANDOM placement of the correct option
- Use short, clear wording (questions: max 120 characters, options: max 50 characters)
- Be written in BOTH English and German:
    "question": { "en": "...", "de": "..." }
    "optionA": { "isCorrect": true/false, "en": "...", "de": "..." }

Use question types: ${questionTypes.join(", ")}

Ensure:
- Only one correct option per question
- Correct options are spread across A/B/C/D
- No repeated questions
- No Markdown, no extra text

RESPONSE FORMAT:
{
  "category": "${topic}",
  "questionArray": [ ... ]
}`;
};

async function requestWithFallback(
  prompt: string,
  questionCount: number,
  topic: Category
): Promise<AiQuestions> {
  try {
    const groqResponse = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.8,
        presence_penalty: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return parseQuizResponse(
      groqResponse.data.choices[0].message.content,
      questionCount,
      topic
    );
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      Alert.alert(
        "The bear fell asleep in his den 🐻💤",
        "Let's look for another one..."
      );
    } else {
      console.error("GROQ error (not 401):", error);
    }

    // 🔁 Fallback to OpenRouter
    try {
      const fallbackResponse = await axios.post(
        OPENROUTER_API_URL,
        {
          model: "openrouter/auto",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return parseQuizResponse(
        fallbackResponse.data.choices[0].message.content,
        questionCount,
        topic
      );
    } catch (fallbackError: any) {
      if (axios.isAxiosError(fallbackError)) {
        console.error(
          "OpenRouter fallback failed. Status:",
          fallbackError.response?.status
        );
        console.error(
          "OpenRouter fallback failed. Data:",
          fallbackError.response?.data
        );
      } else {
        console.error("OpenRouter fallback failed:", fallbackError);
      }
      throw new Error("Both GROQ and OpenRouter failed to generate questions.");
    }
  }
}

function parseQuizResponse(
  content: string,
  questionCount: number,
  topic: string
): AiQuestions {
  const clean = content.replace(/```json\n?|```|\n*$/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON found in AI response");

  const parsed = JSON.parse(jsonMatch[0]);
  const questions = parsed.questionArray;
  const validated: QuestionStructure[] = [];

  for (let data of questions) {
    const correctKey = getNextCorrectOption();

    const question: QuestionStructure = {
      question: data.question,
      optionA: { ...data.optionA, isCorrect: correctKey === "optionA" },
      optionB: { ...data.optionB, isCorrect: correctKey === "optionB" },
      optionC: { ...data.optionC, isCorrect: correctKey === "optionC" },
      optionD: { ...data.optionD, isCorrect: correctKey === "optionD" },
    };

    validated.push(question);
  }

  return {
    category: topic,
    questionArray: validated.slice(0, questionCount),
  };
}

export const generateMultipleQuizQuestions = async (
  topic: Category,
  difficulty: Difficulty,
  questionCount: number = 10
): Promise<AiQuestions> => {
  await delay(DELAY_MS);
  const prompt = promptGenerator(topic, difficulty, questionCount);
  return await requestWithFallback(prompt, questionCount, topic);
};
