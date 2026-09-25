"use client";

import { useState } from "react";
import Link from "next/link";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { publicNav } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";

type Copy = {
  heroTitle: string;
  heroBody: string;
  talk: string;
  find: string;
  heroNote: string;
  howEyebrow: string;
  howTitle: string;
  steps: { n: string; title: string; body: string }[];
  networkEyebrow: string;
  networkTitle: string;
  networkBody: string;
  roles: { title: string; body: string; human: boolean }[];
  whoTitle: string;
  audiences: { title: string; body: string }[];
  canTitle: string;
  actions: { title: string; body: string; href: string }[];
  journeyEyebrow: string;
  journeyTitle: string;
  journey: string[];
  safetyEyebrow: string;
  safetyTitle: string;
  safetyBody: string;
  trusts: { title: string; body: string }[];
  emergencyTitle: string;
  emergencyBody: string;
  emergencyCta: string;
  topicsEyebrow: string;
  topicsTitle: string;
  topics: { name: string; body: string; icon: string }[];
  ask: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  disclaimer: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    heroTitle: "A safe place to ask, learn, and get support.",
    heroBody: "Inshuti helps young people in Rwanda find trusted health information, understand their options, and connect with an approved nurse, midwife, psychologist, doctor, or community health worker.",
    talk: "Talk to Inshuti",
    find: "Find support",
    heroNote: "Private to start. A person steps in when you ask for one.",
    howEyebrow: "How Inshuti helps",
    howTitle: "From a question to the right kind of support.",
    steps: [
      { n: "01", title: "Ask", body: "Have a question or a worry? Talk privately and get information drawn from reviewed health resources." },
      { n: "02", title: "Understand", body: "Read clear explanations on menstrual health, pregnancy, relationships, family planning, HIV and STIs, and mental health." },
      { n: "03", title: "Connect", body: "When you want a person, Inshuti can match you with an approved professional based on the topic and how urgent it is." },
      { n: "04", title: "Continue", body: "Message that professional in private, share a file or voice note, or book a time to follow up." },
    ],
    networkEyebrow: "Your support network",
    networkTitle: "Technology helps you start. People provide care.",
    networkBody: "Inshuti does not replace a health worker. The assistant helps you understand a question and find the right next step. Approved professionals handle the human conversation.",
    roles: [
      { title: "Inshuti assistant", body: "Helps you understand a question and find reviewed information. This is a tool, not a person and not a diagnosis.", human: false },
      { title: "Nurse", body: "Health guidance, including menstrual health and family planning.", human: true },
      { title: "Midwife", body: "Support for pregnancy and reproductive health.", human: true },
      { title: "Psychologist", body: "Support for stress, relationships, and mental health.", human: true },
      { title: "Doctor", body: "Cases that need medical assessment, including higher-risk concerns.", human: true },
      { title: "Community health worker", body: "A local starting point when the question does not need a specialist first.", human: true },
    ],
    whoTitle: "Who Inshuti is for",
    audiences: [
      { title: "Young people", body: "Ask in your own words, without an account if you want to stay anonymous." },
      { title: "Parents and guardians", body: "Learn, book your own appointments, and find care. A young person's private consultation stays private." },
      { title: "Health professionals", body: "Receive approved cases, reply in private, and record appointment outcomes." },
      { title: "Community health workers", body: "Support people whose questions can start close to home." },
    ],
    canTitle: "What you can do",
    actions: [
      { title: "Ask a question", body: "Start a private conversation.", href: "/chat" },
      { title: "Learn", body: "Read reviewed articles and health education resources.", href: "/library" },
      { title: "Find a facility", body: "Search hospitals, health centres, clinics, and pharmacies.", href: "/facility-locator" },
      { title: "Ask for a person", body: "Request follow-up from the conversation when you are signed in.", href: "/chat" },
      { title: "Book a time", body: "Request an appointment with an approved professional.", href: "/appointments" },
      { title: "Continue in private", body: "Message the professional assigned to you.", href: "/consultations" },
    ],
    journeyEyebrow: "A real journey",
    journeyTitle: "From a question to the right support.",
    journey: ["You have a concern", "You talk with Inshuti", "You get information from reviewed resources", "The topic and urgency are assessed", "If you ask, an approved professional is matched", "You continue in a private conversation", "You can book a follow-up"],
    safetyEyebrow: "Safety and privacy",
    safetyTitle: "Your privacy is explained honestly.",
    safetyBody: "You can start without an account. That conversation is stored against a random session on this browser, not against your name. If you sign in and turn anonymous mode off, later conversations can be linked to your account so a professional can reply to you.",
    trusts: [
      { title: "Secure messages", body: "Professional conversations are encrypted on the server and protected while they travel." },
      { title: "Limited staff access", body: "Administrators can see case status and names. They cannot read the consultation messages." },
      { title: "Approved professionals", body: "Only an approved health worker can be assigned a case." },
      { title: "Crisis support", body: "Urgent language can show emergency contacts and can be flagged so someone can check that help was offered." },
      { title: "Reviewed information", body: "Answers can cite articles a reviewer has marked as ready." },
      { title: "Aggregate reporting", body: "Government users see totals for their area. Very small counts are hidden so a person cannot be picked out." },
    ],
    emergencyTitle: "If you are in danger, do not wait for a reply.",
    emergencyBody: "Use the crisis contacts in the app, call local emergency services, or go to the nearest health facility. Inshuti is general information and private follow-up. It is not an emergency service and it does not diagnose or prescribe.",
    emergencyCta: "View crisis resources",
    topicsEyebrow: "Start with a topic",
    topicsTitle: "Wherever you are starting from.",
    topics: [
      { name: "Menstrual health", body: "Cycles, symptoms, and what is usual.", icon: "i-droplet" },
      { name: "Pregnancy", body: "Signs, care, and what to do next.", icon: "i-baby" },
      { name: "Relationships", body: "Consent, boundaries, and communication.", icon: "i-heart" },
      { name: "Family planning", body: "Options explained without pressure.", icon: "i-pill" },
      { name: "HIV and STIs", body: "Prevention, testing, and treatment.", icon: "i-shield" },
      { name: "Mental health", body: "Stress, worry, and where to get support.", icon: "i-mind" },
    ],
    ask: "Ask about this",
    faqTitle: "Questions people ask first",
    faq: [
      { q: "Do I need an account?", a: "No. You can talk without registering. An account is needed to request a named professional, book an appointment, and keep notifications." },
      { q: "Are conversations stored?", a: "Yes. Anonymous chats are stored with a random browser session. Signed-in chats are linked to your account only when anonymous mode is off. You can clear the browser history, and you can deactivate an account." },
      { q: "Is this a diagnosis?", a: "No. Inshuti explains health information. A professional conversation is follow-up, not a hospital record and not a prescription." },
      { q: "Who can read a private consultation?", a: "You and the assigned professional. Parents are not given that thread. Government users see totals, not messages." },
    ],
    disclaimer: "Inshuti provides general health information and private follow-up with approved professionals. It is not a substitute for emergency care, diagnosis, or treatment.",
  },
  RW: {
    heroTitle: "Ahantu hizewe ho kubaza, kwiga, no kubona ubufasha.",
    heroBody: "Inshuti ifasha urubyiruko mu Rwanda kubona amakuru y'ubuzima yizewe, kumva amahitamo yabo, no guhura n'umuforomo, umubyaza, umuganga w'indwara zo mu mutwe, muganga, cyangwa umujyanama w'ubuzima wemewe.",
    talk: "Ganira na Inshuti",
    find: "Shaka ubufasha",
    heroNote: "Utangira mu ibanga. Umuntu ajya ahagaragara iyo umusabye.",
    howEyebrow: "Uko Inshuti ifasha",
    howTitle: "Kuva ku kibazo ukagera ku bufasha bukwiye.",
    steps: [
      { n: "01", title: "Baza", body: "Ufite ikibazo? Ganira mu ibanga ubone amakuru avuye mu nyandiko zarebwe." },
      { n: "02", title: "Sobanukirwa", body: "Soma ibisobanuro ku mihango, gutwita, imibanire, kuboneza urubyaro, virusi ya SIDA n'indwara zandurira mu mibonano, n'ubuzima bwo mu mutwe." },
      { n: "03", title: "Hura n'umuntu", body: "Iyo ushaka umuntu, Inshuti ishobora kukugeza ku mukozi wemewe hashingiwe ku ngingo n'ubukana." },
      { n: "04", title: "Komeza", body: "Vugana na we mu ibanga, ohereze dosiye cyangwa ijwi, cyangwa ufate gahunda." },
    ],
    networkEyebrow: "Urusobe rw'ubufasha",
    networkTitle: "Ikoranabuhanga ritangiza. Abantu ni bo bita ku buzima.",
    networkBody: "Inshuti ntisimbura umukozi w'ubuzima. Umufasha agufasha gusobanukirwa ikibazo no kubona intambwe ikurikira. Abakozi bemewe ni bo baganira nawe.",
    roles: [
      { title: "Umufasha wa Inshuti", body: "Agufasha gusobanukirwa ikibazo no kubona amakuru yarebwe. Ni igikoresho, si umuntu kandi si isuzuma.", human: false },
      { title: "Umuforomo", body: "Inama z'ubuzima, harimo imihango no kuboneza urubyaro.", human: true },
      { title: "Umubyaza", body: "Ubufasha ku nda n'ubuzima bw'imyororokere.", human: true },
      { title: "Umuganga w'indwara zo mu mutwe", body: "Ubufasha ku muhangayiko, imibanire, n'ubuzima bwo mu mutwe.", human: true },
      { title: "Muganga", body: "Ibibazo bikeneye isuzuma ry'ubuvuzi, harimo ibyihutirwa.", human: true },
      { title: "Umujyanama w'ubuzima", body: "Intangiriro iri hafi iyo ikibazo kitakeneye inzobere mbere.", human: true },
    ],
    whoTitle: "Inshuti igenwa nde",
    audiences: [
      { title: "Urubyiruko", body: "Baza mu magambo yawe, nta konti niba ushaka kuguma utazwi." },
      { title: "Ababyeyi n'abarezi", body: "Iga, fata gahunda zawe, ushake ubuvuzi. Ikiganiro cy'ibanga cy'umwana ntikiboneka." },
      { title: "Abakozi b'ubuzima", body: "Akira dosiye zemewe, usubize mu ibanga, wandike umusaruro wa gahunda." },
      { title: "Abajyanama b'ubuzima", body: "Fasha abantu ibibazo byabo bishobora gutangirira hafi." },
    ],
    canTitle: "Ibyo ushobora gukora",
    actions: [
      { title: "Baza ikibazo", body: "Tangira ikiganiro cy'ibanga.", href: "/chat" },
      { title: "Iga", body: "Soma inyandiko zarebwe.", href: "/library" },
      { title: "Shaka ivuriro", body: "Shakisha ibitaro, ibigo nderabuzima, amavuriro, n'amafarmasi.", href: "/facility-locator" },
      { title: "Saba umuntu", body: "Saba gukurikirana uvuye mu kiganiro iyo winjiye.", href: "/chat" },
      { title: "Fata umwanya", body: "Saba gahunda n'umukozi wemewe.", href: "/appointments" },
      { title: "Komeza mu ibanga", body: "Andikira umukozi wahawe.", href: "/consultations" },
    ],
    journeyEyebrow: "Urugendo rw'ukuri",
    journeyTitle: "Kuva ku kibazo ukagera ku bufasha bukwiye.",
    journey: ["Ufite impungenge", "Uganira na Inshuti", "Ubona amakuru yarebwe", "Ingingo n'ubukana bisuzumwa", "Niba usabye, uhuzwa n'umukozi wemewe", "Ukomeza mu kiganiro cy'ibanga", "Ushobora gufata gahunda"],
    safetyEyebrow: "Umutekano n'ibanga",
    safetyTitle: "Ibanga ryawe risobanurwa ukuri.",
    safetyBody: "Ushobora gutangira utagira konti. Icyo kiganiro kibikwa ku sesiyo idasanzwe ya iyi mushakisha, si ku izina ryawe. Niba winjiye ukaba ufunze uburyo butazwi, ibiganiro bikurikira bishobora guhuzwa na konti yawe kugira ngo umukozi akusubize.",
    trusts: [
      { title: "Ubutumwa burinzwe", body: "Ibiganiro by'abakozi birakingwa kuri seriveri no mu nzira." },
      { title: "Abakozi babona bike", body: "Abayobozi babona imiterere n'amazina. Ntibabona ubutumwa bw'ikiganiro." },
      { title: "Abakozi bemewe", body: "Umukozi wemewe gusa ni we washobora guhabwa dosiye." },
      { title: "Ubufasha mu bihe bikomeye", body: "Amagambo y'ibyago ashobora kwerekana nimero z'ubutabazi no gushyirwa ku rutonde kugira ngo hagenzurwe niba ubufasha bwatanzwe." },
      { title: "Amakuru yarebwe", body: "Ibisubizo bishobora kwerekana inyandiko umusuzuma yashyizeho ko ziteguye." },
      { title: "Imibare rusange", body: "Abakozi ba leta babona imibare y'akarere kabo. Imibare mito ihishwa kugira ngo umuntu atamenyekane." },
    ],
    emergencyTitle: "Niba uri mu kaga, ntutegereze igisubizo.",
    emergencyBody: "Koresha nimero z'ubutabazi, hamagara serivisi z'ibiza, cyangwa ujye ku kigo cy'ubuzima kiri hafi. Inshuti itanga amakuru rusange n'ubufasha bw'ibanga. Si serivisi y'ibiza kandi ntisuzuma cyangwa itanga imiti.",
    emergencyCta: "Reba ubufasha bwihutirwa",
    topicsEyebrow: "Tangira ku ngingo",
    topicsTitle: "Uvuye aho uri hose.",
    topics: [
      { name: "Ubuzima bw'imihango", body: "Imihango n'ibisanzwe.", icon: "i-droplet" },
      { name: "Gutwita", body: "Ibimenyetso n'ubuvuzi.", icon: "i-baby" },
      { name: "Imibanire", body: "Kwemera n'imbibi.", icon: "i-heart" },
      { name: "Kuboneza urubyaro", body: "Amahitamo asobanuwe nta gushyigikirizwa.", icon: "i-pill" },
      { name: "SIDA n'indwara zandurira", body: "Kwirinda, gupima, no kuvura.", icon: "i-shield" },
      { name: "Ubuzima bwo mu mutwe", body: "Umuhangayiko n'aho ushobora kubona ubufasha.", icon: "i-mind" },
    ],
    ask: "Baza kuri iki",
    faqTitle: "Ibibazo bakunze kubaza",
    faq: [
      { q: "Ese nkeneye konti?", a: "Oya. Ushobora kuganira utiyandikishije. Konti ikenewe kugira ngo usabe umukozi, ufate gahunda, kandi ubone amamenyesha." },
      { q: "Ese ibiganiro bibikwa?", a: "Yego. Ibiganiro bitazwi bibikwa ku sesiyo ya mushakisha. Ibiganiro by'uwinjira bihuzwa na konti iyo uburyo butazwi bufunze. Ushobora gusiba amateka no gufunga konti." },
      { q: "Ese iri isuzuma?", a: "Oya. Inshuti isobanura amakuru y'ubuzima. Ikiganiro n'umukozi si dosiye y'ibitaro kandi si itegeko ry'imiti." },
      { q: "Ninde ushobora gusoma ikiganiro cy'ibanga?", a: "Wowe n'umukozi wahawe. Ababyeyi ntibabona ubwo butumwa. Abakozi ba leta babona imibare, si ubutumwa." },
    ],
    disclaimer: "Inshuti itanga amakuru rusange y'ubuzima n'ubufasha bw'ibanga bw'abakozi bemewe. Ntisimbura ubuvuzi bwihutirwa, isuzuma, cyangwa imiti.",
  },
  FR: {
    heroTitle: "Un endroit sûr pour demander, apprendre et être accompagné.",
    heroBody: "Inshuti aide les jeunes au Rwanda à trouver une information de santé fiable, à comprendre leurs options, et à rencontrer un infirmier, une sage-femme, un psychologue, un médecin ou un agent de santé communautaire approuvé.",
    talk: "Parler à Inshuti",
    find: "Trouver du soutien",
    heroNote: "Vous commencez en privé. Une personne intervient quand vous le demandez.",
    howEyebrow: "Comment Inshuti aide",
    howTitle: "D'une question au bon soutien.",
    steps: [
      { n: "01", title: "Demander", body: "Une question ou une inquiétude ? Échangez en privé et recevez une information issue de ressources relues." },
      { n: "02", title: "Comprendre", body: "Lisez des explications sur les règles, la grossesse, les relations, la contraception, le VIH et les IST, et la santé mentale." },
      { n: "03", title: "Rencontrer", body: "Quand vous voulez une personne, Inshuti peut vous orienter vers un professionnel approuvé selon le sujet et l'urgence." },
      { n: "04", title: "Continuer", body: "Écrivez à ce professionnel en privé, envoyez un fichier ou une note vocale, ou prenez un rendez-vous." },
    ],
    networkEyebrow: "Votre réseau de soutien",
    networkTitle: "La technologie vous aide à commencer. Les personnes soignent.",
    networkBody: "Inshuti ne remplace pas un professionnel de santé. L'assistant aide à comprendre une question et à trouver la prochaine étape. Les professionnels approuvés mènent l'échange humain.",
    roles: [
      { title: "Assistant Inshuti", body: "Aide à comprendre une question et à trouver une information relue. C'est un outil, pas une personne et pas un diagnostic.", human: false },
      { title: "Infirmier ou infirmière", body: "Conseils de santé, y compris règles et planification familiale.", human: true },
      { title: "Sage-femme", body: "Soutien pour la grossesse et la santé reproductive.", human: true },
      { title: "Psychologue", body: "Soutien pour le stress, les relations et la santé mentale.", human: true },
      { title: "Médecin", body: "Situations qui demandent une évaluation médicale, y compris les risques plus élevés.", human: true },
      { title: "Agent de santé communautaire", body: "Un premier contact local quand la question n'exige pas d'abord un spécialiste.", human: true },
    ],
    whoTitle: "À qui s'adresse Inshuti",
    audiences: [
      { title: "Jeunes", body: "Posez la question avec vos mots, sans compte si vous voulez rester anonyme." },
      { title: "Parents et tuteurs", body: "Apprenez, prenez vos propres rendez-vous, trouvez des soins. La consultation privée d'un jeune reste privée." },
      { title: "Professionnels de santé", body: "Recevez des dossiers approuvés, répondez en privé, notez le résultat d'un rendez-vous." },
      { title: "Agents de santé communautaire", body: "Accompagnez les questions qui peuvent commencer près de chez soi." },
    ],
    canTitle: "Ce que vous pouvez faire",
    actions: [
      { title: "Poser une question", body: "Commencer une conversation privée.", href: "/chat" },
      { title: "Apprendre", body: "Lire des articles relus.", href: "/library" },
      { title: "Trouver un établissement", body: "Chercher hôpitaux, centres, cliniques et pharmacies.", href: "/facility-locator" },
      { title: "Demander une personne", body: "Demander un suivi depuis la conversation une fois connecté.", href: "/chat" },
      { title: "Prendre un rendez-vous", body: "Demander un créneau avec un professionnel approuvé.", href: "/appointments" },
      { title: "Continuer en privé", body: "Écrire au professionnel qui vous est attribué.", href: "/consultations" },
    ],
    journeyEyebrow: "Un parcours réel",
    journeyTitle: "D'une question au bon soutien.",
    journey: ["Vous avez une inquiétude", "Vous parlez avec Inshuti", "Vous recevez une information relue", "Le sujet et l'urgence sont évalués", "Si vous le demandez, un professionnel approuvé est proposé", "Vous continuez en privé", "Vous pouvez prendre un suivi"],
    safetyEyebrow: "Sécurité et vie privée",
    safetyTitle: "Votre vie privée est expliquée honnêtement.",
    safetyBody: "Vous pouvez commencer sans compte. Cette conversation est conservée avec une session aléatoire de ce navigateur, pas avec votre nom. Si vous vous connectez et désactivez le mode anonyme, les conversations suivantes peuvent être liées à votre compte pour qu'un professionnel puisse vous répondre.",
    trusts: [
      { title: "Messages protégés", body: "Les échanges avec un professionnel sont chiffrés sur le serveur et pendant le transport." },
      { title: "Accès limité du personnel", body: "Les administrateurs voient le statut et les noms. Ils ne lisent pas les messages." },
      { title: "Professionnels approuvés", body: "Seul un professionnel approuvé peut recevoir un dossier." },
      { title: "Soutien en crise", body: "Un langage urgent peut afficher des contacts d'urgence et être signalé pour vérifier que l'aide a été proposée." },
      { title: "Information relue", body: "Les réponses peuvent citer des articles qu'un relecteur a validés." },
      { title: "Rapports agrégés", body: "Les utilisateurs gouvernementaux voient des totaux. Les tout petits nombres sont masqués." },
    ],
    emergencyTitle: "En cas de danger, n'attendez pas une réponse.",
    emergencyBody: "Utilisez les contacts de crise, appelez les urgences locales, ou allez à l'établissement le plus proche. Inshuti donne une information générale et un suivi privé. Ce n'est pas un service d'urgence et ce n'est pas un diagnostic.",
    emergencyCta: "Voir les ressources d'urgence",
    topicsEyebrow: "Commencer par un sujet",
    topicsTitle: "D'où que vous partiez.",
    topics: [
      { name: "Santé menstruelle", body: "Cycles et ce qui est habituel.", icon: "i-droplet" },
      { name: "Grossesse", body: "Signes et soins.", icon: "i-baby" },
      { name: "Relations", body: "Consentement et limites.", icon: "i-heart" },
      { name: "Planification familiale", body: "Des options expliquées sans pression.", icon: "i-pill" },
      { name: "VIH et IST", body: "Prévention, dépistage et traitement.", icon: "i-shield" },
      { name: "Santé mentale", body: "Stress et où trouver du soutien.", icon: "i-mind" },
    ],
    ask: "Demander à ce sujet",
    faqTitle: "Les premières questions",
    faq: [
      { q: "Faut-il un compte ?", a: "Non. Vous pouvez parler sans vous inscrire. Un compte sert à demander un professionnel, prendre rendez-vous et recevoir des notifications." },
      { q: "Les conversations sont-elles conservées ?", a: "Oui. Les échanges anonymes sont liés à une session aléatoire du navigateur. Les échanges connectés sont liés au compte seulement si le mode anonyme est désactivé." },
      { q: "Est-ce un diagnostic ?", a: "Non. Inshuti explique une information de santé. L'échange avec un professionnel n'est pas un dossier hospitalier ni une ordonnance." },
      { q: "Qui peut lire une consultation privée ?", a: "Vous et le professionnel attribué. Les parents ne reçoivent pas ce fil. Les utilisateurs gouvernementaux voient des totaux, pas les messages." },
    ],
    disclaimer: "Inshuti fournit une information générale et un suivi privé avec des professionnels approuvés. Ce n'est pas un substitut aux urgences, au diagnostic ou au traitement.",
  },
  SW: {
    heroTitle: "Mahali salama pa kuuliza, kujifunza, na kupata msaada.",
    heroBody: "Inshuti huwasaidia vijana nchini Rwanda kupata taarifa za afya zinazoaminika, kuelewa chaguo zao, na kuunganishwa na muuguzi, mkunga, mwanasaikolojia, daktari, au mhudumu wa afya ya jamii aliyethibitishwa.",
    talk: "Ongea na Inshuti",
    find: "Tafuta msaada",
    heroNote: "Unaanza kwa faragha. Mtu anaingia unapoomba.",
    howEyebrow: "Jinsi Inshuti inavyosaidia",
    howTitle: "Kutoka swali hadi msaada unaofaa.",
    steps: [
      { n: "01", title: "Uliza", body: "Una swali? Ongea kwa faragha upate taarifa kutoka kwenye nyenzo zilizopitiwa." },
      { n: "02", title: "Elewa", body: "Soma maelezo kuhusu hedhi, ujauzito, mahusiano, uzazi wa mpango, VVU na magonjwa ya zinaa, na afya ya akili." },
      { n: "03", title: "Ungana", body: "Unapotaka mtu, Inshuti inaweza kukuunganisha na mtaalamu aliyethibitishwa kulingana na mada na udharura." },
      { n: "04", title: "Endelea", body: "Mwandikie mtaalamu huyo kwa faragha, tuma faili au sauti, au weka miadi." },
    ],
    networkEyebrow: "Mtandao wako wa msaada",
    networkTitle: "Teknolojia inakusaidia kuanza. Watu ndio wanatoa huduma.",
    networkBody: "Inshuti haibadilishi mhudumu wa afya. Msaidizi husaidia kuelewa swali na kupata hatua inayofuata. Wataalamu waliothibitishwa ndio wanaongoza mazungumzo ya kibinadamu.",
    roles: [
      { title: "Msaidizi wa Inshuti", body: "Husaidia kuelewa swali na kupata taarifa zilizopitiwa. Ni zana, si mtu na si utambuzi.", human: false },
      { title: "Muuguzi", body: "Mwongozo wa afya, pamoja na hedhi na uzazi wa mpango.", human: true },
      { title: "Mkunga", body: "Msaada wa ujauzito na afya ya uzazi.", human: true },
      { title: "Mwanasaikolojia", body: "Msaada wa mfadhaiko, mahusiano, na afya ya akili.", human: true },
      { title: "Daktari", body: "Kesi zinazohitaji tathmini ya kitabibu, pamoja na hatari kubwa.", human: true },
      { title: "Mhudumu wa afya ya jamii", body: "Mahali pa kuanzia karibu wakati swali halihitaji mtaalamu kwanza.", human: true },
    ],
    whoTitle: "Inshuti ni kwa nani",
    audiences: [
      { title: "Vijana", body: "Uliza kwa maneno yako, bila akaunti ukitaka kubaki bila kujulikana." },
      { title: "Wazazi na walezi", body: "Jifunze, weka miadi yako, tafuta huduma. Mazungumzo ya faragha ya kijana hubaki ya faragha." },
      { title: "Wataalamu wa afya", body: "Pokea kesi zilizoidhinishwa, jibu kwa faragha, andika matokeo ya miadi." },
      { title: "Wahudumu wa jamii", body: "Saidia maswali yanayoweza kuanza karibu na nyumbani." },
    ],
    canTitle: "Unachoweza kufanya",
    actions: [
      { title: "Uliza swali", body: "Anza mazungumzo ya faragha.", href: "/chat" },
      { title: "Jifunze", body: "Soma makala yaliyopitiwa.", href: "/library" },
      { title: "Tafuta kituo", body: "Tafuta hospitali, vituo, kliniki, na maduka ya dawa.", href: "/facility-locator" },
      { title: "Omba mtu", body: "Omba ufuatiliaji kutoka kwenye mazungumzo ukiwa umeingia.", href: "/chat" },
      { title: "Weka muda", body: "Omba miadi na mtaalamu aliyethibitishwa.", href: "/appointments" },
      { title: "Endelea kwa faragha", body: "Mwandikie mtaalamu uliyepangiwa.", href: "/consultations" },
    ],
    journeyEyebrow: "Safari halisi",
    journeyTitle: "Kutoka swali hadi msaada unaofaa.",
    journey: ["Una wasiwasi", "Unaongea na Inshuti", "Unapata taarifa zilizopitiwa", "Mada na udharura vinapimwa", "Ukiomba, unaunganishwa na mtaalamu aliyethibitishwa", "Unaendelea kwa faragha", "Unaweza kuweka ufuatiliaji"],
    safetyEyebrow: "Usalama na faragha",
    safetyTitle: "Faragha yako inaelezwa kwa uaminifu.",
    safetyBody: "Unaweza kuanza bila akaunti. Mazungumzo hayo huhifadhiwa kwenye kipindi cha kivinjari kisicho na jina, si kwenye jina lako. Ukiingia na kuzima hali ya kutokujulikana, mazungumzo yanayofuata yanaweza kuunganishwa na akaunti yako ili mtaalamu akujibu.",
    trusts: [
      { title: "Ujumbe salama", body: "Mazungumzo na mtaalamu husimbwa kwenye seva na wakati wa kusafiri." },
      { title: "Wafanyakazi wanaona kidogo", body: "Wasimamizi wanaona hali na majina. Hawasomi ujumbe." },
      { title: "Wataalamu waliothibitishwa", body: "Mtaalamu aliyethibitishwa pekee ndiye anayeweza kupangiwa kesi." },
      { title: "Msaada wa dharura", body: "Lugha ya hatari inaweza kuonyesha anwani za dharura na kuripotiwa ili kuhakikisha msaada ulitolewa." },
      { title: "Taarifa zilizopitiwa", body: "Majibu yanaweza kunukuu makala ambayo mkaguzi ameidhinisha." },
      { title: "Ripoti za jumla", body: "Watumiaji wa serikali wanaona jumla. Hesabu ndogo sana hufichwa." },
    ],
    emergencyTitle: "Ukiwa hatarini, usisubiri jibu.",
    emergencyBody: "Tumia anwani za dharura, piga simu za dharura za eneo, au nenda kituo cha karibu. Inshuti inatoa taarifa za jumla na ufuatiliaji wa faragha. Si huduma ya dharura na haitambui wala haiandiki dawa.",
    emergencyCta: "Ona msaada wa dharura",
    topicsEyebrow: "Anza na mada",
    topicsTitle: "Popote unapoanzia.",
    topics: [
      { name: "Afya ya hedhi", body: "Mzunguko na kilicho cha kawaida.", icon: "i-droplet" },
      { name: "Ujauzito", body: "Dalili na huduma.", icon: "i-baby" },
      { name: "Mahusiano", body: "Ridhaa na mipaka.", icon: "i-heart" },
      { name: "Uzazi wa mpango", body: "Chaguo zilizoelezwa bila shinikizo.", icon: "i-pill" },
      { name: "VVU na magonjwa ya zinaa", body: "Kinga, kupima, na matibabu.", icon: "i-shield" },
      { name: "Afya ya akili", body: "Mfadhaiko na wapi pa kupata msaada.", icon: "i-mind" },
    ],
    ask: "Uliza kuhusu hili",
    faqTitle: "Maswali ya kwanza",
    faq: [
      { q: "Je, nahitaji akaunti?", a: "Hapana. Unaweza kuongea bila kujisajili. Akaunti inahitajika kuomba mtaalamu, kuweka miadi, na kupokea arifa." },
      { q: "Je, mazungumzo yanahifadhiwa?", a: "Ndiyo. Mazungumzo yasiyojulikana huhifadhiwa kwenye kipindi cha kivinjari. Mazungumzo ya akaunti huunganishwa tu hali ya kutokujulikana ikiwa imezimwa." },
      { q: "Je, huu ni utambuzi?", a: "Hapana. Inshuti inaeleza taarifa za afya. Mazungumzo na mtaalamu si rekodi ya hospitali wala dawa." },
      { q: "Nani anaweza kusoma mashauriano ya faragha?", a: "Wewe na mtaalamu uliyepangiwa. Wazazi hawapati ujumbe huo. Watumiaji wa serikali wanaona jumla, si ujumbe." },
    ],
    disclaimer: "Inshuti inatoa taarifa za jumla za afya na ufuatiliaji wa faragha na wataalamu waliothibitishwa. Si mbadala wa huduma ya dharura, utambuzi, au matibabu.",
  },
};

function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-semibold text-teal-900"
            >
              {item.q}
              <span aria-hidden className="text-ink-soft">{expanded ? "–" : "+"}</span>
            </button>
            {expanded && <p className="max-w-[68ch] pb-5 text-[15px] leading-7 text-ink-soft">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const t = COPY[language];

  return (
    <PageLayout activeHref="/" navItems={publicNav(language)} footerDisclaimer={t.disclaimer} contained={false}>
      <section className="border-b border-line bg-[#F7F3EA]">
        <div className="mx-auto grid max-w-[1160px] items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
          <figure className="order-first overflow-hidden rounded-[28px] bg-teal-100 shadow-soft lg:order-last">
            <img src="/brand/hero-support.png" alt="A young woman sitting outdoors and reading a message on her phone" className="aspect-[4/3] h-full w-full object-cover" />
          </figure>
          <div className="order-last lg:order-first">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-coral-dark">Inshuti</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-[40px] leading-[1.08] text-teal-900 sm:text-[56px]">{t.heroTitle}</h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-8 text-ink-soft">{t.heroBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/chat" className="inline-flex min-h-12 items-center justify-center rounded-full bg-coral px-6 text-[15px] font-semibold text-white hover:bg-coral-dark">{t.talk}</Link>
              <Link href="/facility-locator" className="inline-flex min-h-12 items-center justify-center rounded-full border border-teal-700 px-6 text-[15px] font-semibold text-teal-700 hover:bg-teal-100">{t.find}</Link>
            </div>
            <p className="mt-5 text-[14px] text-ink-soft">{t.heroNote}</p>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-coral-dark">{t.howEyebrow}</p>
        <h2 className="mt-3 max-w-[16ch] font-display text-[34px] leading-tight text-teal-900 sm:text-[42px]">{t.howTitle}</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {t.steps.map((step) => (
            <li key={step.n} className="border-t-2 border-teal-700 pt-4">
              <span className="font-mono text-[12px] text-coral-dark">{step.n}</span>
              <h3 className="mt-2 text-[20px] font-semibold text-teal-900">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1160px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <figure className="overflow-hidden rounded-[28px]">
            <img src="/brand/care-conversation.png" alt="A nurse talking with a young adult in a health centre" className="aspect-[4/3] w-full object-cover" />
          </figure>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-coral-dark">{t.networkEyebrow}</p>
            <h2 className="mt-3 font-display text-[34px] leading-tight text-teal-900 sm:text-[40px]">{t.networkTitle}</h2>
            <p className="mt-4 text-[16px] leading-7 text-ink-soft">{t.networkBody}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.roles.map((role) => (
                <li key={role.title} className="rounded-2xl border border-line bg-paper p-4">
                  <h3 className="text-[16px] font-semibold text-teal-900">{role.title}</h3>
                  <p className="mt-1 text-[14px] leading-6 text-ink-soft">{role.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="young-people" className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8">
        <h2 className="font-display text-[34px] text-teal-900">{t.whoTitle}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {t.audiences.map((item) => (
              <li key={item.title} className="rounded-2xl bg-white p-5 shadow-card">
                <h3 className="text-[18px] font-semibold text-teal-900">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ul>
          <figure id="parents" className="overflow-hidden rounded-[28px]">
            <img src="/brand/parent-support.png" alt="A parent and a young adult talking together at home" className="h-full min-h-[280px] w-full object-cover" />
          </figure>
        </div>
      </section>

      <section className="bg-[#123F3B] text-white">
        <div className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8">
          <h2 className="font-display text-[34px]">{t.canTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.actions.map((action) => (
              <li key={action.title}>
                <Link href={action.href} className="block h-full rounded-2xl border border-white/15 p-5 transition hover:bg-white/5">
                  <h3 className="text-[18px] font-semibold">{action.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-white/75">{action.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-coral-dark">{t.journeyEyebrow}</p>
        <h2 className="mt-3 font-display text-[34px] text-teal-900">{t.journeyTitle}</h2>
        <ol className="mt-8 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
          {t.journey.map((step, index) => (
            <li key={step} className="min-w-[180px] flex-1 rounded-2xl bg-white p-4 shadow-card lg:min-w-0">
              <span className="font-mono text-[12px] text-coral-dark">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-[14px] font-semibold leading-6 text-teal-900">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="safety" className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <img src="/brand/community-support.png" alt="A community health worker standing outside a health post" className="mb-6 aspect-square w-full max-w-[360px] rounded-[28px] object-cover" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-coral-dark">{t.safetyEyebrow}</p>
            <h2 className="mt-3 font-display text-[34px] leading-tight text-teal-900">{t.safetyTitle}</h2>
            <p className="mt-4 text-[16px] leading-7 text-ink-soft">{t.safetyBody}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {t.trusts.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line p-5">
                <h3 className="text-[16px] font-semibold text-teal-900">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8">
        <div className="rounded-[28px] bg-coral-100 px-6 py-8 sm:px-10">
          <h2 className="font-display text-[30px] text-teal-900">{t.emergencyTitle}</h2>
          <p className="mt-3 max-w-[68ch] text-[16px] leading-7 text-ink-soft">{t.emergencyBody}</p>
          <Link href="/help-resources#crisis" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-coral px-6 text-[15px] font-semibold text-white">{t.emergencyCta}</Link>
        </div>
      </section>

      <section id="topics" className="mx-auto max-w-[1160px] px-5 pb-8 sm:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-coral-dark">{t.topicsEyebrow}</p>
        <h2 className="mt-3 font-display text-[34px] text-teal-900">{t.topicsTitle}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.topics.map((topic) => (
            <li key={topic.icon}>
              <Link href={`/chat?topic=${topic.icon}`} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 hover:border-teal-700">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <svg width="18" height="18"><use href={`#${topic.icon}`} /></svg>
                </span>
                <h3 className="mt-4 text-[18px] font-semibold text-teal-900">{topic.name}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-6 text-ink-soft">{topic.body}</p>
                <span className="mt-4 text-[14px] font-semibold text-coral-dark">{t.ask}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[860px] px-5 py-16 sm:px-8">
        <h2 className="font-display text-[34px] text-teal-900">{t.faqTitle}</h2>
        <div className="mt-6">
          <FaqList items={t.faq} />
        </div>
      </section>
    </PageLayout>
  );
}
