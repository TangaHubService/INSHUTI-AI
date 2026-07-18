import type { Language } from "./constants.js";

// Pre-written and reviewed, same as knowledge base articles — never
// LLM-generated, so these can't drift into unreviewed territory.
type LangMap = Record<string, string[]>;
const QUICK_REPLIES: Record<string, LangMap> = {
  "menstrual-health": {
    en: ["Is period pain normal?", "How do I track my cycle?", "What if my period is late?"],
    rw: ["Kubabara mu mihango ni ibisanzwe?", "Nakurikirana umuzunguruko wanjye nte?", "Bite niba imihango itinze?"],
    fr: ["La douleur menstruelle est-elle normale?", "Comment suivre mon cycle?", "Et si mes règles sont en retard?"],
    sw: ["Maumivu ya hedhi ni ya kawaida?", "Ninawezaje kufuatilia mzunguko wangu?", "Je, ikiwa hedhi yangu imechelewa?"],
  },
  pregnancy: {
    en: ["What are early signs of pregnancy?", "When should I see a health worker?", "Can I get pregnant during my period?"],
    rw: ["Ni ibihe bimenyetso bya mbere by'inda?", "Ni ryari ngomba kubona umukozi w'ubuzima?", "Nshobora gutwita ngiri mu mihango?"],
    fr: ["Quels sont les premiers signes de grossesse?", "Quand consulter un professionnel de santé?", "Puis-je tomber enceinte pendant mes règles?"],
    sw: ["Dalili za awali za ujauzito ni zipi?", "Ni lini nipaswa kuona mtaalamu wa afya?", "Je, ninaweza kupata mimba wakati wa hedhi?"],
  },
  relationships: {
    en: ["What makes a relationship healthy?", "How do I set boundaries?", "What is consent?"],
    rw: ["Ibigize imibanire myiza ni ibihe?", "Nashyiraho imipaka nte?", "Kwemera nyakuri ni iki?"],
    fr: ["Qu'est-ce qui rend une relation saine?", "Comment fixer des limites?", "Qu'est-ce que le consentement?"],
    sw: ["Ni nini hufanya uhusiano uwe mzuri?", "Ninawezaje kuweka mipaka?", "Ridhaa ni nini?"],
  },
  "family-planning": {
    en: ["What contraception options exist?", "Where can I get family planning services?", "Does contraception cause infertility?"],
    rw: ["Hari ubuhe buryo bwo kuboneza urubyaro?", "Nabona he serivisi zo kuboneza urubyaro?", "Kuboneza urubyaro bitera ubugumba?"],
    fr: ["Quelles sont les options de contraception?", "Où trouver des services de planning familial?", "La contraception cause-t-elle l'infertilité?"],
    sw: ["Ni njia zipi za uzazi wa mpango zipo?", "Ninaweza kupata wapi huduma za uzazi wa mpango?", "Je, uzazi wa mpango husababisha utasa?"],
  },
  "hiv-stis": {
    en: ["How is HIV transmitted?", "Where can I get tested?", "How do I use a condom correctly?"],
    rw: ["Virusi itera SIDA yandura ite?", "Nabona he aho bapima?", "Nkoresha agakingirizo nte neza?"],
    fr: ["Comment le VIH se transmet-il?", "Où puis-je me faire dépister?", "Comment utiliser un préservatif correctement?"],
    sw: ["Virusi vya UKIMWI huambukizwa vipi?", "Ninaweza kupima wapi?", "Ninawezaje kutumia kondomu kwa usahihi?"],
  },
  "mental-health": {
    en: ["How do I cope with stress?", "How do I know if it's depression?", "How can I help a struggling friend?"],
    rw: ["Nihanganira umuhangayiko nte?", "Nabona nte ko ari indwara y'agahinda?", "Nafasha nte inshuti igoswe n'ibibazo?"],
    fr: ["Comment gérer le stress?", "Comment savoir si c'est une dépression?", "Comment aider un ami en difficulté?"],
    sw: ["Ninawezaje kukabiliana na mfadhaiko?", "Ninawezaje kujua kama ni mfadhaiko?", "Ninawezaje kumsaidia rafiki anayehangaika?"],
  },
};

const DEFAULT_QUICK_REPLIES: LangMap = {
  en: ["Can you tell me more?", "Is this something I should see a health worker about?", "What else should I know?"],
  rw: ["Waba unshobora kumbwira byinshi?", "Ibi ni ikintu ngomba kubaza umukozi w'ubuzima?", "Ni iki kindi nkwiye kumenya?"],
  fr: ["Pouvez-vous m'en dire plus?", "Devrais-je consulter un professionnel de santé?", "Que dois-je savoir d'autre?"],
  sw: ["Unaweza kuniambia zaidi?", "Je, hili ni jambo la kuona mtaalamu wa afya?", "Nini kingine ninachopaswa kujua?"],
};

export function getQuickReplies(topicSlug: string | null, language: Language): string[] {
  const entry = (topicSlug && QUICK_REPLIES[topicSlug]) || DEFAULT_QUICK_REPLIES;
  return entry[language] ?? entry.en;
}
