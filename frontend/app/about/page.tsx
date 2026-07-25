"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = {
  eyebrow: string; title: string; lead: string; story: string;
  missionTitle: string; mission: string;
  valuesTitle: string; values: { icon: string; title: string; body: string }[];
  teamTitle: string; team: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "About", title: "About Inshuti",
    lead: "Inshuti means 'friend' in Kinyarwanda — and that's exactly what we aim to be: a trusted, judgment-free companion for young people navigating questions about their health.",
    story: "Inshuti was built to address a critical gap in sexual and reproductive health education for young people in Rwanda. Many young people lack access to accurate, age-appropriate information about their bodies, relationships, and health. They face barriers of stigma, privacy concerns, and limited access to healthcare providers. Inshuti removes those barriers by providing a free, anonymous, bilingual AI assistant that anyone can use from their phone, anytime, anywhere.",
    missionTitle: "Our Mission",
    mission: "To empower every young person in Rwanda with honest, evidence-based health information — in their own language, on their own terms, without fear or judgment.",
    valuesTitle: "Our Values",
    values: [
      { icon: "i-lock", title: "Privacy First", body: "We designed Inshuti to be anonymous by default. Your conversations stay private, and you're in control of your data." },
      { icon: "i-globe", title: "Bilingual by Design", body: "Full support in English and Kinyarwanda, with French and Swahili coming soon — because everyone deserves answers in the language they're most comfortable with." },
      { icon: "i-book", title: "Clinically Reviewed", body: "Every answer is grounded in content reviewed by healthcare professionals, ensuring accuracy and reliability." },
      { icon: "i-heart", title: "Youth-Centered", body: "Built with and for young people, with input from youth health advocates, educators, and healthcare workers across Rwanda." },
    ],
    teamTitle: "Built for Young People, Guided by Experts",
    team: "Inshuti is developed in collaboration with healthcare professionals, youth health advocates, and technology partners committed to improving health outcomes for young people in Rwanda.",
  },
  RW: {
    eyebrow: "Ibyerekeye", title: "Ibyerekeye Inshuti",
    lead: "Inshuti ni ijambo riba mu Kinyarwanda risobanura inshuti — kandi icyo dushaka kuba cyo nyine: inshuti yizewe, itagira urubanza, ku rubyiruko rushaka ibisubizo ku buzima bwabo.",
    story: "Inshuti yubatswe kugira ngo ikemure ikibazo gikomeye mu burezi bw'ubuzima bw'imyororokere ku rubyiruko mu Rwanda. Urubyiruko rwinshi ntirubona amakuru y'ukuri, akwiranye n'imyaka, ku mibiri yabo, imibanire, n'ubuzima. Bahura n'imbogamizi z'ikimwaro, impungenge z'ibanga, n'uburemere bwo kubona abaganga. Inshuti ikuraho izo mbogamizi itanga umufasha wa AI utazwi, ku buntu, mu ndimi ebyiri, uko ushoboye gukoresha igihe cyose, aho uri hose.",
    missionTitle: "Intego Yacu",
    mission: "Guha buri mukiri n'umurimbi mu Rwanda amakuru y'ukuri, ashyingiye ku bimenyetso, ku buzima bw'imyororokere — mu rurimi rwabo, mu buryo bwabo, nta bwoba cyangwa urubanza.",
    valuesTitle: "Indangagaciro Zacu",
    values: [
      { icon: "i-lock", title: "Ibanga Ribanza", body: "Twubatse Inshuti kugira ngo ibanga rishobore kugumbirwa. Ibiganiro byawe biguma ari ibanga, kandi uri mu butware bw'amakuru yawe." },
      { icon: "i-globe", title: "Indimi Ebyiri", body: "Gufashwa byuzuye mu Cyongereza no mu Kinyarwanda — kuko buri wese akwiye kubona ibisubizo mu rurimi akunda." },
      { icon: "i-book", title: "Bisuzumwe n'Abaganga", body: "Ibisubizo byose bishingiye ku bintu byarebwe n'abaganga, byemeza ukuri no kugirwa amakuru." },
      { icon: "i-heart", title: "Bishingiye ku Rubyiruko", body: "Byubatswe hamwe n'urubyiruko kandi bikagirwa urubyiruko, bifite umusanzu w'abajyanama b'ubuzima bw'urubyiruko." },
    ],
    teamTitle: "Byubatswe ku Rubyiruko, Biyobowe n'Abahanga",
    team: "Inshuti yubatswe mu bufatanye n'abaganga, abajyanama b'ubuzima bw'urubyiruko, n'abafatanyabikorwa ba tekinoloji biyemeje guteza imbere ubuzima bw'urubyiruko mu Rwanda.",
  },
  FR: {
    eyebrow: "À propos", title: "À propos d'Inshuti",
    lead: "Inshuti signifie « ami » en kinyarwanda — et c'est exactement ce que nous aspirons à être : un compagnon de confiance, sans jugement, pour les jeunes qui se posent des questions sur leur santé.",
    story: "Inshuti a été conçue pour combler une lacune critique dans l'éducation à la santé sexuelle et reproductive des jeunes au Rwanda. De nombreux jeunes n'ont pas accès à des informations précises et adaptées à leur âge sur leur corps, leurs relations et leur santé.",
    missionTitle: "Notre Mission",
    mission: "Donner à chaque jeune au Rwanda des informations honnêtes et fondées sur des preuves en matière de santé — dans sa propre langue, selon ses propres termes, sans crainte ni jugement.",
    valuesTitle: "Nos Valeurs",
    values: [
      { icon: "i-lock", title: "Confidentialité d'abord", body: "Nous avons conçu Inshuti pour être anonyme par défaut. Vos conversations restent privées." },
      { icon: "i-globe", title: "Bilingue par conception", body: "Support complet en anglais et en kinyarwanda — parce que tout le monde mérite des réponses dans la langue qui lui convient." },
      { icon: "i-book", title: "Validé cliniquement", body: "Chaque réponse s'appuie sur un contenu validé par des professionnels de santé." },
      { icon: "i-heart", title: "Centré sur les jeunes", body: "Construit avec et pour les jeunes, avec la contribution de défenseurs de la santé des jeunes." },
    ],
    teamTitle: "Construit pour les jeunes, guidé par des experts",
    team: "Inshuti est développé en collaboration avec des professionnels de santé, des défenseurs de la santé des jeunes et des partenaires technologiques.",
  },
  SW: {
    eyebrow: "Kuhusu", title: "Kuhusu Inshuti",
    lead: "Inshuti maana yake ni 'rafiki' kwa Kinyarwanda — na ndio hasa tunalenga kuwa: rafiki wa kuaminika, asiye na hukumu, kwa vijana wanaotafuta majibu kuhusu afya zao.",
    story: "Inshuti ilijengwa kuziba pengo muhimu katika elimu ya afya ya uzazi na ngono kwa vijana nchini Rwanda. Vijana wengi hawana ufikiaji wa taarifa sahihi na zinazofaa kwa umri wao.",
    missionTitle: "Dhamira Yetu",
    mission: "Kumwezesha kila kijana nchini Rwanda kwa taarifa za afya za kweli, zenye msingi wa ushahidi — kwa lugha yao wenyewe, kwa masharti yao wenyewe, bila woga au hukumu.",
    valuesTitle: "Maadili Yetu",
    values: [
      { icon: "i-lock", title: "Faragha Kwanza", body: "Tumeunda Inshuti kuwa bila kujulikana kwa chaguo-msingi. Mazungumzo yako yanabaki kuwa ya faragha." },
      { icon: "i-globe", title: "Lugha Mbili kwa Muundo", body: "Msaada kamili kwa Kiingereza na Kinyarwanda — kwa sababu kila mtu anastahili majibu kwa lugha anayostarehe nayo." },
      { icon: "i-book", title: "Imepitiwa na Wataalamu", body: "Kila jibu linategemea maudhui yaliyopitiwa na wataalamu wa afya." },
      { icon: "i-heart", title: "Inayowalenga Vijana", body: "Imejengwa na na kwa ajili ya vijana, kwa mchango wa watetezi wa afya ya vijana." },
    ],
    teamTitle: "Imejengwa kwa Vijana, Ikiongozwa na Wataalamu",
    team: "Inshuti inatengenezwa kwa ushirikiano na wataalamu wa afya, watetezi wa afya ya vijana, na washirika wa teknolojia.",
  },
};

export default function AboutPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];

  return (
    <PageLayout
      activeHref="/about"
      navItems={[
        { href: "/chat", label: nav.chat },
        { href: "/about", label: "About" },
        { href: "/services", label: "Services" },
        { href: "/library", label: "Library" },
        { href: "/faq", label: "FAQ" },
      ]}
    >
      <section className="animate-slide-up py-[76px]">
        <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">{t.eyebrow}</span>
        <h1 className="mt-3 font-display text-[52px] leading-[1.06] text-teal-900">{t.title}</h1>
        <p className="mt-5 max-w-[640px] text-[17.5px] leading-[1.6] text-ink-soft">{t.lead}</p>
      </section>

      <section className="pb-16">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[15.5px] leading-[1.7] text-ink-soft">{t.story}</p>
          </div>
          <div className="rounded-[32px] border border-line bg-white p-8 shadow-soft">
            <h2 className="font-display text-2xl text-teal-900">{t.missionTitle}</h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-ink-soft">{t.mission}</p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <h2 className="font-display text-3xl text-teal-900">{t.valuesTitle}</h2>
        <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {t.values.map((v) => (
            <div key={v.title} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card transition-all duration-150 hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-[14px] flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg width="20" height="20"><use href={`#${v.icon}`} /></svg>
              </div>
              <h3 className="text-base text-teal-900">{v.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 shadow-card">
          <h2 className="font-display text-2xl text-teal-900">{t.teamTitle}</h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-ink-soft">{t.team}</p>
        </div>
      </section>
    </PageLayout>
  );
}
