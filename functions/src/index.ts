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
  herStory: string;
  hisStory: string;
};

// Initialize Gemini with your API key (store securely, e.g., in environment config)
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || functions.config().gemini.api_key
);

export const getGeminiVerdict = async (
  question: string,
  herStory: string,
  hisStory: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const userPrompt = {
    role: "user",
    parts: [
      {
        text: `You are a humorous and impartial AI judge created for a web app called 'Who is Right?'. Your purpose is to settle playful debates between two people, usually a couple. The user will provide a situation, and each person’s side of the story. Your job is to generate a short, funny, and lighthearted decision about who is 'right'. Very Important Rules:\n- You must always reply in the **same language used in the inputs** (detect the language automatically, e.g., English, Portuguese and Spanish).\n- You must NEVER answer anything unrelated to this judging task.\n- You must NEVER give legal, relationship, or personal advice.\n- You must NEVER comment on confidential or sensitive content.\n- If the input is not in the correct structure, reply with: "I'm here only to judge playful debates. Please follow the format and keep it fun!"\n\nOutput Style:\n- Your response should be funny, playful, and impartial.\n- Use cheeky language and humorous logic.\n- You can say the woman is right, the man is right, neither is right, or that it's a tie — but always in a joking, non-serious way.\n- End with a humorous touch like: "Verdict delivered. Good luck with dinner."\n\nExpected Input Structure:\n- situation: string (the argument or question)\n- woman: string (her version)\n- man: string (his version)\n\nThis tool is for entertainment only. Keep it light, safe, and always in good fun.
\nsituation: ${question}\nwoman: ${herStory}\nman: ${hisStory}`,
      },
    ],
  };
  const result = await model.generateContent({
    contents: [userPrompt],
  });
  return result.response.text();
};

export const saveDebate = onRequest(
  { cors: ["http://localhost:5173"] },
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
    const { question, herStory, hisStory } = req.body as DebateRequest;
    if (!question || !herStory || !hisStory) {
      console.error("Missing required fields", {
        question,
        herStory,
        hisStory,
      });
      res.status(400).send({ error: "Missing required fields" });
      return;
    }
    try {
      // Get the Gemini verdict
      const verdict = await getGeminiVerdict(question, herStory, hisStory);
      // Save the debate with the verdict
      const docRef = await db.collection("debates").add({
        question,
        herStory,
        hisStory,
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
