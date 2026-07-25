"use client";

import Link from "next/link";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = {
  eyebrow: string; title: string; lead: string;
  services: { icon: string; title: string; body: string; href: string; cta: string }[];
  bottom: { heading: string; body: string };
};

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Our Services", title: "What We Offer",
    lead: "Inshuti provides a range of free, confidential services designed to help young people in Rwanda get the health information and support they need.",
    services: [
      { icon: "i-chat", title: "AI Health Chat", body: "Get instant answers to your health questions through our anonymous AI chat assistant. Available 24/7 in English and Kinyarwanda.", href: "/chat", cta: "Start chatting" },
      { icon: "i-clock", title: "My Space", body: "Your personal history of past conversations, topic exploration, and personalized suggestions — all private to your device.", href: "/my-space", cta: "Visit My Space" },
      { icon: "i-stethoscope", title: "Health Consultations", body: "When you need more than AI, request a follow-up conversation with a real health worker who can provide personalized support.", href: "/consultations", cta: "View consultations" },
      { icon: "i-calendar", title: "Appointment Booking", body: "Book time with a Community Health Worker, nurse, midwife, psychologist, or doctor at a time that works for you.", href: "/appointments", cta: "Book an appointment" },
      { icon: "i-map-pin", title: "Facility Locator", body: "Find health facilities near you — hospitals, health centres, clinics, and pharmacies — with contact information and services offered.", href: "/facility-locator", cta: "Find care" },
      { icon: "i-book", title: "Health Library", body: "Browse our library of reviewed health articles covering menstrual health, pregnancy, relationships, family planning, HIV & STIs, and mental health.", href: "/library", cta: "Explore library" },
    ],
    bottom: { heading: "All Free, Always Confidential", body: "Every service Inshuti offers is completely free. You can use the chat anonymously without creating an account, or register to unlock appointments, consultations, and personalized features. Your privacy is protected at every step." },
  },
  RW: {
    eyebrow: "Serivisi Zacu", title: "Ibyo Tutanga",
    lead: "Inshuti itanga serivisi zitandukanye, ku buntu, zihishe, zifasha urubyiruko mu Rwanda kubona amakuru y'ubuzima n'ubufasha bakeneye.",
    services: [
      { icon: "i-chat", title: "AI Chat y'Ubuzima", body: "Bona ibisubizo ako kanya ku bibazo byawe by'ubuzima ukoresheje Chat yacu ya AI itazwi. Iraboneka 24/7 mu Cyongereza no mu Kinyarwanda.", href: "/chat", cta: "Tangira kuganira" },
      { icon: "i-clock", title: "Umwanya Wanjye", body: "Amateka yawe y'ibiganiro byawe byabanje, gushima insanganyamatsiko, n'ibyifuzo byihariye — byose ni ibanga ku gikoresho cyawe.", href: "/my-space", cta: "Sura Umwanya Wanjye" },
      { icon: "i-stethoscope", title: "Ubujyanama bw'Ubuzima", body: "Iyo ukeneye ibirenze AI, saba ikiganiro gikurikirana n'umukozi w'ubuzima nyirizina.", href: "/consultations", cta: "Reba ubujyanama" },
      { icon: "i-calendar", title: "Gufata Gahunda", body: "Fata umwanya n'umujyanama w'ubuzima, umuforomo, umubyaza, umuganga w'indwara zo mu mutwe, cyangwa muganga.", href: "/appointments", cta: "Fata gahunda" },
      { icon: "i-map-pin", title: "Gushaka Ivuriro", body: "Shaka ivuriro riri hafi yawe — ibitaro, ivuriro, kliniki, n'amafarumasi — hamwe n'amakuru yo guhagara.", href: "/facility-locator", cta: "Shaka ubuvuzi" },
      { icon: "i-book", title: "Ububiko bw'Ubuzima", body: "Reba ububiko bw'inkuru z'ubuzima zisuzumwe zivuga ku buzima bw'imihango, gutwita, imibanire, kuboneza urubyaro, virusi ya SIDA, n'ubuzima bwo mu mutwe.", href: "/library", cta: "Reba ububiko" },
    ],
    bottom: { heading: "Byose Ku Buntu, Ibanga Igihe Cyose", body: "Serivisi zose Inshuti itanga ni ubuntu. Ushobora gukoresha chat utazwi utafunguye konti, cyangwa wiyandikishe kugira ngo ubone gahunda, ubujyanama, n'ibintu byihariye. Ibanga ryawe rirarindwa buri gihe." },
  },
  FR: {
    eyebrow: "Nos Services", title: "Ce que nous offrons",
    lead: "Inshuti propose une gamme de services gratuits et confidentiels conçus pour aider les jeunes au Rwanda à obtenir les informations et le soutien dont ils ont besoin.",
    services: [
      { icon: "i-chat", title: "Chat Santé IA", body: "Obtenez des réponses instantanées à vos questions de santé via notre assistant de chat IA anonyme.", href: "/chat", cta: "Discuter" },
      { icon: "i-clock", title: "Mon Espace", body: "Votre historique personnel de conversations, d'exploration de sujets et de suggestions personnalisées.", href: "/my-space", cta: "Visiter" },
      { icon: "i-stethoscope", title: "Consultations", body: "Demandez un suivi avec un professionnel de santé lorsque vous avez besoin de plus que l'IA.", href: "/consultations", cta: "Voir" },
      { icon: "i-calendar", title: "Rendez-vous", body: "Prenez rendez-vous avec un agent de santé communautaire, infirmier, sage-femme, psychologue ou médecin.", href: "/appointments", cta: "Réserver" },
      { icon: "i-map-pin", title: "Localisateur", body: "Trouvez des établissements de santé près de chez vous — hôpitaux, centres de santé, cliniques et pharmacies.", href: "/facility-locator", cta: "Trouver" },
      { icon: "i-book", title: "Bibliothèque Santé", body: "Parcourez notre bibliothèque d'articles de santé révisés.", href: "/library", cta: "Explorer" },
    ],
    bottom: { heading: "Tout Gratuit, Toujours Confidentiel", body: "Tous les services qu'Inshuti propose sont entièrement gratuits. Vous pouvez utiliser le chat anonymement sans créer de compte." },
  },
  SW: {
    eyebrow: "Huduma Zetu", title: "Tunachotoa",
    lead: "Inshuti hutoa huduma mbalimbali za bure na za siri ili kusaidia vijana nchini Rwanda kupata taarifa za afya na msaada wanaohitaji.",
    services: [
      { icon: "i-chat", title: "Gumzo la Afya la AI", body: "Pata majibu ya papo hapo kwa maswali yako ya afya kupitia msaidizi wetu wa gumzo la AI bila kujulikana.", href: "/chat", cta: "Anza kuongea" },
      { icon: "i-clock", title: "Nafasi Yangu", body: "Historia yako ya kibinafsi ya mazungumzo yaliyopita, uchunguzi wa mada, na mapendekezo yaliyobinafsishwa.", href: "/my-space", cta: "Tembelea" },
      { icon: "i-stethoscope", title: "Mashauriano ya Afya", body: "Omba ufuatiliaji na mhudumu wa afya halisi unapohitaji zaidi ya AI.", href: "/consultations", cta: "Angalia" },
      { icon: "i-calendar", title: "Kupanga Miadi", body: "Panga muda na mfanyakazi wa afya wa jamii, muuguzi, mkunga, mwanasaikolojia, au daktari.", href: "/appointments", cta: "Panga" },
      { icon: "i-map-pin", title: "Kipataji Huduma", body: "Tafuta vituo vya afya karibu nawe — hospitali, vituo vya afya, kliniki, na maduka ya dawa.", href: "/facility-locator", cta: "Tafuta" },
      { icon: "i-book", title: "Maktaba ya Afya", body: "Vinjari maktaba yetu ya makala ya afya yaliyopitiwa.", href: "/library", cta: "Vinjari" },
    ],
    bottom: { heading: "Yote Bure, Siri Kila Wakati", body: "Kila huduma Inshuti inayotoa ni bure kabisa. Unaweza kutumia gumzo bila kujulikana bila kuunda akaunti." },
  },
};

export default function ServicesPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];

  return (
    <PageLayout
      activeHref="/services"
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
        <p className="mt-5 max-w-[560px] text-[17.5px] leading-[1.6] text-ink-soft">{t.lead}</p>
      </section>

      <section className="pb-16">
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {t.services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex flex-col rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card transition-all duration-150 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="mb-[14px] flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <svg width="20" height="20"><use href={`#${s.icon}`} /></svg>
              </div>
              <h3 className="text-lg text-teal-900">{s.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-[1.5] text-ink-soft">{s.body}</p>
              <span className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-coral-dark group-hover:gap-2 transition-all duration-150">
                {s.cta}
                <svg width="13" height="13"><use href="#i-arrow" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="rounded-[32px] border border-line bg-white p-8 shadow-soft">
          <h2 className="font-display text-2xl text-teal-900">{t.bottom.heading}</h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-ink-soft">{t.bottom.body}</p>
        </div>
      </section>
    </PageLayout>
  );
}
