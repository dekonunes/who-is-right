/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Load environment variables from .env file (for local development)
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Try to load .env from functions directory (when running from project root)
// or from current directory (when running from functions directory)
const functionsEnvPath = path.resolve(process.cwd(), "functions", ".env");
const currentEnvPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(functionsEnvPath)) {
  dotenv.config({ path: functionsEnvPath });
} else if (fs.existsSync(currentEnvPath)) {
  dotenv.config({ path: currentEnvPath });
} else {
  // Fallback: try default location (current directory)
  dotenv.config();
}

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  tone?: "funny" | "serious";
};

// Initialize Gemini with your API key (store securely, e.g., in environment config)
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  tr: {
    Woman: "Kadın",
    Man: "Erkek",
    Mon: "Anne",
    Child: "Çocuk",
    Sibling1: "Kardeş 1",
    Sibling2: "Kardeş 2",
    "Friend 1": "Arkadaş 1",
    "Friend 2": "Arkadaş 2",
    "Co-worker 1": "İş arkadaşı 1",
    "Co-worker 2": "İş arkadaşı 2",
    Boss: "Patron",
    Employee: "Çalışan",
  },
  de: {
    Woman: "Frau",
    Man: "Mann",
    Mon: "Mama",
    Child: "Kind",
    Sibling1: "Geschwister 1",
    Sibling2: "Geschwister 2",
    "Friend 1": "Freund 1",
    "Friend 2": "Freund 2",
    "Co-worker 1": "Kollege 1",
    "Co-worker 2": "Kollege 2",
    Boss: "Chef",
    Employee: "Mitarbeiter",
  },
};

/**
 * Translates speaker names based on the specified language
 * @param speaker - The speaker name to translate
 * @param language - The target language code (en, pt, es, tr, de)
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
  tone = "serious",
}: {
  question: string;
  answerA: string;
  answerB: string;
  type: string;
  language: string;
  tone?: "funny" | "serious";
}) => {
  const tonePreference = tone === "serious" ? "serious" : "funny";
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const promptPart1 = `You are an impartial AI judge created for a web app called 'Who is Right?'. Your purpose is to settle playful debates between two people, usually a`;
  const toneInstruction =
    tonePreference === "serious"
      ? "- Your response should be concise, balanced, and respectful.\n- Light humor is optional; avoid sarcasm or over-the-top jokes.\n"
      : "- Your response should be funny, playful, and impartial.\n- Use cheeky language and humorous logic.\n";
  const promptPart2 = `The user will provide a situation, and each person's side of the story. Your job is to generate a short decision about who is 'right'. Very Important Rules:\n- You must always reply in the **same language used in the inputs** (detect the language automatically, e.g., English, Portuguese and Spanish).\n- You must NEVER answer anything unrelated to this judging task.\n- You must NEVER give legal, relationship, or personal advice.\n- You must NEVER comment on confidential or sensitive content.\n- If the input is not in the correct structure, reply with: "I'm here only to judge playful debates. Please follow the format and keep it fun!"\n\nOutput Style:\n${toneInstruction}\n`;
  const verdictDescriptor =
    tonePreference === "serious"
      ? "clear, fair reasoning"
      : "humorous reasoning";
  const promptPart3 = `**CRITICAL: You MUST format your response using the following structure with **bold** section headers:**\n\n**Situation:** [Brief description of the argument/debate context]\n\n**[Person 1 Name]:** [First person's perspective and reasoning]\n\n**[Person 2 Name]:** [Second person's perspective and reasoning]\n\n**The Verdict:** [Your analysis and conclusion on who is right, with ${verdictDescriptor}]`;
  // const promptPart3 = `CRITICAL OPERATIONAL RULES:
  // - LANGUAGE: You must ALWAYS detect and respond in the exact same language used in the user inputs (English, Portuguese, Spanish, etc.)
  // - ROLE BOUNDARIES: You are ONLY a debate judge. Never give legal, medical, financial, or relationship advice
  // - SAFETY: Never comment on confidential information, personal details, or sensitive topics
  // - IMPARTIALITY: Always remain neutral and fair, even if one person's argument seems stronger
  // - NO TIES: You must NEVER declare a tie or say both people are equally right. Always pick a winner, even if it's by a small margin
  // - HUMOR: Use witty, playful language while maintaining respect for both parties
  // - STRUCTURE: Follow the exact output format specified below
  // - LENGTH: Keep responses concise but thorough (1-2 paragraphs maximum)

  // OUTPUT FORMAT REQUIREMENTS:
  // You MUST structure your response exactly like this:

  // **Situation:** [Brief, neutral description of the debate context]

  // **[Person 1 Name]:** [Fair summary of their perspective, highlighting key points]

  // **[Person 2 Name]:** [Fair summary of their perspective, highlighting key points]

  // **The Verdict:** [Your analysis and conclusion with humorous reasoning]`;
  const endPart = `\n\nThis tool is for entertainment only. Keep it light, safe, and always in good fun.`;
  const buildEndingNote = (funnyExamples: string) =>
    tonePreference === "serious"
      ? "- Finish with a concise, constructive takeaway without jokes.\n"
      : `- End with a humorous touch like: ${funnyExamples}\n`;
  const prompts = {
    couple: `${promptPart1} couple. ${promptPart2}${promptPart3}\n- You can say the ${translateSpeaker(
      "Woman",
      language
    )} is right, the ${translateSpeaker(
      "Man",
      language
    )} is right, or neither is right — but NEVER declare a tie. Always pick a winner.\n${buildEndingNote(
      '"Good luck with dinner.", "May the best debater win the remote control tonight!", "Here\'s hoping your next argument is about something less important!", or "Remember: love means never having to say you\'re sorry... for being right!"'
    )}\nExpected Input Structure:\n- situation: string (the argument or question)\n- woman: string (her version)\n- man: string (his version)${endPart}
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
    )} is right, or neither is right — but NEVER declare a tie. Always pick a winner.\n${buildEndingNote(
      '"Good luck with your next argument.", "May your friendship survive this debate!", "Here\'s to many more arguments ahead!", or "Remember: friends don\'t let friends win arguments!"'
    )}\nExpected Input Structure:\n- situation: string (the argument or question)\n- Friend 1: string (version)\n- Friend 2: string (version)${endPart}
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
    )} is right, or neither is right — but NEVER declare a tie. Always pick a winner.\n${buildEndingNote(
      '"Good luck with the next allowance.", "May the best negotiator win the bedtime battle!", "Here\'s to peaceful family dinners ahead!", or "Remember: moms have years of experience in being right!"'
    )}\nExpected Input Structure:\n- situation: string (the argument or question)\n- Mon: string (her version)\n- Child: string (his version)${endPart}
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
    )} is right, or neither is right — but NEVER declare a tie. Always pick a winner.\n${buildEndingNote(
      '"Good luck with the next allowance.", "May the best sibling win the room sharing battle!", "Here\'s to peaceful family car rides ahead!", or "Remember: siblings are forever, but being right is temporary!"'
    )}\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Simbling 1: string (her version)\n- Simbling 2: string (his version)${endPart}
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
    )} is right, or neither is right — but NEVER declare a tie. Always pick a winner.\n${buildEndingNote(
      '"Good luck with your salary raises.", "May the best debater win the promotion!", "Here\'s to productive team meetings ahead!", or "Remember: the boss is always right... until they\'re not!"'
    )}\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- Boss: string (her version)\n- Employee: string (his version)${endPart}
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
      tone = "serious",
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
    const normalizedTone = tone === "serious" ? "serious" : "funny";
    try {
      // Get the Gemini verdict
      const verdict = await getGeminiVerdict({
        question,
        answerA,
        answerB,
        type,
        language,
        tone: normalizedTone,
      });
      // Save the debate with the verdict
      const docRef = await db.collection("debates").add({
        question,
        answerA,
        answerB,
        type,
        tone: normalizedTone,
        verdict,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Debate saved with ID:", docRef.id);
      res.status(200).send({ id: docRef.id, verdict });
    } catch (error: any) {
      console.error("Error saving debate", error);

      // Save error audit log to Firestore
      try {
        await db.collection("debate_errors").add({
          input: {
            question,
            answerA,
            answerB,
            type,
            language,
            tone: normalizedTone,
          },
          error: {
            message: error?.message || "Unknown error",
            status: error?.status || error?.httpStatusCode || null,
            code: error?.code || null,
            stack: error?.stack || null,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (auditError) {
        console.error("Failed to save error audit log", auditError);
      }

      res.status(500).send({ error: "Error saving debate" });
    }
  }
);
