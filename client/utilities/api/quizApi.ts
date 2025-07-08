import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, Difficulty } from "../types";
import { QuestionStructure, AiQuestions } from "@/utilities/quiz-logic/data";
import { LANGUAGES } from "../languages";

// ==================== KONFIGURATION DER APIs ====================
const GROQ_API_URL =
  process.env.EXPO_PUBLIC_GROQ_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() || "";
//console.log("GROQ API URL:", GROQ_API_URL);
//console.log("GROQ API Key:", GROQ_API_KEY);

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || "";
//console.log("OpenRouter API URL:", OPENROUTER_API_URL);
//console.log("OpenRouter API Key:", OPENROUTER_API_KEY);

// ==================== KONSTANTEN ====================
const DELAY_MS = 5000;

// ==================== HILFSFUNKTIONEN ====================
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== SPRACHFUNKTIONEN ====================
const getCurrentLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem("selected_language");
    return savedLanguage || "en";
  } catch (error) {
    console.error("Error beim aktuellen Sprache generiere", error);
    return "en";
  }
};

const getLanguageName = (code: string): string => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language?.name || "English";
};

// ==================== PROMPT-GENERATOR CONSISTENTE ====================
const generatePrompt = (
  topic: string,
  difficulty: Difficulty,
  questionCount: number,
  currentLanguageCode: string,
  currentLanguageName: string
): string => {
  // ID generation for uniqueness
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);
  const sessionId = Math.random().toString(36).substring(2, 15);
  const topicHash = topic.toLowerCase().replace(/\s+/g, "-").substring(0, 10);
  const uniqueId = `${topicHash}-${difficulty}-${timestamp}-${randomSeed}-${sessionId}`;

  return `Generate EXACTLY ${questionCount} unique, factual multiple-choice quiz questions about "${topic}" at the ${difficulty} level.
JSON FORMAT (respond with this exact structure only):
{
  "category": "${topic}",
  "questionArray": [
    {
      "question": {
        "de": "German question text",
        "${currentLanguageCode}": "Native ${currentLanguageName} question text"
      },
      "optionA": {
        "isCorrect": true/false,
        "de": "German answer",
        "${currentLanguageCode}": "Native ${currentLanguageName} answer"
      },
      "optionB": {
        "isCorrect": true/false,
        "de": "German answer",
        "${currentLanguageCode}": "Native ${currentLanguageName} answer"
      },
      "optionC": {
        "isCorrect": true/false,
        "de": "German answer",
        "${currentLanguageCode}": "Native ${currentLanguageName} answer"
      },
      "optionD": {
        "isCorrect": true/false,
        "de": "German answer",
        "${currentLanguageCode}": "Native ${currentLanguageName} answer"
      }
    }
  ]
}
- Each question must be completely original and test a different aspect of "${topic}"
- Questions must be written in **both German** and **${currentLanguageName}** (${currentLanguageCode})
- All text in ${currentLanguageCode} must be in authentic, natural native language — no English allowed
- Use only verified facts, specific names, dates, and real-world data
- Vary question styles: factual, analytical, comparative, and conceptual
- Each question must be up to **120 characters long**
- Provide exactly four answer options per question, labeled A, B, C, and D
- Only ONE correct answer per question: use \`"isCorrect": true\` for that option
- Distribute correct answers **randomly and evenly** among A, B, C, and D — over the full question set, each option must appear as the correct answer in approximately 25% of cases
- The same correct option (A, B, C, or D) **must NOT appear more than twice in a row**
- Make incorrect options **plausible** but clearly wrong and not misleading
- Use clear, unambiguous wording in all answer options
- Ensure all characters are UTF-8 encoded for ${currentLanguageName}
- Avoid duplicated questions, options, or phrasing
- Escape all JSON special characters properly
- Do NOT include any extra text — only the final JSON structure
- Maintain the exact same structure, tone, and formatting across ALL requests
- Do NOT introduce new output styles, patterns, or formats in future generations
- Persist and respect all rules consistently in every session or follow-up request
-All question must have different answer options, if you generate some question with the same answer options, you must generate a new question
- Session ID: ${uniqueId}`;
};

// ==================== API-FUNKTIONEN ====================
const apiKeys = [
  process.env.EXPO_PUBLIC_GROQ_API_KEY,
  process.env.EXPO_PUBLIC_BEAR_KEY_1,
  process.env.EXPO_PUBLIC_BEAR_KEY_2,
  process.env.EXPO_PUBLIC_BEAR_KEY_3,
  process.env.EXPO_PUBLIC_BEAR_KEY_4,
  process.env.EXPO_PUBLIC_BEAR_KEY_5,
].filter(Boolean);


const callGroqAPI = async (prompt: string) => {
  console.log("Calling GROQ API with fallback keys...");

  for (const key of apiKeys) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,      
          max_tokens: 4000,    
          top_p: 0.95,          
          frequency_penalty: 0, 
          presence_penalty: 0,  
          
        },
        {
          headers: {
            Authorization: `Bearer ${key} `,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`GROQ API successful`);
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.warn(`Groq failed, trying next key...`, error.message || error);
      if (error.response && error.response.status !== 401) {
        throw error;
      }
    }
  }

  throw new Error("Alle keys for GROQ API failed. Could not generate questions.");
};


const callOpenRouterAPI = async (prompt: string) => {
  console.log("Calling OpenRouter API");

  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      top_p: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Quizzly-bears",
      },
    }
  );

  console.log("OpenRouter API successful");
  return response.data.choices[0].message.content;
};


// ==================== FALLBACK-SYSTEM ====================================
const requestWithFallback = async (prompt: string): Promise<string> => {
  try {
    return await callGroqAPI(prompt);
  } catch (groqError) {
    console.warn("GROQ API failed:", groqError);

    if (axios.isAxiosError(groqError) && groqError.response?.status === 401) {
      console.log("Authentication error with GROQ, switching to OpenRouter...");
    }

    try {
      return await callOpenRouterAPI(prompt);
    } catch (openRouterError) {
      console.error("Both APIs failed:", openRouterError);
      throw new Error("Both APIs failed. Could not generate questions.");
    }
  }
};

// ==================== ANTWORTVERARBEITUNG CORREGIDA ====================
const parseQuizResponse = (
  content: string,
  questionCount: number,
  topic: string,
  currentLanguageCode: string
): AiQuestions => {
  // Clean JSON extraction
  let cleanContent = content.replace(/```json\n?/g, "");
  cleanContent = cleanContent.replace(/```\n?/g, "");
  cleanContent = cleanContent.trim();

  // Extract JSON without extra text
  const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No valid JSON found:", cleanContent);
    throw new Error(`Invalid response from model: ${cleanContent}`);
  }

  const cleanJson = jsonMatch[0].trim();
  console.log("Clean JSON extracted", cleanJson);

  // Parse JSON
  let parsedData;
  try {
    parsedData = JSON.parse(cleanJson);
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    console.error("JSON mit extra Text:", cleanJson);
    throw new Error("Error parsing AI JSON response");
  }

  const questionsData = parsedData.questionArray;
  if (!Array.isArray(questionsData)) {
    console.error("questionArray is not an array:", questionsData);
    throw new Error("questionArray is not a valid array");
  }

  // Validate questions and keep AI responses exactly as-is
  const validatedQuestions: QuestionStructure[] = [];

  for (let i = 0; i < questionsData.length; i++) {
    const questionData = questionsData[i];

    // Basic structure validation
    if (
      !questionData.question ||
      !questionData.optionA ||
      !questionData.optionB ||
      !questionData.optionC ||
      !questionData.optionD
    ) {
      console.warn(`Question ${i + 1} has incomplete structure`);
      continue;
    }

    // German text validation
    if (
      typeof questionData.question.de !== "string" ||
      typeof questionData.optionA.de !== "string" ||
      typeof questionData.optionB.de !== "string" ||
      typeof questionData.optionC.de !== "string" ||
      typeof questionData.optionD.de !== "string"
    ) {
      console.warn(`Question ${i + 1} missing German texts`);
      continue;
    }

    // Target language text validation
    if (
      typeof questionData.question[currentLanguageCode] !== "string" ||
      typeof questionData.optionA[currentLanguageCode] !== "string" ||
      typeof questionData.optionB[currentLanguageCode] !== "string" ||
      typeof questionData.optionC[currentLanguageCode] !== "string" ||
      typeof questionData.optionD[currentLanguageCode] !== "string"
    ) {
      console.warn(`Question ${i + 1} missing target language texts`);
      continue;
    }

    // Validate exactly one correct answer
    const correctCount = [
      questionData.optionA.isCorrect,
      questionData.optionB.isCorrect,
      questionData.optionC.isCorrect,
      questionData.optionD.isCorrect,
    ].filter(Boolean).length;

    if (correctCount !== 1) {
      console.warn(
        `Question ${i + 1} has ${correctCount} correct answers instead of 1`
      );
      continue;
    }

    // Check for duplicate answers
    const optionTexts = [
      questionData.optionA.de,
      questionData.optionB.de,
      questionData.optionC.de,
      questionData.optionD.de,
    ];

    // Keep AI response exactly as provided - NO MODIFICATION
    const question: QuestionStructure = {
      question: questionData.question,
      optionA: {
        ...questionData.optionA,
        isCorrect: Boolean(questionData.optionA.isCorrect),
      },
      optionB: {
        ...questionData.optionB,
        isCorrect: Boolean(questionData.optionB.isCorrect),
      },
      optionC: {
        ...questionData.optionC,
        isCorrect: Boolean(questionData.optionC.isCorrect),
      },
      optionD: {
        ...questionData.optionD,
        isCorrect: Boolean(questionData.optionD.isCorrect),
      },
    };

    validatedQuestions.push(question);
  }
  if (validatedQuestions.length === 0) {
    throw new Error("No questions could be validated from the response");
  }

  const finalQuestions = validatedQuestions.slice(0, questionCount);
  console.log(`${finalQuestions.length} valid questions generated`);

  return {
    category: topic,
    questionArray: finalQuestions,
  };
};

// ==================== HAUPTFUNKTION ====================
export const generateMultipleQuizQuestions = async (
  topic: string,
  difficulty: Difficulty,
  questionCount: number = 10
): Promise<AiQuestions> => {
  console.log(
    `Starting generation of ${questionCount} questions about: ${topic}`
  );

  // Apply initial delay
  await delay(DELAY_MS);

  try {
    // Get language configuration
    const currentLanguageCode = await getCurrentLanguage();
    const currentLanguageName = getLanguageName(currentLanguageCode);

    console.log(
      `Generating in: ${currentLanguageName} (${currentLanguageCode})`
    );

    // Generate prompt
    const prompt = generatePrompt(
      topic,
      difficulty,
      questionCount,
      currentLanguageCode,
      currentLanguageName
    );

    // Make request with fallback system
    const responseContent = await requestWithFallback(prompt);

    // Process response
    const result = parseQuizResponse(
      responseContent,
      questionCount,
      topic,
      currentLanguageCode
    );

    console.log(`Generation completed successfully`);
    return result;
  } catch (error) {
    console.error("Error in question generation:", error);
    throw new Error("Questions could not be generated. Please try again.");
  }
};

// ==================== Kategorizierung ====================
const PREDEFINED_CATEGORIES: Category[] = [
  "Science",
  "History",
  "Geography",
  "Sports",
  "Media",
  "Culture",
  "Daily Life",
];

export const categorizeTopic = async (userInput: string): Promise<string> => {
  try {
    const prompt = `Categorize this topic into exactly one category: "${userInput}"

Categories: History, Science, Sports, Geography, Media, Culture, Daily life

Examples:
- "Dinosaurs" → "Science"
- "Football" → "Sports" 
- "Rome" → "History"
- "Harry Potter" → "Media"

Answer with category name only:`;

    const responseContent = await requestWithFallback(prompt);
    let categorizedResult = responseContent.trim();

    // Search for exact category
    const foundCategory = PREDEFINED_CATEGORIES.find(
      (category) => category.toLowerCase() === categorizedResult.toLowerCase()
    );

    if (foundCategory) {
      return foundCategory;
    }

    // Fallback: Search for similar categories
    const similarCategory = PREDEFINED_CATEGORIES.find(
      (category) =>
        categorizedResult.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(categorizedResult.toLowerCase())
    );

    return similarCategory || "Culture";
  } catch (error) {
    console.error("Error in categorization:", error);
    return "Culture";
  }
};

console.log("QuizAPI with consistent system successfully loaded");

// 2- Originale Funktion zum Generieren einer einzelnen Quizfrage
/*export const generateQuizQuestion = async (
category: Category,
difficulty: Difficulty,
usedQuestions: Set<string>
): Promise<AiQuestions> => {
try {
const randomSeed = Math.floor(Math.random() * 10000);
const timestamp = Date.now();
const questionTypes = [
"konzeptionell",
"praktisch",
"analytisch",
"anwendungsbezogen",
];
const randomType =
questionTypes[Math.floor(Math.random() * questionTypes.length)];

const prompt = `Du bist ein Generator für Bildungsquiz-Fragen.

SPEZIFISCHE ANWEISUNGEN:
- Erstelle EINE völlig NEUE UND EINZIGARTIGE Frage über ${category}
- Schwierigkeitsgrad: ${difficulty}
- Fragetyp: ${randomType}
- Referenznummer: ${randomSeed}
- Zeitstempel: ${timestamp}
WICHTIG: Jede Frage muss ANDERS sein als alle vorherigen Fragen. Verwende verschiedene Konzepte, Zahlen, Beispiele und Ansätze.
- Die Frage darf maximal 30 Zeichen lang sein.
- Die Antwortoptionen müssen klar und eindeutig sein. Weniger als 20 Zeichen pro Option.
Du musst GENAU in diesem JSON-Format antworten:
{
"question": {
"de": "Deine völlig neue Frage hier auf Deutsch",
"en": "Your completely new question here in English"
},
"optionA": {
"isCorrect": true,
"de": "Option A auf Deutsch",
"en": "Option A in English"
},
"optionB": {
"isCorrect": false,
"de": "Option B auf Deutsch",
"en": "Option B in English"
},
"optionC": {
"isCorrect": false,
"de": "Option C auf Deutsch",
"en": "Option C in English"
},
"optionD": {
"isCorrect": false,
"de": "Option D auf Deutsch",
"en": "Option D in English"
}
}
REGELN:
- Nur eine Option darf "isCorrect: true" sein
- Alle Optionen müssen unterschiedlich und plausibel sein
- Generiere völlig originale und abwechslungsreiche Inhalte
- Bei Mathematik verwende jedes Mal andere Zahlen
- Bei Geschichte verwende verschiedene Ereignisse/Personen
- Antworte NUR mit dem JSON, ohne zusätzlichen Text`;

const response = await axios.post(
GROQ_API_URL,
{
model: "llama3-8b-8192",
messages: [
{
role: "user",
content: prompt,
},
],
temperature: 0.9,
max_tokens: 400,
top_p: 0.9,
frequency_penalty: 0.5,
presence_penalty: 0.3,
},
{
headers: {
Authorization: `Bearer ${(GROQ_API_KEY ?? "").trim()}`,
"Content-Type": "application/json",
},
}
);

let responseContent = response.data.choices[0].message.content;
responseContent = responseContent.replace(/```json\n?/g, "");
responseContent = responseContent.replace(/```\n?/g, "");
responseContent = responseContent.trim();
console.log("API Response:", response.data);

const questionData = JSON.parse(responseContent);
console.log("Parsed Question Data:", questionData);

const questionKey = questionData.question.de.substring(0, 50).toLowerCase();
if (usedQuestions.has(questionKey)) {
console.log("Doppelte Frage erkannt, generiere neue...");
return await generateQuizQuestion(category, difficulty, usedQuestions);
}

if (
!questionData.question ||
typeof questionData.question.de !== "string" ||
typeof questionData.question.en !== "string" ||
!questionData.optionA ||
!questionData.optionB ||
!questionData.optionC ||
!questionData.optionD ||
typeof questionData.optionA.de !== "string" ||
typeof questionData.optionA.en !== "string" ||
typeof questionData.optionB.de !== "string" ||
typeof questionData.optionB.en !== "string" ||
typeof questionData.optionC.de !== "string" ||
typeof questionData.optionC.en !== "string" ||
typeof questionData.optionD.de !== "string" ||
typeof questionData.optionD.en !== "string"
) {
throw new Error("Ungültiges Antwortformat");
}

return {
question: questionData.question,
optionA: questionData.optionA,
optionB: questionData.optionB,
optionC: questionData.optionC,
optionD: questionData.optionD,
correctAnswer: questionData.correctAnswer || 0,
};
} catch (error) {
console.error("Fehler beim Generieren der Frage:", error);
throw new Error(
"Frage konnte nicht generiert werden. Versuche es erneut."
);
}
};*/
