import type { Language } from "./constants.js";

// Pre-written and reviewed, same as knowledge base articles — the LLM never
// generates these. Mirrors the "suggest-card" content in the design
// prototype (tag/title/body/cta), keyed by topic slug.
interface Suggestion {
  tag: string;
  title: string;
  body: string;
  ctaText: string;
}

const SUGGESTIONS_BY_TOPIC: Record<string, { en: Suggestion; rw: Suggestion }> = {
  "menstrual-health": {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT MENSTRUAL HEALTH",
      title: "Try tracking your cycle",
      body: "Knowing your typical cycle length makes it much easier to answer \"could I be pregnant?\" questions for yourself. A simple calendar or app can help.",
      ctaText: "Ask Inshuti how to start",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU MIHANGO",
      title: "Gerageza gukurikirana umuzunguruko wawe",
      body: "Kumenya uburebure busanzwe bw'umuzunguruko wawe bituma byoroha kwisubiza ku kibazo \"nshobora kuba ntwite?\". Kalindari yoroheje cyangwa porogaramu birashobora gufasha.",
      ctaText: "Baza Inshuti uko wakwitangira",
    },
  },
  pregnancy: {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT PREGNANCY",
      title: "Early prenatal care matters",
      body: "If there's any chance you could be pregnant, seeing a health worker early — even just to talk through options — makes a real difference either way.",
      ctaText: "Ask Inshuti about next steps",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU NDA",
      title: "Kwitabwaho hakiri kare ni ngombwa",
      body: "Niba hari amahirwe yo gutwita, kubona umukozi w'ubuzima hakiri kare — n'iyo waba usa n'uganira ku mahitamo gusa — bigira akamaro.",
      ctaText: "Baza Inshuti intambwe zikurikiraho",
    },
  },
  relationships: {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT RELATIONSHIPS",
      title: "Boundaries are a normal thing to set",
      body: "You're allowed to say what you're comfortable with, at any point in a relationship — a partner who respects you will listen.",
      ctaText: "Talk to Inshuti about this",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU MIBANIRE",
      title: "Gushyiraho imipaka ni ibisanzwe",
      body: "Wemerewe kuvuga icyo wumva byakwiye, mu gihe icyo ari cyo cyose mu mibanire — umufasha wagushyigikiye azumva.",
      ctaText: "Ganira na Inshuti kuri ibi",
    },
  },
  "family-planning": {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT FAMILY PLANNING",
      title: "There's no one-size-fits-all method",
      body: "If a contraception method doesn't feel right for you, that doesn't mean none will — a health worker can help you find a better fit.",
      ctaText: "Find family planning options",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU KUBONEZA URUBYARO",
      title: "Nta buryo bumwe buhuye na bose",
      body: "Niba uburyo bumwe bwo kuboneza urubyaro budahuye nawe, ntibisobanura ko nta buryo buzagukwiye — umukozi w'ubuzima arashobora kugufasha kubona ubukwiye.",
      ctaText: "Reba uburyo bwo kuboneza urubyaro",
    },
  },
  "hiv-stis": {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT HIV & STIS",
      title: "Testing regularly is a healthy habit",
      body: "If you're sexually active, testing every 3-6 months (and after a new partner) is a normal part of taking care of yourself, not a sign something is wrong.",
      ctaText: "Find testing options",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU VIRUSI ITERA SIDA",
      title: "Gupimwa kenshi ni akamenyero keza",
      body: "Niba ukorana imibonano mpuzabitsina, gupimwa buri mezi 3-6 (no nyuma ya mugenzi mushya) ni igice gisanzwe cyo kwiyitaho, ntabwo ari ikimenyetso cy'uko hari ikibazo.",
      ctaText: "Reba aho bapimira",
    },
  },
  "mental-health": {
    en: {
      tag: "BASED ON YOUR QUESTIONS ABOUT MENTAL HEALTH",
      title: "It's okay to feel this way",
      body: "Mood changes are common and there are simple ways to manage them. If a feeling is constant rather than passing, talking to someone can help.",
      ctaText: "Talk to Inshuti about this",
    },
    rw: {
      tag: "BISHINGIYE KU BIBAZO WABAZE KU BUZIMA BWO MU MUTWE",
      title: "Ni ibisanzwe kwiyumva utyo",
      body: "Guhinduka kw'imyumvire ni ibisanzwe kandi hari uburyo bworoshye bwo kubicunga. Niba umumva uhoraho aho kuba w'igihe gito, kuvugana n'umuntu birafasha.",
      ctaText: "Ganira na Inshuti kuri ibi",
    },
  },
};

const DEFAULT_SUGGESTIONS: { en: Suggestion; rw: Suggestion }[] = [
  {
    en: {
      tag: "GETTING STARTED",
      title: "Ask anything, no question is too small",
      body: "Inshuti is here for questions about your body, relationships, and wellbeing — big or small, there's no judgment.",
      ctaText: "Start a conversation",
    },
    rw: {
      tag: "GUTANGIRA",
      title: "Baza ikintu cyose, nta kibazo gito cyane",
      body: "Inshuti iri hano ku bibazo ku mubiri wawe, imibanire yawe, n'ubuzima bwawe muri rusange — bikomeye cyangwa bito, nta gucira urubanza.",
      ctaText: "Tangira ikiganiro",
    },
  },
];

export interface SuggestionResult extends Suggestion {
  topicSlug: string | null;
}

export function getSuggestionsForTopics(topicSlugs: string[], language: Language): SuggestionResult[] {
  const seen = new Set<string>();
  const results: SuggestionResult[] = [];

  for (const slug of topicSlugs) {
    if (seen.has(slug)) continue;
    const entry = SUGGESTIONS_BY_TOPIC[slug];
    if (!entry) continue;
    seen.add(slug);
    results.push({ ...(language === "RW" ? entry.rw : entry.en), topicSlug: slug });
    if (results.length >= 3) break;
  }

  if (results.length === 0) {
    for (const entry of DEFAULT_SUGGESTIONS) {
      results.push({ ...(language === "RW" ? entry.rw : entry.en), topicSlug: null });
    }
  }

  return results;
}
