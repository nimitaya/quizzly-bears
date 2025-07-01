import axios from "axios";
import Config from "react-native-config";
import { Category, Difficulty, QuizQuestion } from "../types";
import { QuestionStructure, AiQuestions } from "@/utilities/quiz-logic/data";

const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "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";

//========================Funktion zum Generieren mehrerer Quizfragen==================
export const generateMultipleQuizQuestions = async (
  topic: string, // NEU: Thema anstelle von Kategorie
  difficulty: Difficulty,
  questionCount: number = 10
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
  

// ============== SONJA PROMPT ==============
const prompt = `Du bist ein Generator für hochwertige Bildungsquiz-Fragen.

AUFGABE:
Erstelle GENAU ${questionCount} völlig neue, originelle Fragen zum Thema "${topic}" mit dem Schwierigkeitsgrad "${difficulty}". Verwende dabei abwechslungsreiche Fragetypen: ${questionTypes.join(', ')}.

FORMAT:
Antworte ausschließlich mit einem JSON-Array im folgenden Format:
[
  {
    "question": {
      "de": "Frage auf Deutsch (max. 120 Zeichen)",
      "en": "Question in English (max. 120 characters)"
    },
    "optionA": {
      "isCorrect": true/false,
      "de": "Antwort A auf Deutsch (max. 50 Zeichen)",
      "en": "Answer A in English (max. 50 characters)"
    },
    "optionB": { ... },
    "optionC": { ... },
    "optionD": { ... }
  },
  ...
]

REGELN:
- ${questionCount} Fragen exakt, keine mehr oder weniger
- Nur EINE Antwort pro Frage darf isCorrect: true sein
- Die richtige Antwort muss zufällig auf A, B, C oder D verteilt sein und muss die korrekte Antwort auf die Frage sein
- Alle Antwortoptionen müssen plausibel, eindeutig und unterscheidbar sein
- Es dürfen KEINE doppelten oder sinngleichen Antwortoptionen auftreten. Jede Option muss einzigartig, eindeutig und sinnvoll unterscheidbar sein.
- Fragen dürfen sich **nicht** ähneln: verschiedene Zahlen, Konzepte, Beispiele
- Frage max. 120 Zeichen, Antworten je max. 50 Zeichen
- Bei Mathe: immer andere Zahlen und Rechenarten
- Bei Geschichte: verschiedene Epochen, Personen, Ereignisse
- Keine Duplikate oder inhaltlichen Wiederholungen
- Die anderen Sprachen sollen natürlich und lokalisiert sein, **keine** Wort für Wort Übersetzung

METADATEN:
- Referenznummer: ${randomSeed}
- Zeitstempel: ${timestamp}

WICHTIG:
Antworte ausschließlich mit dem JSON-Array, ohne Erläuterungen, Kommentare oder zusätzlichen Text.
`;
// ==========================================

  // const prompt = `Du bist ein Generator für Bildungsquiz-Fragen.

  // SPEZIFISCHE ANWEISUNGEN:
  // - Erstelle GENAU ${questionCount} völlig NEUE UND EINZIGARTIGE Fragen über das spezifische Thema: "${topic}"
  // - Schwierigkeitsgrad: ${difficulty}
  // - Verwende verschiedene Fragetypen: ${questionTypes.join(', ')}
  
  // WICHTIGE FOKUSSIERUNG:
  // - ALLE Fragen müssen DIREKT mit "${topic}" zu tun haben
  // - Verwende spezifische Details, Charaktere, Ereignisse oder Aspekte von "${topic}"
  // - Die Fragen sollen das Wissen über "${topic}" testen, nicht nur allgemeine Kenntnisse
  
  // BEISPIELE FÜR SPEZIFISCHE FRAGEN:
  // - Wenn "${topic}" = "Harry Potter": Frage nach Charakteren wie Hermione, Zaubersprüchen wie Expelliarmus, Häusern wie Gryffindor
  // - Wenn "${topic}" = "Einstein": Frage nach E=mc², Relativitätstheorie, Nobelpreis
  // - Wenn "${topic}" = "Fußball": Frage nach FIFA, Weltmeisterschaft, bekannten Spielern
  
  // WEITERE REGELN:
  // - Jede Frage muss VÖLLIG ANDERS sein als alle anderen
  // - Verwende verschiedene Konzepte, Zahlen, Beispiele und Ansätze
  // - Die Frage darf maximal 120 Zeichen lang sein
  // - Die Antwortoptionen müssen klar und eindeutig sein. Weniger als 50 Zeichen pro Option
  
  // Du musst GENAU in diesem JSON-Array-Format antworten:
  // [
  // {
  // "question": {
  // "de": "Spezifische Frage über ${topic} auf Deutsch",
  // "en": "Specific question about ${topic} in English"
  // },
  // "optionA": {
  // "isCorrect": true,
  // "de": "Korrekte Antwort auf Deutsch",
  // "en": "Correct answer in English"
  // },
  // "optionB": {
  // "isCorrect": false,
  // "de": "Falsche Antwort auf Deutsch", 
  // "en": "Wrong answer in English"
  // },
  // "optionC": {
  // "isCorrect": false,
  // "de": "Falsche Antwort auf Deutsch",
  // "en": "Wrong answer in English"
  // },
  // "optionD": {
  // "isCorrect": false,
  // "de": "Falsche Antwort auf Deutsch",
  // "en": "Wrong answer in English"
  // }
  // }
  // ]
  
  // REGELN:
  // - Generiere GENAU ${questionCount} Fragen im Array
  // - Nur eine Option pro Frage darf "isCorrect: true" sein
  // - Alle Optionen müssen unterschiedlich und plausibel sein
  // - Konzentriere dich ausschließlich auf "${topic}"
  // - Antworte NUR mit dem JSON-Array, ohne zusätzlichen Text`;
  
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
  max_tokens: 3000, 
  top_p: 0.9,
  frequency_penalty: 0.8, 
  presence_penalty: 0.6, 
  },
  {
  headers: {
  Authorization: `Bearer ${GROQ_API_KEY?.trim() || ""}`,
  "Content-Type": "application/json",
  },
  }
  );
  
  let responseContent = response.data.choices[0].message.content;
  //wir suchen nach den ersten Satz, den die KI generiert hat
  const jsonStartIndex = responseContent.indexOf("[");

  responseContent = responseContent.replace(/```json\n?/g, "");
  responseContent = responseContent.replace(/```\n?/g, "");
  responseContent = responseContent.substring(jsonStartIndex).trim(); // Entferne alles vor dem JSON-Array
  console.log("API Response for Multiple Questions:", response.data);
  
  const questionsData = JSON.parse(responseContent);
  console.log("Parsed Questions Data:", questionsData);
  
  // Array validieren
  if (!Array.isArray(questionsData)) {
  throw new Error("Response ist kein Array");
  }
  
  // Validierung jeder Frage
  const validatedQuestions: QuestionStructure[] = [];
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
  
  validatedQuestions.push({
  question: questionData.question,
  optionA: questionData.optionA,
  optionB: questionData.optionB,
  optionC: questionData.optionC,
  optionD: questionData.optionD,
  });
  }
  
  if (validatedQuestions.length === 0) {
  throw new Error("Keine gültigen Fragen generiert");
  }
  
  console.log(`${validatedQuestions.length} valide Fragen generiert für Thema: ${topic}`);
  return {
  category: topic, // NEUIGKEIT: Kategorie ist jetzt das Thema
  questionArray: validatedQuestions,
  };
  
  } catch (error) {
  console.error("Fehler beim Generieren mehrerer Fragen:", error);
  throw new Error(
  "Mehrere Fragen konnten nicht generiert werden. Versuche es erneut."
  );
  }
  };

// Kategorien für die Kategorisierung
const PREDEFINED_CATEGORIES: Category[] = [
  "Science",
  "History",
  "Geography",
  "Sports",
  "Media",
  "Culture",
  "Daily Life",
];

//======================= Funktion zum Kategorisieren eines Themas =================================
export const categorizeTopic = async (userInput: string): Promise<string> => {
  try {
    const prompt = `Du bist ein Experte für die Kategorisierung von Themen. 

Deine Aufgabe ist es, das gegebene Thema GENAU EINER der folgenden Kategorien zuzuordnen:

VERFÜGBARE KATEGORIEN:
- History (Geschichte, historische Ereignisse, Persönlichkeiten, Epochen)
- Science (Wissenschaft, Physik, Chemie, Biologie, Mathematik, Technologie)
- Sports (Sport, Athleten, Wettkämpfe, Spiele, körperliche Aktivitäten)
- Geography (Geographie, Länder, Städte, Kontinente, Naturphänomene, Orte)
- Media (Medien, Filme, Bücher, Musik, TV-Shows, Prominente, Unterhaltung)
- Culture (Kultur, Traditionen, Kunst, Religion, Sprachen, Gesellschaft)
- Daily life (Alltag, tägliche Aktivitäten, Haushalt, Essen, Arbeit, Familie)

WICHTIGE REGELN:
1. Antworte NUR mit dem exakten Kategorienamen (z.B. "History" oder "Science")
2. Keine zusätzlichen Erklärungen oder Texte
3. Wähle immer die BESTE passende Kategorie
4. Wenn mehrere Kategorien möglich sind, wähle die SPEZIFISCHSTE

BEISPIELE:
- "Dinosaurier" → "Science"
- "Fußball" → "Sports"
- "Rom" → "History"
- "Kochen" → "Daily life"
- "Harry Potter" → "Media"
- "Weihnachten" → "Culture"
- "Frankreich" → "Geography"

Thema zum Kategorisieren: "${userInput}"

Antwort:`;

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
        temperature: 0.1, // Niedrige Temperature für konsistente Ergebnisse
        max_tokens: 50,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY?.trim() || ""}`,
          "Content-Type": "application/json",
        },
      }
    );

    let categorizedResult = response.data.choices[0].message.content.trim();
    
    // Sicherstellen, dass die Antwort eine gültige Kategorie ist
    const foundCategory = PREDEFINED_CATEGORIES.find(
      category => category.toLowerCase() === categorizedResult.toLowerCase()
    );

    if (foundCategory) {
      return foundCategory;
    } else {
      // Fallback: Versuche eine Ähnlichkeitssuche
      const similarCategory = PREDEFINED_CATEGORIES.find(
        category => categorizedResult.toLowerCase().includes(category.toLowerCase()) ||
                   category.toLowerCase().includes(categorizedResult.toLowerCase())
      );
      
      return similarCategory || "Culture"; // Default fallback
    }

  } catch (error) {
    console.error("Error categorizing topic:", error);
    // Fallback zu einer Standard-Kategorie
    return "Culture";
  }
};

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
