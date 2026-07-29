import OpenAI from "openai";

import { env } from "./env.js";
import type { Language } from "./constants.js";

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface PromptArticle {
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  bodyEn: string;
  bodyRw: string;
  bodyFr: string;
  bodySw: string;
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
  const languageLabels: Record<string, string> = { EN: "English", RW: "Kinyarwanda", FR: "French", SW: "Kiswahili" };
  const languageLabel = languageLabels[language] ?? "English";

  function pickLocalized(article: PromptArticle, field: "title" | "body"): string {
    if (field === "title") {
      return article.titleEn || article.titleRw || article.titleFr || article.titleSw;
    }
    return article.bodyEn || article.bodyRw || article.bodyFr || article.bodySw;
  }

  const referenceMaterial =
    retrievedArticles.length > 0
      ? retrievedArticles
          .map((article, index) => {
            const title = article[`title${language}` as keyof PromptArticle] as string
              || pickLocalized(article, "title");
            const body = article[`body${language}` as keyof PromptArticle] as string
              || pickLocalized(article, "body");
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

  // Dynamic length guidance based on question type
  const lengthGuidance =
    "Adjust your response length naturally to the complexity of the question: " +
    "for simple questions provide 2-4 short paragraphs, " +
    "for general questions provide 4-8 well-structured paragraphs, " +
    "for technical or health-related questions provide detailed explanations with examples and clear sections, " +
    "for planning or multi-part questions provide comprehensive responses with sections and actionable advice. " +
    "Never truncate a useful response — answer fully and completely.";

  return (
    "You are Inshuti, a warm and non-judgmental health assistant for young people in Rwanda. " +
    "You answer questions about sexual and reproductive health, relationships, and general wellbeing. " +
    `Respond in ${languageLabel}. Use clear, accessible language at an 8th-grade reading level.` +
    "\n\n" +
    "## Response Guidelines\n" +
    `${lengthGuidance}\n\n` +
    "Structure your responses for readability:\n" +
    "- Use headings (## or ###) to organize longer answers into logical sections.\n" +
    "- Use bullet points and numbered lists to break down steps, symptoms, or options.\n" +
    "- Include practical examples where they help clarify the answer.\n" +
    "- For how-to questions, provide clear step-by-step instructions.\n" +
    "- Explain the reasoning behind recommendations so the user understands why.\n" +
    "- Include best practices and common mistakes to avoid where relevant.\n" +
    "- Offer alternative approaches when multiple valid options exist.\n" +
    "- End with a brief summary or a natural follow-up question.\n" +
    "- When the reference material has detailed information, use it fully rather than summarizing it away.\n" +
    "\n" +
    "## Rules\n" +
    "1) Base your answer primarily on the reference material below, reviewed by health " +
    "professionals — do not contradict it.\n" +
    "2) If no reference material is given, answer briefly and cautiously and suggest a follow-up " +
    `question or speaking to a health worker — do not invent clinical specifics.${restrictNote}\n` +
    `3) ${styleNote ? styleNote.trim() + " " : ""}Never be judgmental or preachy.\n` +
    "4) Never give instructions that could facilitate self-harm or harm to others.\n" +
    "5) This is informational only, not a diagnosis — say so when relevant.\n" +
    "6) Always answer completely. Cover all parts of multi-part questions. " +
    "Explain clearly rather than being vaguely brief.\n" +
    "\n" +
    `Reference material:\n${referenceMaterial}`
  );
}

export async function getChatCompletion(params: {
  systemPrompt: string;
  userMessage: string;
  model: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const messages: { role: string; content: string }[] = [
    { role: "system", content: params.systemPrompt },
  ];

  if (params.history) {
    for (const msg of params.history) {
      messages.push(msg);
    }
  }

  messages.push({ role: "user", content: params.userMessage });

  const completion = await openai.chat.completions.create({
    model: params.model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature: 0.3,
    max_tokens: 2048,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
