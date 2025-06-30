import axios from "axios";
import Config from "react-native-config";
import { Category, Difficulty, QuizQuestion } from "../types"

const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "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";

// 1- Funktion zum Generieren mehrerer Quizfragen
// En quizApi.ts - Reemplaza la función generateMultipleQuizQuestions existente

export const generateMultipleQuizQuestions = async (
  category: string, // Cambio: ahora recibe string en lugar de Category
  difficulty: Difficulty,
  questionCount: number = 10
): Promise<QuizQuestion[]> => {
  try {
    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();
    const questionTypes = [
      "konzeptionell",
      "praktisch", 
      "analytisch",
      "anwendungsbezogen",
    ];

    const prompt = `Du bist ein Generator für Bildungsquiz-Fragen.

    SPEZIFISCHE ANWEISUNGEN:
    - Erstelle GENAU ${questionCount} völlig NEUE UND EINZIGARTIGE Fragen über ${category}
    - Schwierigkeitsgrad: ${difficulty}
    - Verwende verschiedene Fragetypen: ${questionTypes.join(', ')}
    - Referenznummer: ${randomSeed}
    - Zeitstempel: ${timestamp}
    
    WICHTIG: Jede Frage muss VÖLLIG ANDERS sein als alle anderen. 
    - Verwende verschiedene Konzepte, Zahlen, Beispiele und Ansätze
    - Keine zwei Fragen dürfen sich ähneln
    - Die Frage darf maximal 120 Zeichen lang sein
    - Die Antwortoptionen müssen klar und eindeutig sein. Weniger als 50 Zeichen pro Option
    
    Du musst GENAU in diesem JSON-Array-Format antworten:
    [
      {
        "question": {
          "de": "Erste völlig neue Frage auf Deutsch",
          "en": "First completely new question in English"
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
    ]
    
    REGELN:
    - Generiere GENAU ${questionCount} Fragen im Array
    - Nur eine Option pro Frage darf "isCorrect: true" sein
    - Alle Optionen müssen unterschiedlich und plausibel sein
    - Jede Frage muss völlig originell und unterschiedlich sein
    - Bei Mathematik verwende jedes Mal andere Zahlen
    - Bei Geschichte verwende verschiedene Ereignisse/Personen
    - Antworte NUR mit dem JSON-Array, ohne zusätzlichen Text`;

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
        max_tokens: 3000, // Aumentado para 10 preguntas
        top_p: 0.9,
        frequency_penalty: 0.8, 
        presence_penalty: 0.6,  
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    let responseContent = response.data.choices[0].message.content;
    responseContent = responseContent.replace(/```json\n?/g, "");
    responseContent = responseContent.replace(/```\n?/g, "");
    responseContent = responseContent.trim();
    
    console.log("API Response for Multiple Questions:", response.data);

    const questionsData = JSON.parse(responseContent);
    console.log("Parsed Questions Data:", questionsData);

    // Array validieren
    if (!Array.isArray(questionsData)) {
      throw new Error("Response ist kein Array");
    }

    // Validierung jeder Frage
    const validatedQuestions: QuizQuestion[] = [];
    
    for (let i = 0; i < questionsData.length; i++) {
      const questionData = questionsData[i];
      
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
        console.warn(`Frage ${i + 1} hat ungültiges Format, überspringe...`);
        continue;
      }

      // Encontrar la opción correcta
      const correctAnswer = ["optionA", "optionB", "optionC", "optionD"].findIndex(
        (option) => {
          const value = questionData[option as keyof typeof questionData];
          return (
            typeof value === "object" &&
            "isCorrect" in value &&
            value.isCorrect
          );
        }
      );

      validatedQuestions.push({
        question: questionData.question,
        optionA: questionData.optionA,
        optionB: questionData.optionB,
        optionC: questionData.optionC,
        optionD: questionData.optionD,
        correctAnswer: correctAnswer !== -1 ? correctAnswer : 0,
      });
    }

    if (validatedQuestions.length === 0) {
      throw new Error("Keine gültigen Fragen generiert");
    }

    console.log(`${validatedQuestions.length} valide Fragen generiert`);
    return validatedQuestions;

  } catch (error) {
    console.error("Fehler beim Generieren mehrerer Fragen:", error);
    throw new Error(
      "Mehrere Fragen konnten nicht generiert werden. Versuche es erneut."
    );
  }
};

// 2- Originale Funktion zum Generieren einer einzelnen Quizfrage
export const generateQuizQuestion = async (
  category: Category,
  difficulty: Difficulty,
  usedQuestions: Set<string>
): Promise<QuizQuestion> => {
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
          Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
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
};