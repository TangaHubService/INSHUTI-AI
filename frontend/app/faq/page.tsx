"use client";

import { useState } from "react";
import Link from "next/link";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = { eyebrow: string; title: string; lead: string; free: { heading: string; body: string; cta: string }; items: { q: string; a: string }[] };

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "FAQ", title: "Frequently Asked Questions",
    lead: "Quick answers to common questions about Inshuti, privacy, and how to make the most of the service.",
    free: { heading: "Inshuti is completely free", body: "Chat, consultations, appointments — every feature is available at no cost. No hidden charges, no subscriptions, no surprises.", cta: "Start chatting free" },
    items: [
      { q: "What is Inshuti?", a: "Inshuti is a free, anonymous AI health assistant for young people in Rwanda. It provides honest, judgment-free answers to questions about sexual and reproductive health in English and Kinyarwanda." },
      { q: "Is Inshuti really anonymous?", a: "Yes. When using the chat without signing in, no personally identifying information is collected. Conversations are tied only to a device-level session ID. If you create an account, you can enable anonymous mode in your profile settings to keep chats unlinked from your identity." },
      { q: "Do I need to sign up to use the chat?", a: "No. You can start chatting immediately without creating an account. Registration is optional and unlocks additional features like appointment booking, consultations with health workers, and conversation history." },
      { q: "Is the health information reliable?", a: "Yes. Every answer from Inshuti is grounded in content from our knowledge base, which is reviewed by healthcare professionals. Articles must be marked as 'Reviewed' before they are used in chat responses." },
      { q: "What languages are supported?", a: "Inshuti currently supports English and Kinyarwanda, with French and Swahili available for the interface. The AI chat responds in the language you use." },
      { q: "Can I talk to a real person?", a: "Yes. During a chat, if the AI determines you might benefit from speaking with a health worker, you'll be offered the option to request a human follow-up. You can also book appointments with health professionals directly." },
      { q: "Is there a mobile app?", a: "Inshuti is a web-based application that works on any device with a browser — phone, tablet, or computer. There is no separate app to download." },
      { q: "How much does it cost?", a: "Everything on Inshuti is completely free. There are no charges for chat, consultations, appointment booking, or any other feature." },
      { q: "What if I'm in crisis?", a: "If you're in crisis or need urgent help, tap the crisis banner at the top of the chat page to see immediate support resources. Inshuti also automatically detects crisis language and provides safety resources." },
      { q: "How is my data protected?", a: "Your data is encrypted in transit and at rest. Chat sessions use secure cookies. Account passwords are hashed. You can clear your chat history at any time. See our Privacy Policy for full details." },
    ],
  },
  RW: {
    eyebrow: "Ibibazo", title: "Ibibazo Bikunze Kubazwa",
    lead: "Ibisubizo byihuse ku bibazo bikunze kubazwa kuri Inshuti, ibanga, n'uburyo bwo gukoresha neza serivisi.",
    free: { heading: "Inshuti ni ubuntu", body: "Ikiganiro, ubujyanama, gahunda — buri kintu kiraboneka ku buntu. Nta mafaranga yihishe, nta kwiyandikisha, nta gitangaza.", cta: "Tangira kuganira ku buntu" },
    items: [
      { q: "Inshuti ni iki?", a: "Inshuti ni umufasha wa AI utazwi, ku buntu, w'urubyiruko mu Rwanda. Utanga ibisubizo by'ukuri, bitagira urubanza, ku bibazo by'ubuzima bw'imyororokere mu Cyongereza no mu Kinyarwanda." },
      { q: "Inshuti irihisha by'ukuri?", a: "Yego. Iyo ukoresha chat utinjiriye, nta makuru y'umwirondoro atanzwe. Ibiganiro bihuzwa gusa na sesiyo ya gikoresho cyawe. Niba ufite konti, ushobora gukoresha uburyo butazwi mu mitwarire yawe." },
      { q: "Ndasabwa kwiyandikisha kugira ngo nkoreshe chat?", a: "Oya. Ushobora gutangira kuganira ako kanya utiyanditse. Kwiyandikisha ni ubushake kandi bitugezaho ibindi bitekerezo." },
      { q: "Amakuru y'ubuzima yizewe?", a: "Yego. Buri gisubizo gitangwa na Inshuti gishingiye ku bintu biri mu bubiko bwacu, bisuzumwe n'abaganga." },
      { q: "Ni izihe ndimi zifashwa?", a: "Inshuti ifasha mu Cyongereza no mu Kinyarwanda. Chat ya AI isubiza mu rurimi ukoresha." },
      { q: "Nshobora kuvugana n'umuntu nyirizina?", a: "Yego. Mu kiganiro, niba AI ibona ko wungukirana no kuvugana n'umukozi w'ubuzima, uzahabwa amahitanyo yo gusaba gukurikirana." },
      { q: "Hari porogaramu ya mobile?", a: "Inshuti ni porogaramu ya web ikora ku gikoresho icyo ari cyo cyose gifasha browser — telefoni, tablete, cyangwa mudasobwa." },
      { q: "Bingora angahe?", a: "Ibintu byose kuri Inshuti ni ubuntu. Nta mafaranga asabwa." },
      { q: "Niba ndi mu kaga?", a: "Niba uri mu kaga cyangwa ukeneye ubufasha bwihutirwa, kandaho kuri crisis banner hejuru y'ipaji ya chat." },
      { q: "Amakuru yanjye arindwa ate?", a: "Amakuru yawe arakoreshwa encryption. Soma politiki y'ibanga kugira ngo umenye byinshi." },
    ],
  },
  FR: {
    eyebrow: "FAQ", title: "Questions Fréquentes",
    lead: "Réponses rapides aux questions courantes sur Inshuti, la confidentialité et la façon de tirer le meilleur parti du service.",
    free: { heading: "Inshuti est entièrement gratuit", body: "Chat, consultations, rendez-vous — chaque fonctionnalité est disponible sans frais. Pas de frais cachés, pas d'abonnement, pas de surprises.", cta: "Commencez à discuter gratuitement" },
    items: [
      { q: "Qu'est-ce qu'Inshuti ?", a: "Inshuti est un assistant de santé IA gratuit et anonyme pour les jeunes au Rwanda. Il fournit des réponses honnêtes et sans jugement aux questions sur la santé sexuelle et reproductive." },
      { q: "Inshuti est-il vraiment anonyme ?", a: "Oui. Lorsque vous utilisez le chat sans vous connecter, aucune information d'identification personnelle n'est collectée." },
      { q: "Dois-je m'inscrire pour utiliser le chat ?", a: "Non. Vous pouvez commencer à discuter immédiatement sans créer de compte." },
      { q: "Les informations sont-elles fiables ?", a: "Oui. Chaque réponse d'Inshuti est fondée sur le contenu de notre base de connaissances, révisé par des professionnels de santé." },
      { q: "Quelles langues sont supportées ?", a: "Inshuti prend actuellement en charge l'anglais et le kinyarwanda, avec le français et le swahili disponibles pour l'interface." },
      { q: "Puis-je parler à une vraie personne ?", a: "Oui. Vous pouvez demander un suivi humain ou prendre rendez-vous avec des professionnels de santé." },
      { q: "Existe-t-il une application mobile ?", a: "Inshuti est une application web qui fonctionne sur n'importe quel appareil avec un navigateur." },
      { q: "Combien ça coûte ?", a: "Tout sur Inshuti est entièrement gratuit." },
      { q: "Et si je suis en crise ?", a: "Si vous êtes en crise, appuyez sur la bannière de crise en haut de la page de chat." },
      { q: "Comment mes données sont-elles protégées ?", a: "Vos données sont cryptées en transit et au repos. Consultez notre Politique de confidentialité." },
    ],
  },
  SW: {
    eyebrow: "Maswali", title: "Maswali Yanayoulizwa Mara kwa Mara",
    lead: "Majibu ya haraka kwa maswali ya kawaida kuhusu Inshuti, faragha, na jinsi ya kutumia huduma vyema.",
    free: { heading: "Inshuti ni bure kabisa", body: "Gumzo, mashauriano, miadi — kila kipengele kinapatikana bila gharama. Hakuna malipo ya siri, hakuna usajili, hakuna mshangao.", cta: "Anza kuongea bure" },
    items: [
      { q: "Inshuti ni nini?", a: "Inshuti ni msaidizi wa afya wa AI bure na asiyejulikana kwa vijana nchini Rwanda. Hutoa majibu ya kweli na yasiyo na hukumu kuhusu afya ya uzazi na ngono." },
      { q: "Je, Inshuti haina jina kweli?", a: "Ndiyo. Unapotumia gumzo bila kuingia, hakuna taarifa za kibinafsi zinazokusanywa." },
      { q: "Je, ninahitaji kujiandikisha kutumia gumzo?", a: "Hapana. Unaweza kuanza kuongea mara moja bila kuunda akaunti." },
      { q: "Je, taarifa za afya zinaaminika?", a: "Ndiyo. Kila jibu kutoka Inshuti linategemea maudhui kutoka kwenye maktaba yetu ya maarifa." },
      { q: "Ni lugha zipi zinazotumika?", a: "Inshuti inasaidia Kiingereza na Kinyarwanda, pamoja na Kifaransa na Kiswahili kwa ajili ya kiolesura." },
      { q: "Naweza kuongea na mtu halisi?", a: "Ndiyo. Unaweza kuomba ufuatiliaji wa kibinadamu au kupanga miadi na wataalamu wa afya." },
      { q: "Je, kuna programu ya simu?", a: "Inshuti ni programu ya wavuti inayofanya kazi kwenye kifaa chochote chenye kivinjari." },
      { q: "Inagharimu kiasi gani?", a: "Kila kitu kwenye Inshuti ni bure kabisa." },
      { q: "Vipi ikiwa niko kwenye hatari?", a: "Ikiwa uko kwenye dharura, bonyeza kwenye bango la dharura juu ya ukurasa wa gumzo." },
      { q: "Je, data yangu inalindwaje?", a: "Data yako imesimbwa kwa njia fiche. Tazama Sera yetu ya Faragha." },
    ],
  },
};

function ToggleSection({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-150 hover:bg-teal-100/30"
      >
        <span className="pr-4 text-[15px] font-semibold text-ink">{q}</span>
        <svg width="16" height="16" className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <use href="#i-chevron-down" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-5 pb-5">
          <p className="text-[14px] leading-[1.6] text-ink-soft">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PageLayout
      activeHref="/faq"
      navItems={[
        { href: "/chat", label: nav.chat },
        { href: "/about", label: "About" },
        { href: "/services", label: "Services" },
        { href: "/library", label: "Library" },
        { href: "/faq", label: "FAQ" },
      ]}
    >
      <section className="animate-slide-up mx-auto max-w-[760px] py-[76px]">
        <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">{t.eyebrow}</span>
        <h1 className="mt-3 font-display text-[34px] text-teal-900">{t.title}</h1>
        <p className="mt-3 max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">{t.lead}</p>

        <div className="mt-8 card p-6 sm:p-8 bg-gradient-to-br from-teal-50 to-white">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-teal-900">{t.free.heading}</h2>
              <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">{t.free.body}</p>
            </div>
            <Link
              href="/chat"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-[14px] font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark"
            >
              {t.free.cta}
              <svg width="14" height="14"><use href="#i-arrow" /></svg>
            </Link>
          </div>
        </div>

        <div className="mt-8 card py-1.5">
          {t.items.map((item, i) => (
            <ToggleSection key={i} q={item.q} a={item.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
