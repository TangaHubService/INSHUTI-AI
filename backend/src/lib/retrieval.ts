import { ARTICLE_STATUSES } from "./constants.js";
import { decodeJsonColumn } from "./jsonColumn.js";
import { prisma } from "./prisma.js";

const [REVIEWED] = ARTICLE_STATUSES;

const STOPWORDS = new Set([
  // English
  "the", "a", "an", "is", "are", "was", "were", "i", "you", "he", "she", "it",
  "we", "they", "to", "of", "in", "on", "for", "and", "or", "my", "me", "can",
  "do", "does", "what", "how", "if", "this", "that", "about", "with", "be",
  "have", "has", "not", "no", "yes", "get", "will", "would", "should", "am",
  // Kinyarwanda (common function words)
  "ni", "na", "cyangwa", "ku", "mu", "aba", "uwo", "ibi", "iki", "ese", "nte",
  "gute", "ute", "kandi", "kuko", "niba", "ndi", "uri", "turi", "bari",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export interface RetrievedArticle {
  id: string;
  topicId: string;
  titleEn: string;
  titleRw: string;
  titleFr: string;
  titleSw: string;
  bodyEn: string;
  bodyRw: string;
  bodyFr: string;
  bodySw: string;
  externalUrl: string | null;
  score: number;
  topic: { id: string; slug: string; nameEn: string; nameRw: string };
}

const MIN_SCORE = 1;
const MAX_RESULTS = 3;

function buildArticleKeywords(article: {
  tags: string;
  titleEn: string;
  titleRw: string;
}): Set<string> {
  const tagWords = decodeJsonColumn(article.tags).flatMap(tokenize);
  return new Set([...tagWords, ...tokenize(article.titleEn), ...tokenize(article.titleRw)]);
}

export async function retrieveArticles(message: string): Promise<RetrievedArticle[]> {
  const messageTokens = tokenize(message);
  if (messageTokens.length === 0) {
    return [];
  }

  const articles = await prisma.article.findMany({
    where: { status: REVIEWED },
    include: { topic: true },
  });

  const scored = articles.map((article) => {
    const keywords = buildArticleKeywords(article);
    let score = 0;
    for (const token of messageTokens) {
      if (keywords.has(token)) score += 1;
    }
    return { article, score };
  });

  return scored
    .filter(({ score }) => score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ article, score }) => ({
      id: article.id,
      topicId: article.topicId,
      titleEn: article.titleEn,
      titleRw: article.titleRw,
      titleFr: article.titleFr,
      titleSw: article.titleSw,
      bodyEn: article.bodyEn,
      bodyRw: article.bodyRw,
      bodyFr: article.bodyFr,
      bodySw: article.bodySw,
      externalUrl: (article as any).externalUrl ?? null,
      score,
      topic: article.topic,
    }));
}

// Normalizes a top retrieval score to a rough 0-1 confidence. 3+ overlapping
// keywords is treated as a strong, well-grounded match.
export function scoreToConfidence(topScore: number): number {
  return Math.min(1, topScore / 3);
}
