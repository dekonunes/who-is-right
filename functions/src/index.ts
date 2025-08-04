/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as functions from "firebase-functions";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

type DebateRequest = {
  question: string;
  answerA: string;
  answerB: string;
  type: string;
  language: string;
};

// Initialize Gemini with your API key (store securely, e.g., in environment config)
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || functions.config().gemini.api_key
);

// Translation mappings for different speakers and languages
const SPEAKER_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    Woman: "Woman",
    Man: "Man",
    Mon: "Mom",
    Child: "Child",
    Sibling1: "Sibling 1",
    Sibling2: "Sibling 2",
    "Friend 1": "Friend 1",
    "Friend 2": "Friend 2",
    "Co-worker 1": "Co-worker 1",
    "Co-worker 2": "Co-worker 2",
    Boss: "Boss",
    Employee: "Employee",
  },
  pt: {
    Woman: "Mulher",
    Man: "Homem",
    Mon: "Mãe",
    Child: "Filho",
    Sibling1: "Irmão 1",
    Sibling2: "Irmão 2",
    "Friend 1": "Amigo 1",
    "Friend 2": "Amigo 2",
    "Co-worker 1": "Colega 1",
    "Co-worker 2": "Colega 2",
    Boss: "Chefe",
    Employee: "Funcionário",
  },
  es: {
    Woman: "Mujer",
    Man: "Hombre",
    Mon: "Madre",
    Child: "Hijo",
    Sibling1: "Hermano 1",
    Sibling2: "Hermano 2",
    "Friend 1": "Amigo 1",
    "Friend 2": "Amigo 2",
    "Co-worker 1": "Compañero 1",
    "Co-worker 2": "Compañero 2",
    Boss: "Jefe",
    Employee: "Empleado",
  },
};

/**
 * Translates speaker names based on the specified language
 * @param speaker - The speaker name to translate
 * @param language - The target language code (en, pt, es)
 * @returns The translated speaker name or the original if not found
 */
const translateSpeaker = (speaker: string, language: string): string => {
  // Return original if language is English or invalid
  if (language === "en" || !SPEAKER_TRANSLATIONS[language]) {
    return speaker;
  }

  // Return translated version or original if not found
  return SPEAKER_TRANSLATIONS[language][speaker] || speaker;
};

export const getGeminiVerdict = async ({
  question,
  answerA,
  answerB,
  type,
  language,
}: {
  question: string;
  answerA: string;
  answerB: string;
  type: string;
  language: string;
}) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const promptPart1 = `You are a humorous and impartial AI judge created for a web app called 'Who is Right?'. Your purpose is to settle playful debates between two people, usually a`;
  const promptPart2 = `The user will provide a situation, and each person's side of the story. Your job is to generate a short, funny, and lighthearted decision about who is 'right'. Very Important Rules:\n- You must always reply in the **same language used in the inputs** (detect the language automatically, e.g., English, Portuguese and Spanish).\n- You must NEVER answer anything unrelated to this judging task.\n- You must NEVER give legal, relationship, or personal advice.\n- You must NEVER comment on confidential or sensitive content.\n- If the input is not in the correct structure, reply with: "I'm here only to judge playful debates. Please follow the format and keep it fun!"\n\nOutput Style:\n- Your response should be funny, playful, and impartial.\n- Use cheeky language and humorous logic.\n\n`;
  const promptPart3 = `**CRITICAL: You MUST format your response using the following structure with **bold** section headers:**\n\n**Situation:** [Brief description of the argument/debate context]\n\n**[Person 1 Name]:** [First person's perspective and reasoning]\n\n**[Person 2 Name]:** [Second person's perspective and reasoning]\n\n**The Verdict:** [Your analysis and conclusion on who is right, with humorous reasoning]`;
  const endPart = `\n\nThis tool is for entertainment only. Keep it light, safe, and always in good fun.`;
  const prompts = {
    couple: `${promptPart1} couple. ${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Woman",
      language
    )} is right, the ${translateSpeaker(
      "Man",
      language
    )} is right, neither is right, or that it's tie — but always in a joking, non-serious way.\n- End with a humorous touch like: "Good luck with dinner."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- woman: string (her version)\n- man: string (his version)${endPart}
\nsituation: ${question}\n${translateSpeaker(
      "Woman",
      language
    )}: ${answerA}\n${translateSpeaker("Man", language)}: ${answerB}`,

    friends: `${promptPart1} friends. ${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Friend 1",
      language
    )} is right, the ${translateSpeaker(
      "Friend 2",
      language
    )} is right, neither is right, or that it's tie — but always in a joking, non-serious way.\n- End with a humorous touch like: "Good luck with your next argument."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Friend 1: string (version)\n- Friend 2: string (version)${endPart}
\nsituation: ${question}\n${translateSpeaker(
      "Friend 1",
      language
    )}: ${answerA}\n${translateSpeaker("Friend 2", language)}: ${answerB}`,

    mom_and_child: `${promptPart1} mom and child. ${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Mon",
      language
    )} is right, the ${translateSpeaker(
      "Child",
      language
    )} is right, neither is right, or that it's tie — but always in a joking, non-serious way.\n- End with a humorous touch like: "Good luck with the next allowance."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Mon: string (her version)\n- Child: string (his version)${endPart}
\nsituation: ${question}\n${translateSpeaker(
      "Mon",
      language
    )}: ${answerA}\n${translateSpeaker("Child", language)}: ${answerB}`,

    siblings: `${promptPart1} siblings. ${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Sibling 1",
      language
    )} is right, the ${translateSpeaker(
      "Sibling 2",
      language
    )} is right, neither is right, or that it's tie — but always in a joking, non-serious way.\n- End with a humorous touch like: "Good luck with the next allowance."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Simbling 1: string (her version)\n- Simbling 2: string (his version)${endPart}
\nsituation: ${question}\n${translateSpeaker(
      "Sibling 1",
      language
    )}: ${answerA}\n${translateSpeaker("Sibling 2", language)}: ${answerB}`,

    boss_and_employee: `${promptPart1} boss and employee.${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Boss",
      language
    )} is right, the ${translateSpeaker(
      "Employee",
      language
    )} is right, neither is right — but always in a joking, non-serious way.\n- End with a humorous touch like: "Good luck with your salary raises."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Boss: string (her version)\n- Employee: string (his version)${endPart}
\nsituation: ${question}\n${translateSpeaker(
      "Boss",
      language
    )}: ${answerA}\n${translateSpeaker("Employee", language)}: ${answerB}`,
  };
  const userPrompt = {
    role: "user",
    parts: [
      {
        text: prompts[type as keyof typeof prompts],
      },
    ],
  };
  const result = await model.generateContent({
    contents: [userPrompt],
  });
  return result.response.text();
};

export const saveDebate = onRequest(
  {
    cors: [
      "http://localhost:5173",
      "https://who-is-right-f795b.web.app",
      "https://who-is-right-f795b.firebaseapp.com",
      "https://whoisright.app",
      "https://www.whoisright.app",
    ],
  },
  async (req: any, res: any) => {
    try {
      if (!admin.apps.length) {
        admin.initializeApp();
        console.log("Firebase Admin initialized");
      } else {
        console.log("Firebase Admin already initialized");
      }
    } catch (initError) {
      console.error("Error initializing Firebase Admin:", initError);
    }
    if (req.method !== "POST") {
      res.status(405).send({ error: "Method not allowed" });
      return;
    }
    console.log("Request body:", req.body);
    const {
      question,
      answerA,
      answerB,
      type,
      language = "en",
    } = req.body as DebateRequest;
    if (!question || !answerA || !answerB) {
      console.error("Missing required fields", {
        question,
        answerA,
        answerB,
        type,
        language,
      });
      res.status(400).send({ error: "Missing required fields" });
      return;
    }
    try {
      // Get the Gemini verdict
      const verdict = await getGeminiVerdict({
        question,
        answerA,
        answerB,
        type,
        language,
      });
      // Save the debate with the verdict
      const docRef = await db.collection("debates").add({
        question,
        answerA,
        answerB,
        type,
        verdict,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Debate saved with ID:", docRef.id);
      res.status(200).send({ id: docRef.id, verdict });
    } catch (error) {
      console.error("Error saving debate", error);
      res.status(500).send({ error: "Error saving debate" });
    }
  }
);
