import axios from "axios";
import Config from "react-native-config";
import { QuizQuestion } from "../../components/QuizComponent";

const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "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";

export const generateQuizQuestion = async (
  category: string,
  difficulty: string,
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

Du musst GENAU in diesem JSON-Format antworten:
{
  "question": "Deine völlig neue Frage hier",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Kurze Erklärung, warum diese Antwort richtig ist"
}

REGELN:
- correctAnswer muss der Index (0, 1, 2, oder 3) der richtigen Antwort sein
- Alle 4 Optionen müssen unterschiedlich und plausibel sein
- Nur eine Option darf richtig sein
- Generiere völlig originale und abwechslungsreiche Inhalte
- Bei Mathematik verwende jedes Mal andere Zahlen
- Bei Geschichte verwende verschiedene Ereignse/Personen
- Die Erklärung sollte kurz und klar sein
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

    const questionData = JSON.parse(responseContent);

    const questionKey = questionData.question?.substring(0, 50).toLowerCase();
    if (usedQuestions.has(questionKey)) {
      console.log("Doppelte Frage erkannt, generiere neue...");
      return await generateQuizQuestion(category, difficulty, usedQuestions);
    }

    if (
      !questionData.question ||
      !questionData.options ||
      !Array.isArray(questionData.options) ||
      questionData.options.length !== 4
    ) {
      throw new Error("Ungültiges Antwortformat");
    }

    return {
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer || 0,
      explanation: questionData.explanation || "Keine Erklärung verfügbar",
    };
  } catch (error) {
    console.error("Fehler beim Generieren der Frage:", error);
    throw new Error(
      "Frage konnte nicht generiert werden. Versuche es erneut."
    );
  }
};