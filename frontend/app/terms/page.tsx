"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = { eyebrow: string; title: string; updated: string; sections: { heading: string; body: string }[] };

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Legal", title: "Terms of Use", updated: "Last updated: July 2025",
    sections: [
      { heading: "Acceptance of Terms", body: "By accessing or using Inshuti, you agree to be bound by these Terms of Use. If you do not agree, please do not use the service. We may update these terms from time to time; continued use after changes constitutes acceptance of the revised terms." },
      { heading: "Description of Service", body: "Inshuti is an AI-powered health information assistant that provides general educational content on sexual and reproductive health. The service includes anonymous chat, account-based features such as appointment booking and consultations with health professionals, and access to a library of reviewed health articles." },
      { heading: "Not Medical Advice", body: "Inshuti provides general health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition. If you are in crisis or experiencing a medical emergency, contact emergency services immediately." },
      { heading: "User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate information when registering. You may not use the service for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these terms." },
      { heading: "Privacy", body: 'Your privacy is important to us. Please review our <a href="/privacy" class="text-teal-700 font-bold underline">Privacy Policy</a> to understand how we collect, use, and protect your information.' },
      { heading: "Anonymous Use", body: "You may use the chat feature anonymously without creating an account. Anonymous chats are tied to a device-level session ID and are not linked to your identity. You can clear your chat history at any time." },
      { heading: "Acceptable Use", body: "You agree to use Inshuti for lawful purposes only. You may not use the service to harass, abuse, or harm others, or to upload or transmit any content that is illegal, harmful, or violates the rights of others. We reserve the right to moderate content and flag conversations that violate these terms." },
      { heading: "Limitation of Liability", body: "Inshuti and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. The service is provided 'as is' without warranties of any kind, either express or implied." },
      { heading: "Contact", body: 'If you have questions about these terms, please <a href="/contact" class="text-teal-700 font-bold underline">contact us</a>.' },
    ],
  },
  RW: {
    eyebrow: "Itegeko", title: "Amabwiriza yo Gukoresha", updated: "Iheruka guhindurwa: Nyakanga 2025",
    sections: [
      { heading: "Kwemera Amabwiriza", body: "Ukoresha Inshuti, wemera kugenderwa n'aya mabwiriza. Niba utabishaka, ntukoreshe serivisi." },
      { heading: "Ibisobanuro bya Serivisi", body: "Inshuti ni umufasha wa AI utanga amakuru rusange y'uburezi ku buzima bw'imyororokere." },
      { heading: "Ntabwo ari Ubuvuzi", body: "Inshuti itanga amakuru rusange y'ubuzima mu rwego rw'uburezi gusa. Ntisimbura ubuvuzi bw'abaganga." },
      { heading: "Konti z'Abakoresha", body: "Ushinzwe kugumana ibanga ry'amakuru ya konti yawe n'ibikorwa byose bikorwa muri konti yawe." },
      { heading: "Ibanga", body: 'Ibanga ryawe ni ingenzi kuri twe. Nyamuneka reba <a href="/privacy" class="text-teal-700 font-bold underline">Politiki y\'Ibanga</a>.' },
      { heading: "Gukoresha mu buryo Butazwi", body: "Ushobora gukoresha chat mu buryo butazwi utafunguye konti." },
      { heading: "Gukoresha Byemewe", body: "Wemera gukoresha Inshuti mu ntego z'amategeko gusa." },
      { heading: "Imbogamizi z'Ubutaka", body: "Inshuti n'abayikoresha ntibazahora bahagarara ku bwangizi butaziguye buturutse ku gukoresha serivisi." },
      { heading: "Duhamagare", body: 'Niba ufite ibibazo kuri aya mabwiriza, <a href="/contact" class="text-teal-700 font-bold underline">duhamagare</a>.' },
    ],
  },
  FR: {
    eyebrow: "Juridique", title: "Conditions d'Utilisation", updated: "Dernière mise à jour : juillet 2025",
    sections: [
      { heading: "Acceptation des conditions", body: "En accédant ou en utilisant Inshuti, vous acceptez d'être lié par ces conditions d'utilisation." },
      { heading: "Description du service", body: "Inshuti est un assistant d'information sanitaire alimenté par l'IA qui fournit du contenu éducatif général sur la santé sexuelle et reproductive." },
      { heading: "Pas un avis médical", body: "Inshuti fournit des informations générales sur la santé à des fins éducatives uniquement." },
      { heading: "Comptes utilisateurs", body: "Vous êtes responsable de la confidentialité de vos identifiants de compte." },
      { heading: "Confidentialité", body: 'Veuillez consulter notre <a href="/privacy" class="text-teal-700 font-bold underline">Politique de confidentialité</a>.' },
      { heading: "Utilisation anonyme", body: "Vous pouvez utiliser la fonction de chat anonymement sans créer de compte." },
      { heading: "Utilisation acceptable", body: "Vous acceptez d'utiliser Inshuti uniquement à des fins licites." },
      { heading: "Limitation de responsabilité", body: "Inshuti et ses opérateurs ne peuvent être tenus responsables des dommages indirects." },
      { heading: "Contact", body: 'Si vous avez des questions, <a href="/contact" class="text-teal-700 font-bold underline">contactez-nous</a>.' },
    ],
  },
  SW: {
    eyebrow: "Kisheria", title: "Masharti ya Matumizi", updated: "Ilisasishwa mwisho: Julai 2025",
    sections: [
      { heading: "Kukubali Masharti", body: "Kwa kufikia au kutumia Inshuti, unakubali kufungwa na Masharti haya ya Matumizi." },
      { heading: "Maelezo ya Huduma", body: "Inshuti ni msaidizi wa taarifa za afya unaoendeshwa na AI." },
      { heading: "Si Ushauri wa Kitabibu", body: "Inshuti hutoa taarifa za jumla za afya kwa madhumuni ya elimu pekee." },
      { heading: "Akaunti za Watumiaji", body: "Wewe ndiye unawajibika kwa usiri wa vitambulisho vyako vya akaunti." },
      { heading: "Faragha", body: 'Tafadhali kagua <a href="/privacy" class="text-teal-700 font-bold underline">Sera yetu ya Faragha</a>.' },
      { heading: "Matumizi Bila Kujulikana", body: "Unaweza kutumia kipengele cha gumzo bila kujulikana bila kuunda akaunti." },
      { heading: "Matumizi Yanayokubalika", body: "Unakubali kutumia Inshuti kwa madhumuni halali pekee." },
      { heading: "Kikomo cha Dhima", body: "Inshuti na waendeshaji wake hawatachukuliwa dhima kwa uharibifu usio wa moja kwa moja." },
      { heading: "Wasiliana Nasi", body: 'Ikiwa una maswali, <a href="/contact" class="text-teal-700 font-bold underline">wasiliana nasi</a>.' },
    ],
  },
};

export default function TermsPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];

  return (
    <PageLayout
      activeHref="/terms"
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
