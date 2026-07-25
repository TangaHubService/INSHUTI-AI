"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = { eyebrow: string; title: string; updated: string; sections: { heading: string; body: string }[] };

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Legal", title: "Privacy Policy", updated: "Last updated: July 2025",
    sections: [
      { heading: "Information We Collect", body: "Inshuti is designed to protect your privacy. When you use the chat anonymously, we do not collect any personally identifiable information. We assign a random session ID stored in a cookie on your device. If you create an account, we collect your name, email address, and any information you choose to provide in your profile. Chat messages are stored to improve our AI responses and are never linked to your identity unless you are signed in and have disabled anonymous mode." },
      { heading: "How We Use Your Information", body: "We use your information to provide and improve the Inshuti service: to power the AI chat assistant, to facilitate appointment booking and consultations with health workers, to send notifications you have opted into, and to analyze aggregate usage patterns to improve content. We never sell your personal information or share it with third parties for marketing purposes." },
      { heading: "Data Storage and Security", body: "Your data is stored on secure servers with encryption at rest and in transit. Chat history is stored temporarily and can be cleared at any time from your device. Account information is protected by hashed passwords and secure session cookies. We implement industry-standard security measures to protect against unauthorized access." },
      { heading: "Anonymous Chat", body: "The anonymous chat feature is designed so that no personally identifying information is required. Conversations are tied only to a device-level session ID, not to your name or email. You can clear your chat history at any time. If you are signed in, you can enable anonymous mode to ensure chats are not linked to your account." },
      { heading: "Crisis Detection", body: "Inshuti uses automated detection to identify language that may indicate a crisis or safety concern. When such language is detected, the conversation may be flagged for review by a moderator. This is done to protect users and provide appropriate resources." },
      { heading: "Third-Party Services", body: "Inshuti uses OpenAI's API to generate chat responses. Messages sent through the chat are processed by OpenAI in accordance with their privacy policy. We do not share your personal information with OpenAI — only the content of your message is transmitted. We also use Nodemailer for email notifications if you opt in." },
      { heading: "Your Rights", body: "You have the right to access, correct, or delete your personal information at any time through your account settings. You can clear your chat history, update your profile, or delete your account by contacting us. You can also opt out of email and SMS notifications through your notification preferences." },
      { heading: "Contact Us", body: 'If you have questions about this Privacy Policy or your data, please contact us through the <a href="/contact" class="text-teal-700 font-bold underline">Contact page</a>.' },
    ],
  },
  RW: {
    eyebrow: "Itegeko", title: "Politiki y'Ibanga", updated: "Iheruka guhindurwa: Nyakanga 2025",
    sections: [
      { heading: "Amakuru Dusanya", body: "Inshuti yubatswe kugira ngo irinde ibanga ryawe. Iyo ukoresha Chat mu buryo butazwi, nta makuru y'umwirondoro dusanya. Duha sesiyo idasanzwe ibikwa kuri kuki kuri gikoresho cyawe." },
      { heading: "Uko Dukoresha Amakuru Yawe", body: "Dukoresha amakuru yawe kugira ngo dutange no guteza imbere serivisi ya Inshuti: gufasha AI mu kuganira, gutuma gahunda n'ubujyanama biroroshye." },
      { heading: "Ububiko n'Umutekano w'Amakuru", body: "Amakuru yawe abikwa kuri za server zifite umutekano wa encryption. Amateka ya Chat abikwa igihe gito kandi ashobora gusibwa igihe cyose." },
      { heading: "Chat Itazwi", body: "Chat itazwi ikora mu buryo buta ngombwa ko utanga amakuru y'umwirondoro. Ibiganiro bihuzwa gusa na sesiyo ya gikoresho cyawe." },
      { heading: "Kumenya Ibibazo Bikomeye", body: "Inshuti ikoresha uburyo bwo kumenya amagambo ashobora kwerekana ikibazo gikomeye." },
      { heading: "Serivisi z'Abandi", body: "Inshuti ikoresha API ya OpenAI kugira ngo itange ibisubizo bya Chat." },
      { heading: "Uburenganzira Bwawe", body: "Ufite uburenganzira bwo kureba, gukosora, cyangwa gusiba amakuru yawe ya konti igihe cyose." },
      { heading: "Duhamagare", body: 'Niba ufite ikibazo kuri iyi Politiki y\'Ibanga, duhamagare unyuze <a href="/contact" class="text-teal-700 font-bold underline">ku ipaji yo Guhamagara</a>.' },
    ],
  },
  FR: {
    eyebrow: "Juridique", title: "Politique de Confidentialité", updated: "Dernière mise à jour : juillet 2025",
    sections: [
      { heading: "Informations que nous collectons", body: "Inshuti est conçue pour protéger votre vie privée. Lorsque vous utilisez le chat anonymement, nous ne collectons aucune information personnellement identifiable." },
      { heading: "Comment nous utilisons vos informations", body: "Nous utilisons vos informations pour fournir et améliorer le service Inshuti." },
      { heading: "Stockage et sécurité des données", body: "Vos données sont stockées sur des serveurs sécurisés avec chiffrement au repos et en transit." },
      { heading: "Chat anonyme", body: "Le chat anonyme est conçu pour qu'aucune information d'identification personnelle ne soit requise." },
      { heading: "Détection de crise", body: "Inshuti utilise une détection automatisée pour identifier un langage pouvant indiquer une crise." },
      { heading: "Services tiers", body: "Inshuti utilise l'API d'OpenAI pour générer des réponses de chat." },
      { heading: "Vos droits", body: "Vous avez le droit d'accéder à vos informations personnelles, de les corriger ou de les supprimer à tout moment." },
      { heading: "Nous contacter", body: 'Si vous avez des questions, veuillez nous contacter via la <a href="/contact" class="text-teal-700 font-bold underline">page de contact</a>.' },
    ],
  },
  SW: {
    eyebrow: "Kisheria", title: "Sera ya Faragha", updated: "Ilisasishwa mwisho: Julai 2025",
    sections: [
      { heading: "Taarifa Tunazokusanya", body: "Inshuti imeundwa kulinda faragha yako. Unapotumia Gumzo bila kujulikana, hatukusanyi taarifa zozote za kibinafsi." },
      { heading: "Jinsi Tunavyotumia Taarifa Zako", body: "Tunatumia taarifa zako kutoa na kuboresha huduma ya Inshuti." },
      { heading: "Uhifadhi na Usalama wa Data", body: "Data yako inahifadhiwa kwenye seva salama zilizo na usimbaji fiche." },
      { heading: "Gumzo Bila Kujulikana", body: "Gumzo bila kujulikana limeundwa ili hakuna taarifa za kibinafsi zinazohitajika." },
      { heading: "Ugunduzi wa Dharura", body: "Inshuti hutumia ugunduzi wa kiotomatiki kutambua lugha inayoweza kuonyesha dharura." },
      { heading: "Huduma za Watu Wengine", body: "Inshuti hutumia API ya OpenAI kutoa majibu ya gumzo." },
      { heading: "Haki Zako", body: "Una haki ya kufikia, kusahihisha, au kufuta taarifa zako za kibinafsi wakati wowote." },
      { heading: "Wasiliana Nasi", body: 'Ikiwa una maswali, tafadhali wasiliana nasi kupitia <a href="/contact" class="text-teal-700 font-bold underline">ukurasa wa Mawasiliano</a>.' },
    ],
  },
};

export default function PrivacyPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];

  return (
    <PageLayout
      activeHref="/privacy"
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
        <p className="mt-2 text-[13px] text-ink-soft">{t.updated}</p>

        <div className="mt-10 space-y-8">
          {t.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl text-teal-900">{section.heading}</h2>
              <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-soft" dangerouslySetInnerHTML={{ __html: section.body }} />
            </section>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
