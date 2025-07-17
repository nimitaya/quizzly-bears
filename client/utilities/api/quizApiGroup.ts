import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, Difficulty } from "../types";
import { QuestionStructure, AiQuestions } from "@/utilities/quiz-logic/data";
import { LANGUAGES } from "../languages";

// ==================== API CONFIGURATION =============================================
const GROQ_API_URL =
  process.env.EXPO_PUBLIC_GROQ_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() || "";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || "";

// ==================== CONSTANTS ==========================================================
const DELAY_MS = 5000;

// ==================== UTILITY FUNCTIONS =====================================================
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== LANGUAGE FUNCTIONS ====================================================
const getCurrentLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem("selected_language");
    return savedLanguage || "en";
  } catch (error) {
    console.error("Error getting current language", error);
    return "en";
  }
};

const getLanguageName = (code: string): string => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language?.name || "English";
};

// ==================== DIFFICULTY LEVELS CONFIGURATION ================================
const getDifficultyDescription = (difficulty: Difficulty): string => {
  const difficultyLevels = {
    easy: {
      description: "Basic knowledge and common facts",
      characteristics: "Simple recall, well-known information, straightforward concepts",
      examples: "What is the capital of France? Which planet is closest to the Sun?",
      complexity: "Elementary level understanding required"
    },
    medium: {
      description: "Moderate complexity requiring some analysis",
      characteristics: "Application of knowledge, moderate reasoning, connections between concepts",
      examples: "Why does water boil at different temperatures at different altitudes? How do photosynthesis and respiration relate?",
      complexity: "Intermediate level understanding and basic analysis required"
    },
    hard: {
      description: "Advanced knowledge requiring deep understanding",
      characteristics: "Complex analysis, synthesis of multiple concepts, expert-level knowledge",
      examples: "What are the implications of quantum entanglement for computing? How do monetary policies affect international trade dynamics?",
      complexity: "Advanced level critical thinking and specialized knowledge required"
    }
  };

  return difficultyLevels[difficulty]?.description || difficultyLevels.medium.description;
};

const getDifficultyCharacteristics = (difficulty: Difficulty): string => {
  const difficultyLevels = {
    easy: "Simple recall, well-known information, straightforward concepts",
    medium: "Application of knowledge, moderate reasoning, connections between concepts",
    hard: "Complex analysis, synthesis of multiple concepts, expert-level knowledge"
  };
  
  return difficultyLevels[difficulty] || difficultyLevels.medium;
};

const getDifficultyComplexity = (difficulty: Difficulty): string => {
  const difficultyLevels = {
    easy: "Elementary level understanding required",
    medium: "Intermediate level understanding and basic analysis required",
    hard: "Advanced level critical thinking and specialized knowledge required"
  };
  
  return difficultyLevels[difficulty] || difficultyLevels.medium;
};

const getDifficultyExamples = (difficulty: Difficulty): string => {
  const difficultyLevels = {
    easy: "What is the capital of France? Which planet is closest to the Sun?",
    medium: "Why does water boil at different temperatures at different altitudes? How do photosynthesis and respiration relate?",
    hard: "What are the implications of quantum entanglement for computing? How do monetary policies affect international trade dynamics?"
  };
  
  return difficultyLevels[difficulty] || difficultyLevels.medium;
};

// ==================== CONSISTENT PROMPT GENERATOR ========================================
const generatePrompt = (
  topic: string,
  difficulty: Difficulty,
  questionCount: number,
  languageCodes: string[]
): string => {
  // ID generation for uniqueness
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);
  const sessionId = Math.random().toString(36).substring(2, 15);
  const topicHash = topic.toLowerCase().replace(/\s+/g, "-").substring(0, 10);
  const uniqueId = `${topicHash}-${difficulty}-${timestamp}-${randomSeed}-${sessionId}`;
  const difficultySpec = getDifficultyDescription(difficulty);

  // Create language entries for the JSON structure
  const languageEntries = languageCodes
    .filter(code => code !== 'en') // Exclude English as it's already specified separately
    .map(code => {
      const name = getLanguageName(code);
      return `"${code}": "Native ${name} question text"`;
    })
    .join(',\n          ');

  // Create language entries for answer options
  const optionLanguageEntries = languageCodes
    .filter(code => code !== 'en') // Exclude English as it's already specified separately
    .map(code => {
      const name = getLanguageName(code);
      return `"${code}": "Native ${name} answer"`;
    })
    .join(',\n          ');

  // Get all difficulty specs
  const difficultyChar = getDifficultyCharacteristics(difficulty);
  const difficultyComp = getDifficultyComplexity(difficulty);
  const difficultyEx = getDifficultyExamples(difficulty);

  return `Generate EXACTLY ${questionCount} unique multiple-choice quiz questions about "${topic}" at ${difficulty.toUpperCase()} difficulty level.

  DIFFICULTY SPECIFICATIONS FOR ${difficulty.toUpperCase()}:
  - Level: ${difficulty}
  - Characteristics: ${difficultyChar}
  - Complexity: ${difficultyComp}
  - Examples: ${difficultyEx}
  
  REQUIRED JSON FORMAT (respond with this structure only):
  {
    "category": "${topic}",
    "questionArray": [
      {
        "question": {
          "en": "English question text",
          ${languageEntries}
        },
        "optionA": {
          "isCorrect": true/false,
          "en": "English answer",
          ${optionLanguageEntries}
        },
        "optionB": {
          "isCorrect": true/false,
          "en": "English answer",
          ${optionLanguageEntries}
        },
        "optionC": {
          "isCorrect": true/false,
          "en": "English answer",
          ${optionLanguageEntries}
        },
        "optionD": {
          "isCorrect": true/false,
          "en": "English answer",
          ${optionLanguageEntries}
        }
      }
    ]
  }
  
  CONTENT REQUIREMENTS:
  - Create ${questionCount} completely unique questions about different aspects of "${topic}"
  - Include questions in both English and all requested languages 
  - Use only factual, verifiable information with specific names, dates, and data
  - Mix question types: factual recall, analysis, comparison, and application
  - IMPORTANt: All questions must match ${difficulty.toUpperCase()} difficulty level: ${difficultySpec}
  - Question complexity should require: ${difficultyComp}
  
  CHARACTER LIMITS:
  - Question text: maximum 120 characters per language
  - Answer options: maximum 40 characters per language
  - Count includes spaces and punctuation
  
  ANSWER STRUCTURE:
  - Provide exactly 4 options: A, B, C, D for each question
  - Set "isCorrect": true for exactly ONE option per question
  - Set "isCorrect": false for the other three options
  - Make incorrect options believable but clearly wrong
  - Use precise, unambiguous language in all options
  - All answer must be different from each other, no same text.

  CRITICAL ANTI-DUPLICATION REQUIREMENTS:
- ALL 4 options must be completely different in meaning and wording
- NO two options can be similar, even if slightly different
- NO options like: "Paris", "Paris, France", "The city of Paris", "Capital Paris"
- NO number sequences like: "1", "2", "3", "4" or "2020", "2021", "2022", "2023"
- NO synonyms or near-synonyms: "Big", "Large", "Huge", "Enormous"
- NO options that are subsets of others: "Spain" vs "Spain and Portugal"
- Each option must represent a DISTINCT, UNIQUE concept or answer
- Vary option types: mix names, numbers, concepts, places appropriately

EXAMPLES OF FORBIDDEN DUPLICATES:
❌ BAD: ["Red", "Blue", "Green", "Yellow"] - too similar category
❌ BAD: ["1995", "1996", "1997", "1998"] - consecutive numbers
❌ BAD: ["Madrid", "Madrid, Spain", "Capital Madrid", "City of Madrid"] - same concept
❌ BAD: ["Cat", "Dog", "Bird", "Fish"] - all animals, too similar

✅ GOOD: ["Paris", "Tokyo", "1889", "Iron"] - completely different concepts
✅ GOOD: ["Shakespeare", "1969", "Pacific", "Democracy"] - diverse answer types
  
  ANSWER DISTRIBUTION:
  - Distribute correct answers across all options (A, B, C, D)
  - Target 25% of questions with each option as correct
  - Never place correct answer in same position more than 2 consecutive times
  - Example: if questions 1-2 have correct answer A, question 3 must be B, C, or D
  
  QUALITY STANDARDS:
  - No duplicate questions or similar phrasings
  - Each question must test different knowledge
  - All answer options within each question must be unique
  - Use proper UTF-8 encoding for all requested languages
  - Escape JSON special characters: quotes, backslashes, etc.
  
  OUTPUT FORMAT:
  - Return ONLY the JSON structure above
  - No additional text, explanations, or comments
  - No markdown formatting or code blocks
  - Maintain consistent structure across all generations
  
  Session ID: ${uniqueId}`;
};

// ==================== API FUNCTIONS ==================================================
const apiKeys = [
  GROQ_API_KEY,
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
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 4000,
          top_p: 0.3,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
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

  throw new Error(
    "All keys for GROQ API failed. Could not generate questions."
  );
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

// ==================== FALLBACK SYSTEM =================================================
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

// ==================== RESPONSE PROCESSING =================================
const parseQuizResponse = (
  content: string,
  questionCount: number,
  topic: string,
  languageCodes: string[]
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
    console.error("JSON with extra text:", cleanJson);
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

    // English text validation - always required as fallback
    if (
      typeof questionData.question.en !== "string" ||
      typeof questionData.optionA.en !== "string" ||
      typeof questionData.optionB.en !== "string" ||
      typeof questionData.optionC.en !== "string" ||
      typeof questionData.optionD.en !== "string"
    ) {
      console.warn(`Question ${i + 1} missing English texts`);
      continue;
    }

    // Requested languages validation
    let missingLanguage = false;
    let missingFields = [];
    
    for (const langCode of languageCodes) {
      // Skip English as it's already validated
      if (langCode === 'en') continue;
      
      const fieldsToCheck = [
        { name: "question", field: questionData.question[langCode] },
        { name: "optionA", field: questionData.optionA[langCode] },
        { name: "optionB", field: questionData.optionB[langCode] },
        { name: "optionC", field: questionData.optionC[langCode] },
        { name: "optionD", field: questionData.optionD[langCode] },
      ];
      
      const missing = fieldsToCheck
        .filter(item => typeof item.field !== "string")
        .map(item => item.name);
        
      if (missing.length > 0) {
        console.warn(
          `Question ${i + 1} missing ${langCode} texts for: ${missing.join(', ')}`
        );
        missingLanguage = true;
        missingFields.push(`${langCode}: ${missing.join(', ')}`);
        break;
      }
    }

    if (missingLanguage) {
      console.warn(`Skipping question ${i + 1} due to missing translations: ${missingFields.join('; ')}`);
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
      questionData.optionA.en,
      questionData.optionB.en,
      questionData.optionC.en,
      questionData.optionD.en,
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

// ==================== MAIN FUNCTION ============================================
/**
 * Generates multiple quiz questions in specified languages using AI
 * 
 * @param topic - The topic to generate questions about
 * @param difficulty - The difficulty level (easy, medium, hard)
 * @param questionCount - Number of questions to generate (default: 10)
 * @param languages - Array of language codes to include (e.g. ['en', 'de', 'fr'])
 *                    English ('en') is always included as fallback
 * @returns Promise with AiQuestions containing the generated questions
 */
export const generateMultiplayerQuestions = async (
  topic: string,
  difficulty: Difficulty,
  questionCount: number = 10,
  languages: string[] = []
): Promise<AiQuestions> => {
  console.log(
    `Starting generation of ${questionCount} questions about: ${topic}`
  );

  // Apply initial delay
  await delay(DELAY_MS);

  try {
    // Get default language if no languages are provided
    let languageCodes = [...languages];
    
    // Always ensure English is included as fallback
    if (!languageCodes.includes('en')) {
      languageCodes.push('en');
    }
    
    // If no languages were provided, use the current language
    if (languageCodes.length === 1 && languageCodes[0] === 'en') {
      const currentLanguageCode = await getCurrentLanguage();
      if (currentLanguageCode !== 'en' && !languageCodes.includes(currentLanguageCode)) {
        languageCodes.push(currentLanguageCode);
        console.log(`Added current language: ${currentLanguageCode}`);
      }
    }
    
    // Get language names for better logging
    const languageNames = languageCodes.map(code => {
      const name = getLanguageName(code);
      return `${name} (${code})`;
    });
    
    console.log(
      `Generating in languages: ${languageNames.join(', ')}`
    );

    // Generate prompt
    const prompt = generatePrompt(
      topic,
      difficulty,
      questionCount,
      languageCodes
    );

    // Make request with fallback system
    const responseContent = await requestWithFallback(prompt);

    // Process response
    const result = parseQuizResponse(
      responseContent,
      questionCount,
      topic,
      languageCodes
    );

    console.log(`Generation completed successfully`);
    return result;
  } catch (error: any) {
    // Enhanced error handling with more context
    const errorMsg = error.message || String(error);
    console.error(`Error in question generation for topic "${topic}":`, errorMsg);
    
    // Provide more specific error message based on what went wrong
    if (errorMsg.includes("API failed") || errorMsg.includes("API key")) {
      throw new Error("API connection failed. Please check your internet connection and try again.");
    } else if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
      throw new Error("Error processing AI response. The model returned an invalid format.");
    } else if (errorMsg.includes("No questions could be validated")) {
      throw new Error(`No valid questions could be generated for "${topic}". Please try a different topic or difficulty level.`);
    } else {
      throw new Error("Questions could not be generated. Please try again later.");
    }
  }
};

// ==================== CATEGORIZATION ====================
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