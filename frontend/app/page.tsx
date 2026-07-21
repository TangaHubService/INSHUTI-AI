"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import type { Language } from "@/lib/apiClient";

type Topic = { icon: string; bg: string; fg: string; name: string; body: string };
type Feature = { icon: string; title: string; body: string };

type Copy = {
  nav: {
    chat: string;
    mySpace: string;
    appointments: string;
    findCare: string;
    portals: string;
    login: string;
    register: string;
    goToChat: string;
    goToDashboard: string;
    logOut: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleEm: string;
    body: string;
    ctaChat: string;
    ctaBrowse: string;
    trustSignup: string;
    trustReviewed: string;
    trustBilingual: string;
  };
  demo: { name: string; session: string; question: string; answer: string; chip1: string; chip2: string };
  topics: { eyebrow: string; title: string; body: string; cta: string; items: Topic[] };
  features: { eyebrow: string; title: string; items: Feature[] };
  preview: { eyebrow: string; title: string; question: string; answer: string };
  footer: { privacy: string; terms: string; admin: string; disclaimer: string };
};

const COPY: Record<Language, Copy> = {
  EN: {
    nav: { chat: "Chat", mySpace: "My Space", appointments: "Appointments", findCare: "Find Care", portals: "Portals", login: "Log in", register: "Register", goToChat: "Go to Chat", goToDashboard: "Go to Dashboard", logOut: "Log out" },
    hero: {
      eyebrow: "Free · Anonymous · Bilingual",
      titleLead: "Ask anything about your health. ",
      titleEm: "Get a friend's answer.",
      body: "Inshuti is an AI assistant that gives young people honest, judgment-free answers on sexual and reproductive health — reviewed by professionals, available anytime, in English or Kinyarwanda.",
      ctaChat: "Chat with Inshuti",
      ctaBrowse: "Browse topics",
      trustSignup: "No sign-up required",
      trustReviewed: "Reviewed by clinicians",
      trustBilingual: "English & Kinyarwanda",
    },
    demo: {
      name: "Inshuti Assistant",
      session: "Anonymous session",
      question: "Can I become pregnant during my period?",
      answer:
        "Pregnancy is less likely during menstruation, but still possible depending on the timing of ovulation. If you're concerned, a pregnancy test can help — and it's always okay to speak with a health worker.",
      chip1: "How ovulation works",
      chip2: "Find a clinic near me",
    },
    topics: {
      eyebrow: "Popular topics",
      title: "Wherever you're starting from",
      body: "Six areas young people ask about most — tap one to jump straight into a conversation.",
      cta: "Ask about this",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Menstrual Health", body: "Cycles, symptoms, products, and what's normal for your body." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Pregnancy", body: 'Signs, timelines, prenatal care, and answering "what if."' },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Relationships", body: "Consent, communication, boundaries, and healthy partnerships." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Family Planning", body: "Contraception options explained clearly, without pressure." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "HIV & STIs", body: "Prevention, testing, and treatment — with zero judgment." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Mental Health", body: "Stress, anxiety, and support for the feelings behind the questions." },
      ],
    },
    features: {
      eyebrow: "Why Inshuti",
      title: "Built to be trusted",
      items: [
        { icon: "i-bot", title: "AI Assistant", body: "Ask reproductive health questions anytime, in your own words." },
        { icon: "i-lock", title: "Anonymous", body: "No names, no accounts. Your privacy is protected by design." },
        { icon: "i-globe", title: "Bilingual", body: "Full support in English and Kinyarwanda." },
        { icon: "i-book", title: "Evidence Based", body: "Every answer is grounded in content reviewed by professionals." },
      ],
    },
    preview: {
      eyebrow: "See it in action",
      title: "Chat preview",
      question: "Can I become pregnant during my period?",
      answer:
        "Pregnancy is less likely during menstruation, but it is still possible depending on the timing of ovulation. If you have concerns about pregnancy, consider taking a pregnancy test and consult a healthcare provider.",
    },
    footer: {
      privacy: "Privacy",
      terms: "Terms",
      admin: "Admin",
      disclaimer:
        "Inshuti provides general health information and is not a substitute for professional medical diagnosis or treatment. If you are in crisis or need urgent care, please contact a local health facility or the resources listed in the app.",
    },
  },
  RW: {
    nav: { chat: "Ganira", mySpace: "Umwanya wanjye", appointments: "Gahunda", findCare: "Shaka Ubuvuzi", portals: "Urubuga", login: "Injira", register: "Iyandikishe", goToChat: "Jya ku Kiganiro", goToDashboard: "Jya ku Kibaho", logOut: "Sohoka" },
    hero: {
      eyebrow: "Ku buntu · Wihishe · Indimi ebyiri",
      titleLead: "Baza ikibazo icyo aricyo cyose ku buzima bwawe. ",
      titleEm: "Bonera igisubizo nk'icy'inshuti.",
      body: "Inshuti ni umufasha wa AI utanga ibisubizo by'ukuri, bitagira urubanza, ku ngingo z'ubuzima bw'imyororokere ku rubyiruko — birebwa n'abaganga, biboneka igihe cyose, mu Cyongereza cyangwa mu Kinyarwanda.",
      ctaChat: "Ganira na Inshuti",
      ctaBrowse: "Reba insanganyamatsiko",
      trustSignup: "Ntibisaba kwiyandikisha",
      trustReviewed: "Birebwa n'abaganga",
      trustBilingual: "Icyongereza & Ikinyarwanda",
    },
    demo: {
      name: "Umufasha wa Inshuti",
      session: "Umukoro wihishe",
      question: "Ese nshobora gutwita nkiri mu mihango?",
      answer:
        "Gutwita birakunda kudindiza mu gihe cy'imihango, ariko birashoboka bitewe n'igihe cy'ubwororoke. Niba ufite impungenge, ikizamini cyo gutwita gishobora gufasha — kandi ntakibazo kuvugana n'umukozi w'ubuzima.",
      chip1: "Uko ubwororoke bukora",
      chip2: "Shaka ivuriro riri hafi",
    },
    topics: {
      eyebrow: "Insanganyamatsiko zikunzwe",
      title: "Uvuye aho uri hose",
      body: "Ibice bitandatu urubyiruko rukunze kubaza — kandaho kimwe ubone ikiganiro ako kanya.",
      cta: "Baza kuri iki",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Ubuzima bw'Imihango", body: "Imihango, ibimenyetso, ibikoresho, n'ibisanzwe ku mubiri wawe." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Gutwita", body: "Ibimenyetso, ibihe, kwitabwaho mbere yo kubyara, no gusubiza \"ese niba...\"." },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Imibanire", body: "Kwemera, itumanaho, imbibi, n'ubufatanye bwiza." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Kuboneza Urubyaro", body: "Uburyo bwo kuboneza urubyaro busobanuwe neza, nta gushyigikirizwa." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "Virusi ya SIDA n'Indwara Zandurira mu Mibonano", body: "Kwirinda, gupimwa, no kuvurwa — nta rubanza." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Ubuzima bwo mu Mutwe", body: "Stress, kwiheba, n'ubufasha ku byiyumvo biri inyuma y'ibibazo." },
      ],
    },
    features: {
      eyebrow: "Impamvu Inshuti",
      title: "Yubatswe kugira ngo yiziherwe",
      items: [
        { icon: "i-bot", title: "Umufasha wa AI", body: "Baza ibibazo by'ubuzima bw'imyororokere igihe cyose, mu magambo yawe bwite." },
        { icon: "i-lock", title: "Wihishe", body: "Nta mazina, nta konti. Ibanga ryawe rirarindwa." },
        { icon: "i-globe", title: "Indimi ebyiri", body: "Gufashwa mu Cyongereza no mu Kinyarwanda byuzuye." },
        { icon: "i-book", title: "Bishingiye ku Bimenyetso", body: "Igisubizo cyose gishingiye ku bintu byarebwe n'abaganga." },
      ],
    },
    preview: {
      eyebrow: "Reba uko bikora",
      title: "Urugero rw'ikiganiro",
      question: "Ese nshobora gutwita nkiri mu mihango?",
      answer:
        "Gutwita birakunda kudindiza mu gihe cy'imihango, ariko birashoboka bitewe n'igihe cy'ubwororoke. Niba ufite impungenge ku gutwita, gerageza ikizamini cyo gutwita kandi ubaze umukozi w'ubuzima.",
    },
    footer: {
      privacy: "Ibanga",
      terms: "Amabwiriza",
      admin: "Ubuyobozi",
      disclaimer:
        "Inshuti itanga amakuru rusange ku buzima kandi ntisimbura isuzuma cyangwa ubuvuzi bw'abaganga bemewe. Niba uri mu kaga cyangwa ukeneye ubufasha bwihutirwa, hamagara ivuriro riri hafi cyangwa ukoreshe amakuru yatanzwe muri iyi porogaramu.",
    },
  },
  FR: {
    nav: { chat: "Discuter", mySpace: "Mon Espace", appointments: "Rendez-vous", findCare: "Trouver des Soins", portals: "Portails", login: "Connexion", register: "S'inscrire", goToChat: "Aller au Chat", goToDashboard: "Aller au Tableau de bord", logOut: "Déconnexion" },
    hero: {
      eyebrow: "Gratuit · Anonyme · Bilingue",
      titleLead: "Posez toutes vos questions de santé. ",
      titleEm: "Obtenez la réponse d'un ami.",
      body: "Inshuti est un assistant IA qui donne aux jeunes des réponses honnêtes et sans jugement sur la santé sexuelle et reproductive — validées par des professionnels, disponibles à tout moment, en anglais ou en kinyarwanda.",
      ctaChat: "Discuter avec Inshuti",
      ctaBrowse: "Parcourir les sujets",
      trustSignup: "Aucune inscription requise",
      trustReviewed: "Validé par des cliniciens",
      trustBilingual: "Anglais & Kinyarwanda",
    },
    demo: {
      name: "Assistant Inshuti",
      session: "Session anonyme",
      question: "Puis-je tomber enceinte pendant mes règles ?",
      answer:
        "Une grossesse est moins probable pendant les règles, mais reste possible selon le moment de l'ovulation. En cas de doute, un test de grossesse peut aider — et il est toujours possible d'en parler à un professionnel de santé.",
      chip1: "Comment fonctionne l'ovulation",
      chip2: "Trouver une clinique proche",
    },
    topics: {
      eyebrow: "Sujets populaires",
      title: "Où que vous en soyez",
      body: "Six thèmes les plus demandés par les jeunes — cliquez pour démarrer une conversation.",
      cta: "Poser une question",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Santé Menstruelle", body: "Cycles, symptômes, produits, et ce qui est normal pour votre corps." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Grossesse", body: "Signes, échéances, soins prénatals, et réponses à vos \"et si\"." },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Relations", body: "Consentement, communication, limites, et partenariats sains." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Planning Familial", body: "Options de contraception expliquées clairement, sans pression." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "VIH & IST", body: "Prévention, dépistage et traitement — sans jugement." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Santé Mentale", body: "Stress, anxiété, et soutien pour les émotions derrière vos questions." },
      ],
    },
    features: {
      eyebrow: "Pourquoi Inshuti",
      title: "Conçu pour être fiable",
      items: [
        { icon: "i-bot", title: "Assistant IA", body: "Posez vos questions de santé reproductive à tout moment, avec vos propres mots." },
        { icon: "i-lock", title: "Anonyme", body: "Aucun nom, aucun compte. Votre vie privée est protégée par conception." },
        { icon: "i-globe", title: "Bilingue", body: "Support complet en anglais et en kinyarwanda." },
        { icon: "i-book", title: "Fondé sur des Preuves", body: "Chaque réponse s'appuie sur un contenu validé par des professionnels." },
      ],
    },
    preview: {
      eyebrow: "Voir en action",
      title: "Aperçu de la discussion",
      question: "Puis-je tomber enceinte pendant mes règles ?",
      answer:
        "Une grossesse est moins probable pendant les règles, mais reste possible selon le moment de l'ovulation. En cas d'inquiétude, envisagez un test de grossesse et consultez un professionnel de santé.",
    },
    footer: {
      privacy: "Confidentialité",
      terms: "Conditions",
      admin: "Admin",
      disclaimer:
        "Inshuti fournit des informations générales sur la santé et ne remplace pas un diagnostic ou un traitement médical professionnel. En cas de crise ou de besoin de soins urgents, contactez un établissement de santé local ou les ressources listées dans l'application.",
    },
  },
  SW: {
    nav: { chat: "Ongea", mySpace: "Nafasi Yangu", appointments: "Miadi", findCare: "Tafuta Huduma", portals: "Milango", login: "Ingia", register: "Jisajili", goToChat: "Nenda kwa Mazungumzo", goToDashboard: "Nenda kwa Dashibodi", logOut: "Toka" },
    hero: {
      eyebrow: "Bure · Bila Jina · Lugha Mbili",
      titleLead: "Uliza chochote kuhusu afya yako. ",
      titleEm: "Pata jibu la rafiki.",
      body: "Inshuti ni msaidizi wa AI unaowapa vijana majibu ya kweli, yasiyo na hukumu kuhusu afya ya uzazi na ngono — yaliyopitiwa na wataalamu, yanapatikana wakati wowote, kwa Kiingereza au Kinyarwanda.",
      ctaChat: "Ongea na Inshuti",
      ctaBrowse: "Vinjari mada",
      trustSignup: "Hakuna usajili unaohitajika",
      trustReviewed: "Imepitiwa na madaktari",
      trustBilingual: "Kiingereza & Kinyarwanda",
    },
    demo: {
      name: "Msaidizi wa Inshuti",
      session: "Kipindi bila jina",
      question: "Je, ninaweza kupata mimba nikiwa kwenye hedhi?",
      answer:
        "Uwezekano wa kupata mimba ni mdogo wakati wa hedhi, lakini bado inawezekana kutegemea wakati wa udondoshaji wa yai. Ukiwa na wasiwasi, kipimo cha ujauzito kinaweza kusaidia — na ni sawa kuzungumza na mhudumu wa afya.",
      chip1: "Jinsi udondoshaji wa yai unavyofanya kazi",
      chip2: "Tafuta kliniki iliyo karibu",
    },
    topics: {
      eyebrow: "Mada Maarufu",
      title: "Popote unapoanzia",
      body: "Maeneo sita ambayo vijana huuliza zaidi — gusa moja kuanza mazungumzo moja kwa moja.",
      cta: "Uliza kuhusu hili",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Afya ya Hedhi", body: "Mzunguko, dalili, bidhaa, na kilicho cha kawaida kwa mwili wako." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Ujauzito", body: "Dalili, ratiba, huduma kabla ya kujifungua, na majibu ya \"vipi kama\"." },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Mahusiano", body: "Idhini, mawasiliano, mipaka, na ushirikiano wenye afya." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Uzazi wa Mpango", body: "Njia za uzazi wa mpango zilizoelezwa kwa uwazi, bila shinikizo." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "VVU na Magonjwa ya Zinaa", body: "Kinga, kupima, na matibabu — bila hukumu." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Afya ya Akili", body: "Msongo, wasiwasi, na msaada kwa hisia nyuma ya maswali yako." },
      ],
    },
    features: {
      eyebrow: "Kwa Nini Inshuti",
      title: "Imejengwa kuaminika",
      items: [
        { icon: "i-bot", title: "Msaidizi wa AI", body: "Uliza maswali ya afya ya uzazi wakati wowote, kwa maneno yako mwenyewe." },
        { icon: "i-lock", title: "Bila Jina", body: "Hakuna majina, hakuna akaunti. Faragha yako imelindwa kwa muundo." },
        { icon: "i-globe", title: "Lugha Mbili", body: "Msaada kamili kwa Kiingereza na Kinyarwanda." },
        { icon: "i-book", title: "Inayotegemea Ushahidi", body: "Kila jibu linatokana na maudhui yaliyopitiwa na wataalamu." },
      ],
    },
    preview: {
      eyebrow: "Ona ikifanya kazi",
      title: "Muhtasari wa Mazungumzo",
      question: "Je, ninaweza kupata mimba nikiwa kwenye hedhi?",
      answer:
        "Uwezekano wa kupata mimba ni mdogo wakati wa hedhi, lakini bado inawezekana kutegemea wakati wa udondoshaji wa yai. Ukiwa na wasiwasi kuhusu ujauzito, fikiria kupima ujauzito na kumuona mtaalamu wa afya.",
    },
    footer: {
      privacy: "Faragha",
      terms: "Masharti",
      admin: "Msimamizi",
      disclaimer:
        "Inshuti inatoa taarifa za jumla za afya na si mbadala wa uchunguzi au matibabu ya kitaalamu. Ikiwa uko katika hali ya dharura au unahitaji huduma ya haraka, wasiliana na kituo cha afya cha karibu au rasilimali zilizoorodheshwa kwenye programu.",
    },
  },
};

export default function Home() {
  const { language } = useLanguage();
  const t = COPY[language];

  return (
    <div className="bg-paper">
      <SiteHeader
        activeHref="/"
        navItems={[
          { href: "/chat", label: t.nav.chat },
          { href: "/my-space", label: t.nav.mySpace },
          { href: "/appointments", label: t.nav.appointments },
          { href: "/facility-locator", label: t.nav.findCare },
        ]}
      />
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">

        <section className="grid grid-cols-1 items-center gap-14 py-[76px] pb-[88px] md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="mb-[18px] block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.hero.eyebrow}
            </span>
            <h1 className="font-display text-[52px] font-bold leading-[1.06] text-teal-900">
              {t.hero.titleLead}
              <em className="not-italic text-coral">{t.hero.titleEm}</em>
            </h1>
            <p className="mt-5 max-w-[480px] text-[17.5px] leading-[1.6] text-ink-soft">{t.hero.body}</p>
            <div className="mt-8 flex gap-[14px]">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
              >
                {t.hero.ctaChat}
                <svg width="16" height="16">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              <a
                href="#topics"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-teal-700 px-[26px] py-[13px] text-[15px] font-semibold text-teal-700 transition hover:-translate-y-px hover:bg-teal-100"
              >
                {t.hero.ctaBrowse}
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-[22px]">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-lock" />
                </svg>
                {t.hero.trustSignup}
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-book" />
                </svg>
                {t.hero.trustReviewed}
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-soft">
                <svg width="16" height="16" className="text-teal-700">
                  <use href="#i-globe" />
                </svg>
                {t.hero.trustBilingual}
              </div>
            </div>
          </div>

          <div className="relative">
            <svg className="absolute -right-5 -top-10 z-0 w-[340px] opacity-50" viewBox="0 0 64 64">
              <use href="#mark-knot" />
            </svg>
            <div className="relative z-10 rounded-[32px] border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2.5 border-b border-line pb-[14px]">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-teal-700">
                  <svg width="18" height="18" className="text-white">
                    <use href="#i-bot" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14.5px] font-bold text-teal-900">{t.demo.name}</div>
                  <div className="flex items-center gap-[5px] text-xs text-ink-soft">
                    <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#39B08A]" />
                    {t.demo.session}
                  </div>
                </div>
              </div>
              <div className="ml-auto mt-[14px] max-w-[88%] rounded-2xl rounded-br-[4px] bg-teal-100 px-4 py-[13px] text-sm leading-[1.5] text-teal-900">
                {t.demo.question}
              </div>
              <div className="mt-[14px] max-w-[88%] rounded-2xl rounded-bl-[4px] bg-paper-2 px-4 py-[13px] text-sm leading-[1.5] text-ink">
                {t.demo.answer}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-white px-[13px] py-[7px] text-[12.5px] font-semibold text-teal-700">
                  {t.demo.chip1}
                </span>
                <span className="rounded-full border border-line bg-white px-[13px] py-[7px] text-[12.5px] font-semibold text-teal-700">
                  {t.demo.chip2}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16" id="topics">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.topics.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">{t.topics.title}</h2>
            <p className="mt-3 text-[15.5px] text-ink-soft">{t.topics.body}</p>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {t.topics.items.map((topic) => (
              <Link
                href={`/chat?topic=${topic.icon}`}
                key={topic.name}
                className="flex cursor-pointer flex-col gap-[14px] rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-[14px] ${topic.bg} ${topic.fg}`}>
                  <svg width="22" height="22">
                    <use href={`#${topic.icon}`} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-teal-900">{topic.name}</h3>
                <p className="text-[13.5px] leading-[1.5] text-ink-soft">{topic.body}</p>
                <span className="mt-auto flex items-center gap-1.5 text-[13px] font-bold text-coral-dark">
                  {t.topics.cta}
                  <svg width="13" height="13">
                    <use href="#i-arrow" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.features.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">{t.features.title}</h2>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature) => (
              <div
                key={feature.title}
                className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 text-left shadow-card"
              >
                <div className="mb-[14px] flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <svg width="20" height="20">
                    <use href={`#${feature.icon}`} />
                  </svg>
                </div>
                <h3 className="text-base text-teal-900">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[760px] p-2">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.preview.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-4xl text-teal-900">{t.preview.title}</h2>
          </div>
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 shadow-card">
            <div className="max-w-full rounded-2xl rounded-br-[4px] bg-teal-100 px-4 py-[13px] text-sm leading-[1.5] text-teal-900">
              {t.preview.question}
            </div>
            <div className="mt-[14px] max-w-full rounded-2xl rounded-bl-[4px] bg-paper-2 px-4 py-[13px] text-sm leading-[1.5] text-ink">
              {t.preview.answer}
            </div>
          </div>
        </section>

        <SiteFooter disclaimer={t.footer.disclaimer} />
      </div>
    </div>
  );
}
