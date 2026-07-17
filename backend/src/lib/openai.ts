import OpenAI from "openai";

import { env } from "./env.js";
import type { Language } from "./constants.js";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface PromptArticle {
  titleEn: string;
  titleRw: string;
  bodyEn: string;
  bodyRw: string;
}

export interface BuildSystemPromptOptions {
  responseStyleNote?: string;
  restrictToKnowledgeBase?: boolean;
}

export function buildSystemPrompt(
  retrievedArticles: PromptArticle[],
  language: Language,
  options: BuildSystemPromptOptions = {},
): string {
  const languageLabel = language === "RW" ? "Kinyarwanda" : "English";

  const referenceMaterial =
    retrievedArticles.length > 0
      ? retrievedArticles
          .map((article, index) => {
            const title = language === "RW" ? article.titleRw : article.titleEn;
            const body = language === "RW" ? article.bodyRw : article.bodyEn;
            return `[${index + 1}] ${title}\n${body}`;
          })
          .join("\n\n")
      : "(none available for this question)";

  // AppSettings.restrictToKnowledgeBase: when on and nothing was retrieved,
  // tell the model to say so explicitly rather than lean on rule 2's general
  // "answer briefly and cautiously" latitude.
  const restrictNote =
    options.restrictToKnowledgeBase && retrievedArticles.length === 0
      ? " Since no reference material is available for this question, explicitly say you don't have reviewed information on this yet rather than answering from general knowledge."
      : "";

  const styleNote = options.responseStyleNote ? ` ${options.responseStyleNote}` : "";

  return (
    "You are Inshuti, a warm and non-judgmental health assistant for young people in Rwanda. " +
    "You answer questions about sexual and reproductive health, relationships, and general wellbeing. " +
    "Rules: 1) Base your answer primarily on the reference material below, reviewed by health " +
    "professionals — do not contradict it. 2) If no reference material is given, answer briefly and " +
    "cautiously and suggest a follow-up question or speaking to a health worker — do not invent " +
    `clinical specifics.${restrictNote} 3) Keep answers to 3-5 sentences, 8th-grade reading ` +
    `level.${styleNote} 4) Never be judgmental or preachy. 5) Respond in ${languageLabel}. ` +
    "6) Never give instructions that could facilitate self-harm or harm to others. 7) This is " +
    "informational only, not a diagnosis — say so when relevant. " +
    `Reference material: ${referenceMaterial}`
  );
}

export async function getChatCompletion(params: {
  systemPrompt: string;
  userMessage: string;
  model: string;
}): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: params.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userMessage },
    ],
    temperature: 0.4,
    max_tokens: 400,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
