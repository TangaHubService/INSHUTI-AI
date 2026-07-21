import { Router } from "express";
import { z } from "zod";

import { checkForCrisisLanguage } from "../lib/crisisDetector.js";
import { FLAG_REASONS, MESSAGE_ROLES, languageSchema, type Language } from "../lib/constants.js";
import { detectLanguage } from "../lib/detectLanguage.js";
import { encodeJsonColumn } from "../lib/jsonColumn.js";
import { buildSystemPrompt, getChatCompletion } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";
import { getQuickReplies } from "../lib/quickReplies.js";
import { retrieveArticles, scoreToConfidence } from "../lib/retrieval.js";
import { getOrCreateSessionId } from "../lib/session.js";

const router = Router();

const [USER, ASSISTANT] = MESSAGE_ROLES;
const [CRISIS_LANGUAGE, LOW_CONFIDENCE] = FLAG_REASONS;

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  language: languageSchema.optional(),
});

const OPEN_CONVERSATION_WINDOW_MS = 30 * 60 * 1000;

async function getOrCreateConversation(sessionId: string, language: Language) {
  const latest = await prisma.conversation.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });
  const isRecent = latest && Date.now() - latest.createdAt.getTime() < OPEN_CONVERSATION_WINDOW_MS;
  if (latest && isRecent) {
    return latest;
  }
  return prisma.conversation.create({ data: { sessionId, language } });
}

router.get("/crisis-resources", async (_req, res) => {
  const resources = await prisma.crisisResource.findMany({ orderBy: { order: "asc" } });
  res.json({ resources });
});

router.post("/", async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: z.flattenError(parsed.error) });
    return;
  }
  const { message } = parsed.data;

  const sessionId = getOrCreateSessionId(req, res);
  const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });

  const requestedLanguage = parsed.data.language ?? "EN";
  const language = settings?.autoDetectLanguage
    ? detectLanguage(message, requestedLanguage)
    : requestedLanguage;

  const conversation = await getOrCreateConversation(sessionId, language);

  const previousMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const history = previousMessages
    .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
    .map((m) => ({ role: m.role === "USER" ? "user" as const : "assistant" as const, content: m.content }));

  const crisisCheck = checkForCrisisLanguage(message);
  if (crisisCheck.isCrisis) {
    const crisisResources = await prisma.crisisResource.findMany({ orderBy: { order: "asc" } });
    const reply = buildCrisisSafetyResponse(language, crisisResources);

    // A crash between the message and flag writes must never leave a
    // crisis-language message unflagged for review, so this has to commit
    // atomically rather than as three independent awaits.
    await prisma.$transaction(async (tx) => {
      const userMessage = await tx.message.create({
        data: { conversationId: conversation.id, role: USER, content: message },
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          role: ASSISTANT,
          content: reply,
          confidence: 1,
        },
      });

      if (settings?.autoFlagCrisisLanguage ?? true) {
        await tx.flaggedItem.create({
          data: { messageId: userMessage.id, reason: CRISIS_LANGUAGE },
        });
      }
    });

    res.json({ conversationId: conversation.id, reply, topic: null, sources: [], quickReplies: [], canRequestHumanFollowUp: true });
    return;
  }

  const retrievedArticles = await retrieveArticles(message);
  const topTopic = retrievedArticles[0]?.topic ?? null;

  const systemPrompt = buildSystemPrompt(retrievedArticles, language, {
    responseStyleNote: settings?.responseStyleNote,
    restrictToKnowledgeBase: settings?.restrictToKnowledgeBase ?? true,
  });

  let reply: string;
  let aiCallFailed = false;
  try {
    reply = await getChatCompletion({
      systemPrompt,
      userMessage: message,
      model: settings?.aiModel ?? "gpt-4o-mini",
      history,
    });
  } catch (error) {
    console.error("OpenAI chat completion failed:", error);
    aiCallFailed = true;
    reply =
      language === "RW"
        ? "Mbabajwe, mfite ikibazo cy'ikoranabuhanga ubu. Wagerageza kubaza ikindi buryo, cyangwa ukavugana n'umukozi w'ubuzima?"
        : "Sorry, I'm having a technical issue right now. Could you try rephrasing, or consider speaking with a health worker?";
  }

  // A fallback apology never actually incorporated the retrieved articles —
  // claiming sources/confidence for it would misrepresent an unrelated
  // canned message as a grounded answer.
  const groundingArticles = aiCallFailed ? [] : retrievedArticles;
  const confidence = aiCallFailed
    ? 0
    : groundingArticles.length > 0
      ? scoreToConfidence(groundingArticles[0].score)
      : 0;

  // Same atomicity requirement as the crisis path: a low-confidence answer
  // must never end up unflagged because the process died between writes.
  await prisma.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        role: USER,
        content: message,
        topicId: topTopic?.id,
      },
    });

    const assistantMessage = await tx.message.create({
      data: {
        conversationId: conversation.id,
        role: ASSISTANT,
        content: reply,
        topicId: topTopic?.id,
        sourcesUsed: encodeJsonColumn(groundingArticles.map((a) => a.id)),
        confidence,
      },
    });

    if (groundingArticles.length === 0) {
      await tx.flaggedItem.create({
        data: { messageId: assistantMessage.id, reason: LOW_CONFIDENCE },
      });
    }
  });

  function snippet(text: string, maxLen = 160): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, text.lastIndexOf(" ", maxLen)) + "…";
  }

  res.json({
    conversationId: conversation.id,
    reply,
    topic: topTopic ? { id: topTopic.id, slug: topTopic.slug, nameEn: topTopic.nameEn, nameRw: topTopic.nameRw } : null,
    sources: groundingArticles.map((a) => ({
      id: a.id,
      titleEn: a.titleEn,
      titleRw: a.titleRw,
      bodySnippet: snippet(a[`body${language}` as keyof typeof a] as string || a.bodyEn),
      externalUrl: a.externalUrl,
    })),
    quickReplies: getQuickReplies(topTopic?.slug ?? null, language),
    canRequestHumanFollowUp: groundingArticles.length === 0 || (confidence !== null && confidence < 0.5),
  });
});

function buildCrisisSafetyResponse(
  language: Language,
  resources: Array<{ name: string; contact: string }>,
): string {
  const resourceLines = resources.map((r) => `${r.name}: ${r.contact}`).join("\n");
  const responses: Record<string, string> = {
    RW:
      "Ndabona ushobora kuba ugezweho n'ikibazo gikomeye. Ntugomba kubihangana wenyine — " +
      "hari abantu biteguye kugufasha ubu.\n\n" +
      resourceLines +
      "\n\nNiba uri mu kaga ako kanya, hamagara serivisi z'ubutabazi cyangwa ubwire umuntu mukuru wizeye uri hafi yawe.",
    EN:
      "It sounds like you might be going through something really difficult right now. You don't have " +
      "to face this alone — there are people ready to help you today.\n\n" +
      resourceLines +
      "\n\nIf you're in immediate danger, please contact emergency services or a trusted adult near you right now.",
    FR:
      "Il semble que vous traversez peut-être quelque chose de très difficile en ce moment. Vous n'avez pas " +
      "à faire face seul·e — des personnes sont prêtes à vous aider aujourd'hui.\n\n" +
      resourceLines +
      "\n\nSi vous êtes en danger immédiat, veuillez contacter les services d'urgence ou un adulte de confiance près de vous.",
    SW:
      "Inaonekana kama unapitia kitu kigumu sana sasa hivi. Huna haja ya kukabiliana na hili peke yako — " +
      "kuna watu tayari kukusaidia leo.\n\n" +
      resourceLines +
      "\n\nIkiwa uko katika hatari ya mara moja, tafadhali wasiliana na huduma za dharura au mtu mzima unayemwamini karibu nawe.",
  };
  return responses[language] ?? responses.EN;
}

export default router;
