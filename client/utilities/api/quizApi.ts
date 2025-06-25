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

    console.log("Parsed Question Data:", questionData); // Log the parsed response for debugging

    const questionKey = questionData.question.de.substring(0, 50).toLowerCase(); // Access the 'de' property explicitly
    if (usedQuestions.has(questionKey)) {
      console.log("Doppelte Frage erkannt, generiere neue...");
      return await generateQuizQuestion(category, difficulty, usedQuestions);
    }

    if (
      !questionData.question ||
      typeof questionData.question.de !== "string" || // Ensure 'de' is a string
      typeof questionData.question.en !== "string" || // Ensure 'en' is a string
      !questionData.optionA ||
      !questionData.optionB ||
      !questionData.optionC ||
      !questionData.optionD ||
      typeof questionData.optionA.de !== "string" || // Ensure options have 'de' strings
      typeof questionData.optionB.de !== "string" ||
      typeof questionData.optionC.de !== "string" ||
      typeof questionData.optionD.de !== "string"
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

