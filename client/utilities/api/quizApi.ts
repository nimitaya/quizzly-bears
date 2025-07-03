import axios from "axios";
import Config from "react-native-config";
import { Category, Difficulty } from "../types";
import { QuestionStructure, AiQuestions } from "@/utilities/quiz-logic/data";

const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const optionKeys = ["optionA", "optionB", "optionC", "optionD"];
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
  } while (repeatCount > 1); // Vermeide zu viele Wiederholungen

  lastCorrectIndex = nextIndex;
  return optionKeys[nextIndex];
}

//========================Funktion zum Generieren mehrerer Quizfragen==================
export const generateMultipleQuizQuestions = async (
  topic: string, // NEU: Thema anstelle von Kategorie
  difficulty: Difficulty,
  questionCount: number = 10 | 11
): Promise<AiQuestions> => {
  await delay(5000); // Warte 1 Sekunde vor der Anfrage
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
  - Erstelle GENAU ${questionCount} völlig NEUE UND EINZIGARTIGE Fragen über das spezifische Thema: "${topic}"
  - Schwierigkeitsgrad: ${difficulty}
  
  - SCHWIERIGKEITSGRADE (ERKLÄRUNG):
  
  - easy (einfach):
  • Zielgruppe: Anfänger:innen, Kinder, Laien
  • Fragen mit offensichtlicher Antwort oder Basiswissen
  • Antwort erkennbar ohne Fachwissen
  • Keine Fachbegriffe, keine Mehrdeutigkeit
  • Beispiele: „Wie viele Beine hat ein Hund?“ oder „Wer war der erste Mensch auf dem Mond?“
  
  - medium (mittel):
  • Zielgruppe: Fortgeschrittene, interessierte Laien
  • Allgemeinbildung, schulisches Wissen, kontextbezogen
  • Braucht etwas Nachdenken oder Kontextkenntnis
  • Beispiele: „Welche chemische Formel hat Wasser?“ oder „In welchem Jahr fiel die Berliner Mauer?“
  
  - hard (schwierig):
  • Zielgruppe: Expert:innen, Studierende, Fachleute
  • Komplexes Fachwissen, seltene Details, tiefes Verständnis
  • Erfordert Analyse, Vergleich oder konkretes Wissen über Teilaspekte
  • Beispiele: „Welche Rolle spielte das Phlogiston in der frühen Chemietheorie?“ oder „Was unterscheidet den Utilitarismus von der Deontologie?“
  - Verwende verschiedene Fragetypen: ${questionTypes.join(", ")}
  - Referenznummer: ${randomSeed}
  - Zeitstempel: ${timestamp}
  
  WICHTIGE FOKUSSIERUNG:
  - ALLE Fragen müssen DIREKT mit "${topic}" zu tun haben
  - Verwende spezifische Details, Charaktere, Ereignisse oder Aspekte von "${topic}"
  - Die Fragen sollen das Wissen über "${topic}" testen, nicht nur allgemeine Kenntnisse
  - Korrekte option muss immer in einer anderen Position sein
  
  VALIDIERUNGSCHECK:
  Bevor du antwortest, überprüfe:
  - Haben alle ${questionCount} Fragen nur EINE korrekte Antwort?
  - Sind die korrekten Antworten auf optionA, optionB, optionC, optionD verteilt?
  - Steht NICHT jede korrekte Antwort bei optionA?
  WEITERE REGELN:
  - Jede Frage muss VÖLLIG ANDERS sein als alle anderen
  - Die Frage darf maximal 120 Zeichen lang sein
  - Die Antwortoptionen müssen klar und eindeutig sein. Weniger als 50 Zeichen pro Option
  - Alle falschen Antworten müssen plausibel aber eindeutig falsch sein
  
  FORMAT:
  Antworte NUR mit einem JSON-Objekt im folgenden Format:
  {
  "category": "${topic}",
  "questionArray": [
  {
  "question": {
  "de": "Frage auf Deutsch",
  "en": "Question in English"
  },
  "optionA": { "isCorrect": true/false, "en": "Antwort in Englisch", "de": "Antwort auf Deutsch" },
  "optionB": { "isCorrect": true/false, "en": "Antwort in Englisch", "de": "Antwort auf Deutsch" },
  "optionC": { "isCorrect": true/false, "en": "Antwort in Englisch", "de": "Antwort auf Deutsch" },
  "optionD": { "isCorrect": true/false, "en": "Antwort in Englisch", "de": "Antwort auf Deutsch" }
  },
  ...
  ]
  }

  REGELN:
  - Generiere GENAU ${questionCount} Fragen im Array
  - RANDOMISIERE die Position der korrekten Antwort in jeder Frage
  - Verteile die korrekten Antworten ungefähr gleichmäßig auf optionA, optionB, optionC, optionD
  - Alle Optionen müssen unterschiedlich und plausibel sein
  - Jede Frage muss völlig originell und unterschiedlich sein
  - Konzentriere dich ausschließlich auf "${topic}"
  - Antworte NUR mit dem JSON-Array, ohne zusätzlichen Text am ende des Arrays
  - WICHTIG: Kopiere NICHT einfach die Struktur aus den Beispielen. Generiere jede Frage ORIGINAL, mit zufälliger aber kontrollierter Platzierung der richtigen Antwort gemäß der obigen Tabelle.
  - Keine zusätzlichen Erklärungen oder Kommentare`;

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

// Log the raw response content for debugging
console.log("Response Content:", responseContent);

// Zusätzliche Bereinigung des Outputs
responseContent = responseContent.replace(/```json\n?/g, "");
responseContent = responseContent.replace(/```\n?/g, "");

// JSON-Array extrahieren
const jsonMatch = responseContent.match(/\[\s*{[\s\S]*?}\s*\]/);

if (!jsonMatch) {
  console.error("Kein gültiges JSON-Array im Modell-Output gefunden:", responseContent);
  throw new Error(`Ungültige Antwort vom Modell: ${responseContent}`);
}

const cleanJson = jsonMatch[0].trim();
console.log("Sauberes JSON:", cleanJson);

const questionsData = JSON.parse(cleanJson);

// ist JSON ein Array?
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
      const correctKey = getNextCorrectOption();

      const question = {
        question: questionData.question,
        optionA: {
          ...questionData.optionA,
          isCorrect: correctKey === "optionA",
        },
        optionB: {
          ...questionData.optionB,
          isCorrect: correctKey === "optionB",
        },
        optionC: {
          ...questionData.optionC,
          isCorrect: correctKey === "optionC",
        },
        optionD: {
          ...questionData.optionD,
          isCorrect: correctKey === "optionD",
        },
      };

      validatedQuestions.push(question);
    }
//=================immer 10 Fragen und nicht 11
    const finalQuestions = validatedQuestions.slice(0, questionCount);
    console.log(
      `${finalQuestions.length} valide Fragen generiert für Thema: ${topic}`
    );
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
        max_tokens: 300,
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
      (category) => category.toLowerCase() === categorizedResult.toLowerCase()
    );

    if (foundCategory) {
      return foundCategory;
    } else {
      // Fallback: Versuche eine Ähnlichkeitssuche
      const similarCategory = PREDEFINED_CATEGORIES.find(
        (category) =>
          categorizedResult.toLowerCase().includes(category.toLowerCase()) ||
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
