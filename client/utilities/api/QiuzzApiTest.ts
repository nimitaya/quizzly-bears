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
- ⚠️ DO NOT explain anything.
- ⚠️ DO NOT use Markdown.
- ⚠️ Reply ONLY with valid JSON in the following format:
RESPONSE FORMAT:
{
  "category": "${topic}",
    "questionArray": [
    {
      "question": { "en": "...", "de": "..." },
      "optionA": { "en": "...", "de": "...", "isCorrect": true/false },
      "optionB": { ... },
      "optionC": { ... },
      "optionD": { ... }
    },
    ...
  ]
}`;
};

async function requestWithFallback(
  prompt: string,
  questionCount: number,
  topic: Category
): Promise<AiQuestions> {
  // try {
  //   const groqResponse = await axios.post(
  //     GROQ_API_URL,
  //     {
  //       model: "llama3-8b-8192",
  //       messages: [{ role: "user", content: prompt }],
  //       temperature: 0.9,
  //       max_tokens: 3000,
  //       top_p: 0.9,
  //       frequency_penalty: 0.8,
  //       presence_penalty: 0.6,
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${GROQ_API_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   return parseQuizResponse(
  //     groqResponse.data.choices[0].message.content,
  //     questionCount,
  //     topic
  //   );
  // } catch (error: any) {
  //   if (axios.isAxiosError(error) && error.response?.status === 401) {
  //     Alert.alert(
  //       "The bear fell asleep in his den 🐻💤",
  //       "Let's look for another one..."
  //     );
  //   } else {
  //     console.error("GROQ error (not 401):", error);
  //   }

  // 🔁 Fallback to OpenRouter
  try {
    const fallbackResponse = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "mistralai/mistral-7b-instruct",
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
//}

function parseQuizResponse(
  content: string,
  questionCount: number,
  topic: string
): AiQuestions {
  console.log("🌐 AI raw content:\n", content);

  // Спроба витягти JSON

  const clean = content.replace(/```json\n?|```|\n*$/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("❌ No valid JSON found in AI response");

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    throw new Error("Malformed JSON from AI");
  }

  const questions = parsed.questionArray;
  if (!Array.isArray(questions)) {
    throw new Error("❌ 'questionArray' is not an array");
  }

  const validated: QuestionStructure[] = [];

  for (const [index, data] of questions.entries()) {
    // 🔎 Валідація ключів
    const missingFields = [];

    if (!data.question || typeof data.question !== "object") {
      missingFields.push("question");
    } else {
      if (!data.question.en) missingFields.push("question.en");
      if (!data.question.de) missingFields.push("question.de");
    }

    for (const key of OPTION_KEYS) {
      if (!data[key]) {
        missingFields.push(`${key}`);
      } else {
        if (!data[key].en) missingFields.push(`${key}.en`);
        if (!data[key].de) missingFields.push(`${key}.de`);
      }
    }

    if (missingFields.length > 0) {
      console.warn(
        `⚠️ Skipping question ${index + 1}: Missing fields:`,
        missingFields
      );
      continue;
    }

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

  if (validated.length === 0) {
    throw new Error("❌ No valid questions were parsed from AI response");
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
