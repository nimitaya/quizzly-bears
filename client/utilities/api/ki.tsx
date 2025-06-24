import axios from "axios";
import Config from 'react-native-config';

// Configuración de Groq

const GROQ_API_URL = Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = Config.GROQ_API_KEY || "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";

/**
 * Genera una pregunta usando Groq API
 * @param difficulty - Nivel de dificultad (fácil, medio, difícil)
 * @param category - Categoría del quiz
 * @returns La pregunta generada
 */
export const generateQuestion = async (
  difficulty: string,
  category: string
): Promise<string> => {
  try {
console.log(GROQ_API_KEY, GROQ_API_URL);

    const prompt = `Eres un generador de preguntas para quizzes. 
Crea UNA sola pregunta sobre ${category} con dificultad ${difficulty}.
La pregunta debe ser clara y concisa.
Devuelve SOLO la pregunta, sin explicaciones, números o formato adicional.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-8b-8192", // Modelo rápido y eficiente de Groq
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7, // Controla la creatividad (0-1)
        max_tokens: 100 // Límite de longitud de respuesta
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Limpieza de la respuesta para asegurar formato consistente
    let question = response.data.choices[0].message.content;
    question = question.replace(/^\d+\.\s*/, ''); // Elimina numeración si existe
    question = question.replace(/"/g, ''); // Elimina comillas
    question = question.trim();

    return question;
  } catch (error) {
    console.error("Error al generar pregunta con Groq:", error);
    throw new Error("No se pudo generar la pregunta. Intenta nuevamente.");
  }
};