import type { Language } from "./constants.js";

// Pre-written and reviewed, same as knowledge base articles — never
// LLM-generated, so these can't drift into unreviewed territory.
const QUICK_REPLIES: Record<string, { en: string[]; rw: string[] }> = {
  "menstrual-health": {
    en: ["Is period pain normal?", "How do I track my cycle?", "What if my period is late?"],
    rw: ["Kubabara mu mihango ni ibisanzwe?", "Nakurikirana umuzunguruko wanjye nte?", "Bite niba imihango itinze?"],
  },
  pregnancy: {
    en: ["What are early signs of pregnancy?", "When should I see a health worker?", "Can I get pregnant during my period?"],
    rw: ["Ni ibihe bimenyetso bya mbere by'inda?", "Ni ryari ngomba kubona umukozi w'ubuzima?", "Nshobora gutwita ngiri mu mihango?"],
  },
  relationships: {
    en: ["What makes a relationship healthy?", "How do I set boundaries?", "What is consent?"],
    rw: ["Ibigize imibanire myiza ni ibihe?", "Nashyiraho imipaka nte?", "Kwemera nyakuri ni iki?"],
  },
  "family-planning": {
    en: ["What contraception options exist?", "Where can I get family planning services?", "Does contraception cause infertility?"],
    rw: ["Hari ubuhe buryo bwo kuboneza urubyaro?", "Nabona he serivisi zo kuboneza urubyaro?", "Kuboneza urubyaro bitera ubugumba?"],
  },
  "hiv-stis": {
    en: ["How is HIV transmitted?", "Where can I get tested?", "How do I use a condom correctly?"],
    rw: ["Virusi itera SIDA yandura ite?", "Nabona he aho bapima?", "Nkoresha agakingirizo nte neza?"],
  },
  "mental-health": {
    en: ["How do I cope with stress?", "How do I know if it's depression?", "How can I help a struggling friend?"],
    rw: ["Nihanganira umuhangayiko nte?", "Nabona nte ko ari indwara y'agahinda?", "Nafasha nte inshuti igoswe n'ibibazo?"],
  },
};

const DEFAULT_QUICK_REPLIES: { en: string[]; rw: string[] } = {
  en: ["Can you tell me more?", "Is this something I should see a health worker about?", "What else should I know?"],
  rw: ["Waba unshobora kumbwira byinshi?", "Ibi ni ikintu ngomba kubaza umukozi w'ubuzima?", "Ni iki kindi nkwiye kumenya?"],
};

export function getQuickReplies(topicSlug: string | null, language: Language): string[] {
  const entry = (topicSlug && QUICK_REPLIES[topicSlug]) || DEFAULT_QUICK_REPLIES;
  return language === "RW" ? entry.rw : entry.en;
}
