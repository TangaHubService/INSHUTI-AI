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

type LangSuggestionMap = Record<string, Suggestion>;

const SUGGESTIONS_BY_TOPIC: Record<string, LangSuggestionMap> = {
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LA SANTÉ MENSTRUELLE",
      title: "Essayez de suivre votre cycle",
      body: "Connaître la durée typique de votre cycle vous permet de répondre plus facilement à la question « pourrais-je être enceinte ? ». Un simple calendrier ou une application peut vous aider.",
      ctaText: "Demandez à Inshuti comment commencer",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU AFYA YA HEDHI",
      title: "Jaribu kufuatilia mzunguko wako",
      body: "Kujua urefu wa kawaida wa mzunguko wako hurahisisha kujibu swali la \"naweza kuwa mjamzito?\" kwa ajili yako mwenyewe. Kalenda rahisi au programu inaweza kusaidia.",
      ctaText: "Muulize Inshuti jinsi ya kuanza",
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LA GROSSESSE",
      title: "Les soins prénatals précoces comptent",
      body: "S'il y a une chance que vous soyez enceinte, consulter un professionnel de santé tôt — ne serait-ce que pour discuter des options — fait une réelle différence.",
      ctaText: "Demandez à Inshuti les prochaines étapes",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU UJAUZITO",
      title: "Huduma za mapema za ujauzito ni muhimu",
      body: "Ikiwa kuna uwezekano wowote wa kuwa mjamzito, kuona mtaalamu wa afya mapema — hata kuzungumza tu kuhusu chaguzi — hufanya tofauti halisi.",
      ctaText: "Muulize Inshuti kuhusu hatua zinazofuata",
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LES RELATIONS",
      title: "Fixer des limites est une chose normale",
      body: "Vous avez le droit de dire ce avec quoi vous êtes à l'aise, à tout moment dans une relation — un partenaire qui vous respecte vous écoutera.",
      ctaText: "Parlez à Inshuti de ce sujet",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU UHUSIANO",
      title: "Kuweka mipaka ni jambo la kawaida",
      body: "Unaruhusiwa kusema kile unachostarehe nacho, wakati wowote katika uhusiano — mwenzi anayekuheshimu atakusikiliza.",
      ctaText: "Zungumza na Inshuti kuhusu hili",
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LE PLANNING FAMILIAL",
      title: "Il n'y a pas de méthode unique",
      body: "Si une méthode contraceptive ne vous convient pas, cela ne signifie pas qu'aucune ne conviendra — un professionnel de santé peut vous aider à trouver celle qui vous correspond.",
      ctaText: "Trouver des options de planning familial",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU UZAZI WA MPANGO",
      title: "Hakuna njia inayofaa kila mtu",
      body: "Ikiwa njia moja ya uzazi wa mpango haikufai, haimaanishi kuwa hakuna itakayofaa — mtaalamu wa afya anaweza kukusaidia kupata njia inayofaa.",
      ctaText: "Tafuta chaguzi za uzazi wa mpango",
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LE VIH ET LES IST",
      title: "Se faire dépister régulièrement est une bonne habitude",
      body: "Si vous êtes sexuellement actif·ve, un dépistage tous les 3 à 6 mois (et après un nouveau partenaire) est une façon normale de prendre soin de vous.",
      ctaText: "Trouver des options de dépistage",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU VVU NA MAGONJWA YA ZINA",
      title: "Kupima mara kwa mara ni tabia nzuri",
      body: "Ikiwa una shughuli za ngono, kupima kila baada ya miezi 3-6 (na baada ya mpenzi mpya) ni sehemu ya kawaida ya kujitunza, si ishara ya kitu kibaya.",
      ctaText: "Tafuta chaguzi za kupima",
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
    fr: {
      tag: "SELON VOS QUESTIONS SUR LA SANTÉ MENTALE",
      title: "C'est normal de se sentir ainsi",
      body: "Les changements d'humeur sont courants et il existe des moyens simples de les gérer. Si un sentiment est constant plutôt que passager, en parler à quelqu'un peut aider.",
      ctaText: "Parlez à Inshuti de ce sujet",
    },
    sw: {
      tag: "KWA MUJIBU WA MASWALI YAKO KUHUSU AFYA YA AKILI",
      title: "Ni sawa kujisikia hivi",
      body: "Mabadiliko ya hisia ni ya kawaida na kuna njia rahisi za kuyasimamia. Ikiwa hisia ni ya kudumu badala ya kupita, kuzungumza na mtu kunaweza kusaidia.",
      ctaText: "Zungumza na Inshuti kuhusu hili",
    },
  },
};

const DEFAULT_SUGGESTIONS: LangSuggestionMap[] = [
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
    fr: {
      tag: "POUR COMMENCER",
      title: "Demandez tout, aucune question n'est trop petite",
      body: "Inshuti est là pour les questions sur votre corps, vos relations et votre bien-être — grandes ou petites, il n'y a aucun jugement.",
      ctaText: "Commencer une conversation",
    },
    sw: {
      tag: "KUANZA",
      title: "Uliza chochote, hakuna swali dogo sana",
      body: "Inshuti yuko kwa maswali kuhusu mwili wako, mahusiano yako, na ustawi wako — kubwa au ndogo, hakuna hukumu.",
      ctaText: "Anza mazungumzo",
    },
  },
];

export interface SuggestionResult extends Suggestion {
  topicSlug: string | null;
}

function pickByLang(map: LangSuggestionMap, language: Language): Suggestion {
  return map[language] ?? map.en;
}

export function getSuggestionsForTopics(topicSlugs: string[], language: Language): SuggestionResult[] {
  const seen = new Set<string>();
  const results: SuggestionResult[] = [];

  for (const slug of topicSlugs) {
    if (seen.has(slug)) continue;
    const entry = SUGGESTIONS_BY_TOPIC[slug];
    if (!entry) continue;
    seen.add(slug);
    results.push({ ...pickByLang(entry, language), topicSlug: slug });
    if (results.length >= 3) break;
  }

  if (results.length === 0) {
    for (const entry of DEFAULT_SUGGESTIONS) {
      results.push({ ...pickByLang(entry, language), topicSlug: null });
    }
  }

  return results;
}
