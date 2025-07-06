import axios from "axios";
import Config from "react-native-config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, Difficulty } from "../types";
import { QuestionStructure, AiQuestions } from "@/utilities/quiz-logic/data";
import { LANGUAGES } from "../languages";

const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "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";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/*const optionKeys = ["optionA", "optionB", "optionC", "optionD"];
let lastCorrectIndex = -1;
let repeatCount = 0;*/

/*function getNextCorrectOption(): string {
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
}*/

// Funktion zum Abrufen der aktuellen Sprache
const getCurrentLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem("selected_language");
    return savedLanguage || "en"; // Standard: Englisch
  } catch (error) {
    console.error("Fehler beim Abrufen der aktuellen Sprache:", error);
    return "en";
  }
};

const getLanguageName = (code: string): string => {
  console.log(" DEBUG - Getting language name for code:", code);
  
  // Wir suchen die Sprache anhand des Codes in der Liste der unterstützten Sprachen
  const language = LANGUAGES.find(lang => lang.code === code);
  
  // Return the name of the language or a default value
  return language?.name || "English";
}

//========================Hauptfunktion für die Generierung mehrerer Quiz-Fragen==================
export const generateMultipleQuizQuestions = async (
  topic: string,
  difficulty: Difficulty,
  questionCount: number = 10
): Promise<AiQuestions> => {
  await delay(5000);
  try {
    const currentLanguageCode = await getCurrentLanguage();
    const currentLanguageName = getLanguageName(currentLanguageCode);

    console.log(`Generiere Fragen auf: ${currentLanguageName} (${currentLanguageCode})`);

    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();

    
    const prompt = `Du bist ein hochentwickelter Generator für mehrsprachige Bildungsquiz-Fragen.

    SPRACH-UNTERSTÜTZUNG:
    - UNTERSTÜTZTE SPRACHEN: Alle 319+ Sprachen (Afar, Abkhazian, Arabic, Bengali, Chinese, English, French, German, Hindi, Japanese, Korean, Russian, Spanish, Tamil, Thai, und viele mehr)
    - ZIELSPRACHE: ${currentLanguageName} (${currentLanguageCode})
    - NATIVE BEZEICHNUNG: ${currentLanguageName}
    - Generiere Fragen und Antworten in BEIDEN Sprachen: Deutsch UND ${currentLanguageName}
    
    CHARAKTER-UNTERSTÜTZUNG:
    - VOLLSTÄNDIGE UTF-8 UNTERSTÜTZUNG für alle Schriftsysteme
    - RTL-SPRACHEN (Arabic العربية, Hebrew עברית, Persian فارسی, Urdu اردو): Korrekte Rechts-nach-Links Schrift
    - KYRILLISCHE SCHRIFT (Russian Русский, Bulgarian Български, Serbian Српски): Vollständige Cyrillic-Zeichen
    - CJK-SPRACHEN (Chinese 中文, Japanese 日本語, Korean 한국어): Komplette Zeichen-Sets
    - INDISCHE SCHRIFTEN (Hindi हिन्दी, Bengali বাংলা, Tamil தமிழ், Telugu తెలుగు): Devanagari und regionale Schriften
    - SÜDOSTASIATISCHE SPRACHEN (Thai ไทย, Khmer ភាសាខ្មែរ, Myanmar ဗမာစာ): Spezielle Zeichen-Sets
    - AFRIKANISCHE SPRACHEN (Amharic አማርኛ, Swahili Kiswahili): Äthiopische und andere Schriften
    
    SPEZIFISCHE ANWEISUNGEN:
    - Erstelle GENAU ${questionCount} völlig NEUE UND EINZIGARTIGE Fragen über das spezifische Thema: "${topic}"
    - Schwierigkeitsgrad: ${difficulty}
    - HAUPTSPRACHE: ${currentLanguageName} (${currentLanguageCode})
    - Verwende AUTHENTISCHE ${currentLanguageName} Terminologie und Zeichen
    - Alle Texte in "${currentLanguageCode}" müssen NATIV und KORREKT sein
    
    WICHTIGE FOKUSSIERUNG:
    - ALLE Fragen müssen DIREKT mit "${topic}" zu tun haben
    - Verwende spezifische Details, Charaktere, Ereignisse oder Aspekte von "${topic}"
    - Die Fragen sollen das Wissen über "${topic}" testen
    - Korrekte Option muss immer in einer anderen Position sein
    
    QUALITÄTS-REGELN:
    - Jede Frage muss VÖLLIG ANDERS sein als alle anderen
    - Die Frage darf maximal 120 Zeichen lang sein
    - Die Antwortoptionen müssen klar und eindeutig sein
    - Alle falschen Antworten müssen plausibel aber eindeutig falsch sein
    - Json Datei darf KEINE zusätzlichen Texte oder Erklärungen enthalten
    
    TECHNISCHE ANFORDERUNGEN:
    - Verwende EXAKT den Sprachcode "${currentLanguageCode}" im JSON
    - Alle Zeichen müssen UTF-8 kompatibel sein
    - Escape JSON-kritische Zeichen (", \\, /, \b, \f, \n, \r, \t)
    - Verwende KEINE problematischen Zeichen wie: ", ", ', ', …, –, —
    - Stelle sicher, dass RTL-Sprachen korrekt kodiert sind
    - Teste JSON-Validität vor der Antwort
    
    FORMAT - Antworte NUR mit einem JSON-Objekt im folgenden Format:
    {
      "category": "${topic}",
      "questionArray": [
        {
          "question": {
            "de": "Frage auf Deutsch",
            "${currentLanguageCode}": "Authentische Frage in ${currentLanguageName} mit korrekten Zeichen"
          },
          "optionA": {
            "isCorrect": true/false,
            "de": "Antwort auf Deutsch",
            "${currentLanguageCode}": "Authentische Antwort in ${currentLanguageName}"
          },
          "optionB": {
            "isCorrect": true/false,
            "de": "Antwort auf Deutsch",
            "${currentLanguageCode}": "Authentische Antwort in ${currentLanguageName}"
          },
          "optionC": {
            "isCorrect": true/false,
            "de": "Antwort auf Deutsch",
            "${currentLanguageCode}": "Authentische Antwort in ${currentLanguageName}"
          },
          "optionD": {
            "isCorrect": true/false,
            "de": "Antwort auf Deutsch",
            "${currentLanguageCode}": "Authentische Antwort in ${currentLanguageName}"
          }
        }
      ]
    }
    
    KRITISCHE VALIDIERUNG:
    - Alle Texte in "${currentLanguageCode}" müssen in der KORREKTEN SPRACHE sein
    - KEINE englischen Texte in Nicht-Englisch-Feldern
    - Verwende NATIVE Wörter und Ausdrücke für ${currentLanguageName}
    - Berücksichtige kulturelle Nuancen der Zielsprache
    - JSON muss parsebare UTF-8 Struktur haben
    
    WICHTIGE REGELN:
    - Generiere GENAU ${questionCount} Fragen
    - RANDOMISIERE die Position der korrekten Antwort
    - Verteile die korrekten Antworten auf optionA, optionB, optionC, optionD
    - Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text
    - Keine Markdown-Formatierung
    - Verwende korrekte Zeichenkodierung für ${currentLanguageName}
    - Referenz: ${randomSeed}-${timestamp}
    
    SPRACH-QUALITÄT:
    - Für ${currentLanguageName}: Verwende authentische, native Terminologie
    - Berücksichtige sprachspezifische Grammatik und Syntax
    - Stelle sicher, dass alle Zeichen korrekt dargestellt werden
    - Teste die Lesbarkeit in der Zielsprache`;

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
    console.log("🔍 Current Language Code:", currentLanguageCode);
    console.log("🔍 Current Language Name:", currentLanguageName);

    // Json wird sauber
    responseContent = responseContent.replace(/```json\n?/g, "");
    responseContent = responseContent.replace(/```\n?/g, "");
    responseContent = responseContent.trim();

    // Json support 
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error(" Kein gültiges JSON gefunden:", responseContent);
      throw new Error(`Ungültige Antwort vom Modell: ${responseContent}`);
    }

    const cleanJson = jsonMatch[0].trim();
    console.log(" Sauberes JSON:", cleanJson);

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error(" JSON Parse Error:", parseError);
      console.error(" Problematic JSON:", cleanJson);
      throw new Error("Failed to parse JSON response from AI");
    }

    console.log(" Geparste Daten:", parsedData);

    const questionsData = parsedData.questionArray;

    if (!Array.isArray(questionsData)) {
      console.error(" questionArray ist kein Array:", questionsData);
      throw new Error("questionArray ist kein gültiges Array");
    }

    // Validierung der Fragenstruktur
    const validatedQuestions: QuestionStructure[] = [];
    for (let i = 0; i < questionsData.length; i++) {
      const questionData = questionsData[i];
      
      // Check if required structure exists
      if (!questionData.question || !questionData.optionA || !questionData.optionB || 
          !questionData.optionC || !questionData.optionD) {
        console.warn(` Frage ${i + 1} fehlt grundlegende Struktur:`, questionData);
        continue;
      }

      // Check German text
      if (typeof questionData.question.de !== "string" ||
          typeof questionData.optionA.de !== "string" ||
          typeof questionData.optionB.de !== "string" ||
          typeof questionData.optionC.de !== "string" ||
          typeof questionData.optionD.de !== "string") {
        console.warn(` Frage ${i + 1} fehlt deutsche Texte:`, questionData);
        continue;
      }

      // Check target language text
      if (typeof questionData.question[currentLanguageCode] !== "string" ||
          typeof questionData.optionA[currentLanguageCode] !== "string" ||
          typeof questionData.optionB[currentLanguageCode] !== "string" ||
          typeof questionData.optionC[currentLanguageCode] !== "string" ||
          typeof questionData.optionD[currentLanguageCode] !== "string") {
        console.warn(` Frage ${i + 1} fehlt ${currentLanguageName} Texte:`, questionData);
        continue;
      }

      // Create validated question object
      const question = {
        question: questionData.question,
        optionA: questionData.optionA,
        optionB: questionData.optionB,
        optionC: questionData.optionC,
        optionD: questionData.optionD,
      };

      validatedQuestions.push(question);
    }

    if (validatedQuestions.length === 0) {
      throw new Error("Keine gültigen Fragen konnten generiert werden");
    }

    const finalQuestions = validatedQuestions.slice(0, questionCount);
    console.log(` ${finalQuestions.length} gültige Fragen generiert für: ${topic} auf ${currentLanguageName}`);
    
    return {
      category: topic,
      questionArray: finalQuestions,
    };
  } catch (error) {
    console.error(" Fehler beim Generieren der Fragen:", error);
    throw new Error("Fragen konnten nicht generiert werden. Versuche es erneut.");
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
