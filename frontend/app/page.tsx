"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import type { Language } from "@/lib/apiClient";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/AnimatedSection";

type Topic = { icon: string; bg: string; fg: string; name: string; body: string };
type Feature = { icon: string; title: string; body: string };
type Agent = { initial: string; gradient: string; name: string; role: string; description: string };
type FaqItem = { question: string; answer: string };

type Copy = {
  hero: { titleLead: string; titleEm: string; body: string; ctaChat: string; ctaBrowse: string };
  agents: { eyebrow: string; title: string; items: Agent[] };
  features: { eyebrow: string; title: string; items: Feature[] };
  topics: { eyebrow: string; title: string; body: string; cta: string; items: Topic[] };
  faq: { eyebrow: string; title: string; items: FaqItem[] };
  footer: { disclaimer: string };
};

const AGENT_INITIALS: Record<Language, string[]> = {
  EN: ["AX", "CR", "LB", "KC", "FG", "CC", "PS", "MR"],
  RW: ["AX", "CR", "LB", "KC", "FG", "CC", "PS", "MR"],
  FR: ["AX", "CR", "LB", "KC", "FG", "CC", "PS", "MR"],
  SW: ["AX", "CR", "LB", "KC", "FG", "CC", "PS", "MR"],
};

const AGENT_GRADIENTS = [
  "from-teal-700 to-teal-600",
  "from-coral to-coral-dark",
  "from-gold to-amber-600",
  "from-teal-600 to-teal-900",
  "from-coral-dark to-red-600",
  "from-teal-700 to-emerald-600",
  "from-amber-600 to-gold",
  "from-teal-900 to-teal-700",
];

const COPY: Record<Language, Copy> = {
  EN: {
    hero: {
      titleLead: "Your AI-powered health system. ",
      titleEm: "Built for young people in Rwanda.",
      body: "Inshuti is an AI system that gives young people honest, judgment-free answers on sexual and reproductive health — reviewed by professionals, available anytime, in 4 languages.",
      ctaChat: "Chat with Inshuti",
      ctaBrowse: "Browse topics",
    },
    agents: {
      eyebrow: "The Inshuti System",
      title: "Your AI team for adolescent health",
      items: [
        { initial: "AX", gradient: AGENT_GRADIENTS[0], name: "Alex", role: "AI Counselor", description: "Answers health questions with empathy and accuracy through anonymous chat." },
        { initial: "CR", gradient: AGENT_GRADIENTS[1], name: "Crystal", role: "Crisis Responder", description: "Detects crisis language instantly and provides immediate safety resources." },
        { initial: "LB", gradient: AGENT_GRADIENTS[2], name: "Lingala", role: "Language Bridge", description: "Speaks English, Kinyarwanda, French, and Kiswahili to reach every young person." },
        { initial: "KC", gradient: AGENT_GRADIENTS[3], name: "Kai", role: "Knowledge Curator", description: "Manages a professional-reviewed knowledge base that grounds every answer in evidence." },
        { initial: "FG", gradient: AGENT_GRADIENTS[4], name: "Fiona", role: "Facility Guide", description: "Helps find nearby health facilities with interactive maps and location data." },
        { initial: "CC", gradient: AGENT_GRADIENTS[5], name: "Claire", role: "Care Coordinator", description: "Manages appointments, consultations, and follow-ups with health professionals." },
        { initial: "PS", gradient: AGENT_GRADIENTS[6], name: "Pascal", role: "Privacy Shield", description: "Ensures anonymous-by-design conversations — no names, no accounts required." },
        { initial: "MR", gradient: AGENT_GRADIENTS[7], name: "Marie", role: "Medical Reviewer", description: "Reviews all content for clinical accuracy and cultural appropriateness." },
      ],
    },
    features: {
      eyebrow: "Everything you need",
      title: "Research, chat, find care — all in one system",
      items: [
        { icon: "i-bot", title: "AI Chat", body: "Ask anything about your health in your own words, any time, in 4 languages." },
        { icon: "i-shield", title: "Crisis Safety", body: "Built-in crisis detection immediately connects you to support when it matters most." },
        { icon: "i-lock", title: "Anonymous by Design", body: "No sign-up, no names, no tracking. Your privacy is the foundation of the system." },
        { icon: "i-book", title: "Evidence-Based KB", body: "Every answer is grounded in content reviewed by healthcare professionals." },
        { icon: "i-map-pin", title: "Facility Locator", body: "Find nearby clinics, hospitals, and health centers with an interactive map." },
        { icon: "i-calendar", title: "Appointments", body: "Book and manage consultations with healthcare professionals seamlessly." },
        { icon: "i-globe", title: "4 Languages", body: "Full support in English, Kinyarwanda, French, and Kiswahili." },
        { icon: "i-users", title: "Role Portals", body: "Tailored dashboards for teens, parents, healthcare pros, and government users." },
      ],
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
    faq: {
      eyebrow: "FAQ",
      title: "Common questions about the system",
      items: [
        { question: "What is Inshuti?", answer: "Inshuti is an AI-powered sexual and reproductive health system for young people in Rwanda. It combines anonymous AI chat, crisis detection, a professional-reviewed knowledge base, health facility locator, and appointment management into one integrated platform." },
        { question: "Do I need to sign up?", answer: "No. Inshuti is anonymous by design. You can start chatting immediately without providing any personal information. No names, no email, no phone number required." },
        { question: "Is my conversation private?", answer: "Absolutely. Inshuti does not store any identifying information. Conversations are anonymous and sessions are not linked to your identity. Your privacy is protected by design." },
        { question: "What languages are supported?", answer: "Inshuti supports four languages: English, Kinyarwanda, French, and Kiswahili. You can switch between languages at any time." },
        { question: "Is the health information reliable?", answer: "Yes. All answers are grounded in a knowledge base that is reviewed by healthcare professionals. Every response is evidence-based and clinically accurate." },
        { question: "Can I talk to a real health professional?", answer: "Yes. Through the consultation and appointment features, you can request follow-up with a healthcare professional for personalized support." },
      ],
    },
    footer: { disclaimer: "Inshuti provides general health information and is not a substitute for professional medical diagnosis or treatment. If you are in crisis or need urgent care, please contact a local health facility or the resources listed in the app." },
  },
  RW: {
    hero: {
      titleLead: "Sisitemu ya ubuzima ikoreshwa na AI. ",
      titleEm: "Yubatswe ku rubyiruko rw'u Rwanda.",
      body: "Inshuti ni sisitemu ya AI iha urubyiruko ibisubizo by'ukuri, bitagira urubanza, ku ngingo z'ubuzima bw'imyororokere — birebwa n'abaganga, biboneka igihe cyose, mu ndimi 4.",
      ctaChat: "Ganira na Inshuti",
      ctaBrowse: "Reba insanganyamatsiko",
    },
    agents: {
      eyebrow: "Sisitemu ya Inshuti",
      title: "Itsinda rya AI ryawe ry'ubuzima bw'urubyiruko",
      items: [
        { initial: "AX", gradient: AGENT_GRADIENTS[0], name: "Alex", role: "Umujyanama wa AI", description: "Asubiza ibibazo by'ubuzima mu mpuhwe kandi neza binyuze mu kiganiro cyihishe." },
        { initial: "CR", gradient: AGENT_GRADIENTS[1], name: "Crystal", role: "Uwitabara mu Bihe Bigoye", description: "Amenya imvugo y'ibibazo ako kanya akanatanga ubufasha bwihutirwa." },
        { initial: "LB", gradient: AGENT_GRADIENTS[2], name: "Lingala", role: "Umuhuza w'Indimi", description: "Avuga Icyongereza, Ikinyarwanda, Igifaransa, n'Igiswahili kugira ngo ageze kuri buri mwana." },
        { initial: "KC", gradient: AGENT_GRADIENTS[3], name: "Kai", role: "Umubitsi w'Ubumenyi", description: "Acunga ububiko bw'ubumenyi burebwe n'abaganga, butanga igisubizo cyose gishingiye ku bimenyetso." },
        { initial: "FG", gradient: AGENT_GRADIENTS[4], name: "Fiona", role: "Uyobora ku Ivuriro", description: "Afasha gushaka ivuriro riri hafi akoresheje amakarita n'ibice by'ibigo." },
        { initial: "CC", gradient: AGENT_GRADIENTS[5], name: "Claire", role: "Uhuza Ubuvuzi", description: "Acunga gahunda, kuganira, no gukurikirana abaganga." },
        { initial: "PS", gradient: AGENT_GRADIENTS[6], name: "Pascal", role: "Umyibutso w'Ibanga", description: "Atecangira ko ibiganiro bibaye ibyihishe — nta mazina, nta konti." },
        { initial: "MR", gradient: AGENT_GRADIENTS[7], name: "Marie", role: "Ureba Ibikubiye mu Buvuzi", description: "Areba ibikubiye byose kugira ngo bibe byiza kandi bihuje n'umuco." },
      ],
    },
    features: {
      eyebrow: "Ibyo ukeneye byose",
      title: "Shakisha, ganira, shaka ubuvuzi — byose muri sisitemu imwe",
      items: [
        { icon: "i-bot", title: "Ikiganiro cya AI", body: "Baza ikibazo icyo aricyo cyose ku buzima bwawe mu magambo yawe, igihe cytose, mu ndimi 4." },
        { icon: "i-shield", title: "Umutekano mu Bihe Bigoye", body: "Gucunga ibibazo byihutirwa biragufasha guhita ubona ubufasha." },
        { icon: "i-lock", title: "Byihishe ku Bushake", body: "Nta kwiyandikisha, nta mazina, nta gukurikirana. Ibanga ryawe nishingiro." },
        { icon: "i-book", title: "Ubumenyi Bushingiye ku Bimenyetso", body: "Igisubizo cyose gishingiye ku bintu byarebwe n'abaganga." },
        { icon: "i-map-pin", title: "Gushaka Ivuriro", body: "Shaka ibitaro, ivuriro, n'ibigo by'ubuzima ufite hafi." },
        { icon: "i-calendar", title: "Gahunda", body: "Fata kandi ugahora gahunda zo kuganira n'abaganga." },
        { icon: "i-globe", title: "Indimi 4", body: "Gufashwa byuzuye mu Cyongereza, Ikinyarwanda, Igifaransa, n'Igiswahili." },
        { icon: "i-users", title: "Inzira z'abakoresha", body: "Ikibaho gikwiye ku rubyiruko, ababyeyi, abaganga, n'abakozi ba leta." },
      ],
    },
    topics: {
      eyebrow: "Insanganyamatsiko zikunzwe",
      title: "Uvuye aho uri hose",
      body: "Ibice bitandatu urubyiruko rukunze kubaza — kandaho kimwe ubone ikiganiro ako kanya.",
      cta: "Baza kuri iki",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Ubuzima bw'Imihango", body: "Imihango, ibimenyetso, ibikoresho, n'ibisanzwe ku mubiri wawe." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Gutwita", body: 'Ibimenyetso, ibihe, kwitabwaho mbere yo kubyara, no gusubiza "ese niba..."' },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Imibanire", body: "Kwemera, itumanaho, imbibi, n'ubufatanye bwiza." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Kuboneza Urubyaro", body: "Uburyo bwo kuboneza urubyaro busobanuwe neza, nta gushyigikirizwa." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "Virusi ya SIDA n'Indwara Zandurira mu Mibonano", body: "Kwirinda, gupimwa, no kuvurwa — nta rubanza." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Ubuzima bwo mu Mutwe", body: "Stress, kwiheba, n'ubufasha ku byiyumvo biri inyuma y'ibibazo." },
      ],
    },
    faq: {
      eyebrow: "Ibibazo",
      title: "Ibibazo bakunze kubaza kuri sisitemu",
      items: [
        { question: "Inshuti ni iki?", answer: "Inshuti ni sisitemu ya AI y'ubuzima bw'imyororokere ku rubyiruko rw'u Rwanda. Ihuza ikiganiro cya AI cyihishe, gucunga ibibazo byihutirwa, ububiko bw'ubumenyi burebwe n'abaganga, gushaka ivuriro, no gucunga gahunda." },
        { question: "Ese nshobora kwiyandikisha?", answer: "Oya. Inshuti yihishe ku bushake. Urashobora gutangira ikiganiro ako kanya utatanze amakuru y'ibanga. Nta mazina, nta email, nta numero ya telefone." },
        { question: "Ese ikiganiro cyanjye kirahishwa?", answer: "Rwose. Inshuti ntabika amakuru y'ibanga. Ibiganiro birahishwa kandi nta shuri rihujwe n'indangamuntu yawe." },
        { question: "Indimi ziterwa inkunga ni izihe?", answer: "Inshuti iterankunga indimi enye: Icyongereza, Ikinyarwanda, Igifaransa, n'Igiswahili. Urashobora guhindura ururimi igihe cyose." },
        { question: "Ese amakuru y'ubuzima yiringiwa?", answer: "Yego. Ibisubizo byose bishingiye ku bubiko bw'ubumenyi burebwe n'abaganga. Buri gisubizo gishingiye ku bimenyetso kandi gikora neza." },
        { question: "Ese nshobora kuvugana n'umukozi w'ubuzima?", answer: "Yego. Binyuze mu gahunda yo kuganira no gufata appointments, urashobora gusaba gukurikirwa n'umukozi w'ubuzima." },
      ],
    },
    footer: { disclaimer: "Inshuti itanga amakuru rusange ku buzima kandi ntisimbura isuzuma cyangwa ubuvuzi bw'abaganga bemewe. Niba uri mu kaga cyangwa ukeneye ubufasha bwihutirwa, hamagara ivuriro riri hafi cyangwa ukoreshe amakuru yatanzwe muri iyi porogaramu." },
  },
  FR: {
    hero: {
      titleLead: "Votre système de santé alimenté par l'IA. ",
      titleEm: "Conçu pour les jeunes au Rwanda.",
      body: "Inshuti est un système IA qui donne aux jeunes des réponses honnêtes et sans jugement sur la santé sexuelle et reproductive — validées par des professionnels, disponibles à tout moment, en 4 langues.",
      ctaChat: "Discuter avec Inshuti",
      ctaBrowse: "Parcourir les sujets",
    },
    agents: {
      eyebrow: "Le Système Inshuti",
      title: "Votre équipe IA pour la santé des adolescents",
      items: [
        { initial: "AX", gradient: AGENT_GRADIENTS[0], name: "Alex", role: "Conseiller IA", description: "Répond aux questions de santé avec empathie et précision via un chat anonyme." },
        { initial: "CR", gradient: AGENT_GRADIENTS[1], name: "Crystal", role: "Intervenant d'Urgence", description: "Détecte instantanément les situations de crise et fournit des ressources de sécurité immédiates." },
        { initial: "LB", gradient: AGENT_GRADIENTS[2], name: "Lingala", role: "Pont Linguistique", description: "Parle anglais, kinyarwanda, français et kiswahili pour atteindre chaque jeune." },
        { initial: "KC", gradient: AGENT_GRADIENTS[3], name: "Kai", role: "Conservateur des Connaissances", description: "Gère une base de connaissances validée par des professionnels pour chaque réponse." },
        { initial: "FG", gradient: AGENT_GRADIENTS[4], name: "Fiona", role: "Guide des Établissements", description: "Aide à trouver des établissements de santé avec des cartes interactives." },
        { initial: "CC", gradient: AGENT_GRADIENTS[5], name: "Claire", role: "Coordinateur de Soins", description: "Gère les rendez-vous, consultations et suivis avec les professionnels de santé." },
        { initial: "PS", gradient: AGENT_GRADIENTS[6], name: "Pascal", role: "Protecteur de la Vie Privée", description: "Garantit des conversations anonymes — aucun nom, aucun compte requis." },
        { initial: "MR", gradient: AGENT_GRADIENTS[7], name: "Marie", role: "Réviseur Médical", description: "Vérifie tout le contenu pour sa précision clinique et sa pertinence culturelle." },
      ],
    },
    features: {
      eyebrow: "Tout ce dont vous avez besoin",
      title: "Recherche, chat, soins — tout dans un seul système",
      items: [
        { icon: "i-bot", title: "Chat IA", body: "Posez toutes vos questions de santé avec vos mots, à tout moment, en 4 langues." },
        { icon: "i-shield", title: "Sécurité de Crise", body: "La détection intégrée des crises vous connecte immédiatement au soutien." },
        { icon: "i-lock", title: "Anonyme par Conception", body: "Pas d'inscription, pas de noms, pas de suivi. Votre vie privée est la base." },
        { icon: "i-book", title: "Base de Preuves", body: "Chaque réponse s'appuie sur un contenu validé par des professionnels de santé." },
        { icon: "i-map-pin", title: "Localisateur", body: "Trouvez des cliniques et hôpitaux à proximité avec une carte interactive." },
        { icon: "i-calendar", title: "Rendez-vous", body: "Réservez et gérez des consultations avec des professionnels de santé." },
        { icon: "i-globe", title: "4 Langues", body: "Support complet en anglais, kinyarwanda, français et kiswahili." },
        { icon: "i-users", title: "Portails de Rôle", body: "Tableaux de bord adaptés aux adolescents, parents, professionnels et gouvernement." },
      ],
    },
    topics: {
      eyebrow: "Sujets populaires",
      title: "Où que vous en soyez",
      body: "Six thèmes les plus demandés par les jeunes — cliquez pour démarrer une conversation.",
      cta: "Poser une question",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Santé Menstruelle", body: "Cycles, symptômes, produits, et ce qui est normal pour votre corps." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Grossesse", body: 'Signes, échéances, soins prénatals, et réponses à vos "et si".' },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Relations", body: "Consentement, communication, limites, et partenariats sains." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Planning Familial", body: "Options de contraception expliquées clairement, sans pression." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "VIH & IST", body: "Prévention, dépistage et traitement — sans jugement." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Santé Mentale", body: "Stress, anxiété, et soutien pour les émotions derrière vos questions." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions courantes sur le système",
      items: [
        { question: "Qu'est-ce qu'Inshuti?", answer: "Inshuti est un système de santé sexuelle et reproductive alimenté par l'IA pour les jeunes au Rwanda. Il combine un chat IA anonyme, la détection de crise, une base de connaissances validée, un localisateur d'établissements et la gestion de rendez-vous." },
        { question: "Dois-je m'inscrire?", answer: "Non. Inshuti est anonyme par conception. Vous pouvez commencer à discuter immédiatement sans fournir d'informations personnelles." },
        { question: "Ma conversation est-elle privée?", answer: "Absolument. Inshuti ne stocke aucune information d'identification. Les conversations sont anonymes et les sessions ne sont pas liées à votre identité." },
        { question: "Quelles langues sont supportées?", answer: "Inshuti supporte quatre langues : anglais, kinyarwanda, français et kiswahili. Vous pouvez changer de langue à tout moment." },
        { question: "Les informations sont-elles fiables?", answer: "Oui. Toutes les réponses sont basées sur une base de connaissances validée par des professionnels de santé. Chaque réponse est fondée sur des preuves." },
        { question: "Puis-je parler à un vrai professionnel?", answer: "Oui. Grâce aux fonctionnalités de consultation et de rendez-vous, vous pouvez demander un suivi avec un professionnel de santé." },
      ],
    },
    footer: { disclaimer: "Inshuti fournit des informations générales sur la santé et ne remplace pas un diagnostic ou un traitement médical professionnel. En cas de crise ou de besoin de soins urgents, contactez un établissement de santé local ou les ressources listées dans l'application." },
  },
  SW: {
    hero: {
      titleLead: "Mfumo wako wa afya unaoendeshwa na AI. ",
      titleEm: "Imejengwa kwa ajili ya vijana nchini Rwanda.",
      body: "Inshuti ni mfumo wa AI unaowapa vijana majibu ya kweli, yasiyo na hukumu kuhusu afya ya uzazi na ngono — yaliyopitiwa na wataalamu, yanapatikana wakati wowote, kwa lugha 4.",
      ctaChat: "Ongea na Inshuti",
      ctaBrowse: "Vinjari mada",
    },
    agents: {
      eyebrow: "Mfumo wa Inshuti",
      title: "Timu yako ya AI kwa afya ya vijana",
      items: [
        { initial: "AX", gradient: AGENT_GRADIENTS[0], name: "Alex", role: "Mshauri wa AI", description: "Anajibu maswali ya afya kwa huruma na usahihi kupitia mazungumzo ya siri." },
        { initial: "CR", gradient: AGENT_GRADIENTS[1], name: "Crystal", role: "Mwitikiaji wa Dharura", description: "Anatambua lugha ya mgogoro mara moja na kutoa rasilimali za usalama." },
        { initial: "LB", gradient: AGENT_GRADIENTS[2], name: "Lingala", role: "Daraja la Lugha", description: "Anazungumza Kiingereza, Kinyarwanda, Kifaransa, na Kiswahili kufikia kila kijana." },
        { initial: "KC", gradient: AGENT_GRADIENTS[3], name: "Kai", role: "Mhifadhi wa Maarifa", description: "Anasimamia hazina ya maarifa iliyopitiwa na wataalamu kwa kila jibu." },
        { initial: "FG", gradient: AGENT_GRADIENTS[4], name: "Fiona", role: "Mwongozo wa Kituo", description: "Husaidia kutafuta vituo vya afya vilivyo karibu kwa ramani." },
        { initial: "CC", gradient: AGENT_GRADIENTS[5], name: "Claire", role: "Mratibu wa Huduma", description: "Anasimamia miadi, mashauriano, na ufuatiliaji na wataalamu wa afya." },
        { initial: "PS", gradient: AGENT_GRADIENTS[6], name: "Pascal", role: "Ngao ya Faragha", description: "Anahakikisha mazungumzo yako ni siri — hakuna majina, hakuna akaunti." },
        { initial: "MR", gradient: AGENT_GRADIENTS[7], name: "Marie", role: "Mkaguzi wa Matibabu", description: "Anakagua maudhui yote kwa usahihi wa kimatibabu na utamaduni." },
      ],
    },
    features: {
      eyebrow: "Kila kitu unachohitaji",
      title: "Tafiti, ongea, tafuta huduma — yote katika mfumo mmoja",
      items: [
        { icon: "i-bot", title: "Mazungumzo ya AI", body: "Uliza chochote kuhusu afya yako kwa maneno yako mwenyewe, wakati wowote, kwa lugha 4." },
        { icon: "i-shield", title: "Usalama wa Dharura", body: "Utambuzi wa mgogoro uliojengwa ndani hukuunganisha na msaada wakati muhimu." },
        { icon: "i-lock", title: "Siri kwa Muundo", body: "Hakuna usajili, hakuna majina, hakuna ufuatiliaji. Faragha yako ndio msingi." },
        { icon: "i-book", title: "Hazina ya Maarifa", body: "Kila jibu linategemea maudhui yaliyopitiwa na wataalamu wa afya." },
        { icon: "i-map-pin", title: "Kipata Kituo", body: "Tafuta kliniki, hospitali, na vituo vya afya vilivyo karibu kwa ramani." },
        { icon: "i-calendar", title: "Miadi", body: "Panga na usimamie mashauriano na wataalamu wa afya kwa urahisi." },
        { icon: "i-globe", title: "Lugha 4", body: "Msaada kamili kwa Kiingereza, Kinyarwanda, Kifaransa, na Kiswahili." },
        { icon: "i-users", title: "Milango ya Wajibu", body: "Dashibodi maalum kwa vijana, wazazi, wataalamu, na serikali." },
      ],
    },
    topics: {
      eyebrow: "Mada Maarufu",
      title: "Popote unapoanzia",
      body: "Maeneo sita ambayo vijana huuliza zaidi — gusa moja kuanza mazungumzo moja kwa moja.",
      cta: "Uliza kuhusu hili",
      items: [
        { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Afya ya Hedhi", body: "Mzunguko, dalili, bidhaa, na kilicho cha kawaida kwa mwili wako." },
        { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Ujauzito", body: 'Dalili, ratiba, huduma kabla ya kujifungua, na majibu ya "vipi kama".' },
        { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Mahusiano", body: "Idhini, mawasiliano, mipaka, na ushirikiano wenye afya." },
        { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Uzazi wa Mpango", body: "Njia za uzazi wa mpango zilizoelezwa kwa uwazi, bila shinikizo." },
        { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "VVU na Magonjwa ya Zinaa", body: "Kinga, kupima, na matibabu — bila hukumu." },
        { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Afya ya Akili", body: "Msongo, wasiwasi, na msaada kwa hisia nyuma ya maswali yako." },
      ],
    },
    faq: {
      eyebrow: "Maswali",
      title: "Maswali ya kawaida kuhusu mfumo",
      items: [
        { question: "Inshuti ni nini?", answer: "Inshuti ni mfumo wa afya ya uzazi na ngono unaoendeshwa na AI kwa vijana nchini Rwanda. Unachanganya mazungumzo ya AI ya siri, utambuzi wa mgogoro, hazina ya maarifa iliyopitiwa, kipata kituo cha afya, na usimamizi wa miadi." },
        { question: "Je, ninahitaji kujiandikisha?", answer: "Hapana. Inshuti ni siri kwa muundo. Unaweza kuanza mazungumzo mara moja bila kutoa taarifa zozote za kibinafsi." },
        { question: "Je, mazungumzo yangu ni ya faragha?", answer: "Kabisa. Inshuti haihifadhi taarifa zinazotambulika. Mazungumzo ni siri na hayajaunganishwa na utambulisho wako." },
        { question: "Lugha gani zinatumika?", answer: "Inshuti inasaidia lugha nne: Kiingereza, Kinyarwanda, Kifaransa, na Kiswahili. Unaweza kubadilisha lugha wakati wowote." },
        { question: "Je, taarifa za afya ni za kuaminika?", answer: "Ndiyo. Majibu yote yanategemea hazina ya maarifa iliyopitiwa na wataalamu wa afya. Kila jibu linategemea ushahidi." },
        { question: "Je, ninaweza kuzungumza na mtaalamu halisi?", answer: "Ndiyo. Kupitia vipengele vya mashauriano na miadi, unaweza kuomba ufuatiliaji na mtaalamu wa afya." },
      ],
    },
    footer: { disclaimer: "Inshuti inatoa taarifa za jumla za afya na si mbadala wa uchunguzi au matibabu ya kitaalamu. Ikiwa uko katika hali ya dharura au unahitaji huduma ya haraka, wasiliana na kituo cha afya cha karibu au rasilimali zilizoorodheshwa kwenye programu." },
  },
};

function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[720px]">
      {items.map((item, i) => (
        <div key={i} className="border-b border-line last:border-b-0">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15.5px] font-bold text-teal-900 transition hover:text-teal-700"
          >
            <span>{item.question}</span>
            <svg
              width="18"
              height="18"
              className={`shrink-0 text-ink-soft transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
            >
              <use href="#i-chevron-down" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === i ? "max-h-96 pb-5" : "max-h-0"
            }`}
          >
            <p className="text-[14px] leading-[1.7] text-ink-soft">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const t = COPY[language];
  const initials = AGENT_INITIALS[language];

  return (
    <PageLayout
      activeHref="/"
      navItems={[
        { href: "/chat", label: language === "EN" ? "Chat" : language === "RW" ? "Ganira" : language === "FR" ? "Discuter" : "Ongea" },
        { href: "/about", label: language === "EN" ? "About" : language === "RW" ? "Ibyerekeye" : language === "FR" ? "À propos" : "Kuhusu" },
        { href: "/services", label: language === "EN" ? "Services" : language === "RW" ? "Serivisi" : language === "FR" ? "Services" : "Huduma" },
        { href: "/library", label: language === "EN" ? "Library" : language === "RW" ? "Ububiko" : language === "FR" ? "Bibliothèque" : "Maktaba" },
      ]}
      footerDisclaimer={t.footer.disclaimer}
    >
      {/* Hero */}
      <FadeUp>
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[880px] text-center">
            <motion.h1
              className="font-display text-[44px] font-bold leading-[1.08] text-teal-900 md:text-[60px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {t.hero.titleLead}
              <em className="not-italic text-coral">{t.hero.titleEm}</em>
            </motion.h1>
            <motion.p
              className="mx-auto mt-5 max-w-[580px] text-[17px] leading-[1.65] text-ink-soft md:text-[18.5px]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            >
              {t.hero.body}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-[14px]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-[28px] py-[14px] text-[15.5px] font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark hover:shadow-lg"
              >
                {t.hero.ctaChat}
                <svg width="16" height="16">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              <a
                href="#topics"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-teal-700 px-[28px] py-[14px] text-[15.5px] font-semibold text-teal-700 transition-all duration-150 hover:-translate-y-px hover:bg-teal-100"
              >
                {t.hero.ctaBrowse}
              </a>
            </motion.div>

            {/* Agent avatars row */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-5"
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            >
              {t.agents.items.map((agent, i) => (
                <motion.div
                  key={agent.role}
                  className="flex flex-col items-center gap-2"
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div
                    className={`flex h-[56px] w-[56px] items-center justify-center rounded-full bg-gradient-to-br ${agent.gradient} text-[18px] font-bold text-white shadow-md transition-transform duration-200 hover:scale-110`}
                  >
                    {initials[i]}
                  </div>
                  <span className="text-[12px] font-semibold text-teal-900">{agent.name}</span>
                  <span className="text-[10.5px] text-ink-soft">{agent.role}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </FadeUp>

      {/* The Inshuti System */}
      <FadeUp>
        <section className="py-16">
          <div className="mx-auto mb-12 max-w-[600px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.agents.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[36px] text-teal-900">{t.agents.title}</h2>
          </div>
          <StaggerGrid className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {t.agents.items.map((agent, i) => (
              <StaggerItem key={agent.role}>
                <div className="card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gradient-to-br ${agent.gradient} text-[16px] font-bold text-white shadow-sm`}
                  >
                    {initials[i]}
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold text-teal-900">{agent.name}</h3>
                  <p className="text-[12.5px] font-semibold text-coral-dark">{agent.role}</p>
                  <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft">{agent.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </FadeUp>

      {/* Features */}
      <FadeUp>
        <section className="py-16">
          <div className="mx-auto mb-12 max-w-[600px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.features.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[36px] text-teal-900">{t.features.title}</h2>
          </div>
          <StaggerGrid className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature) => (
              <StaggerItem key={feature.title}>
                <Link
                  href={feature.icon === "i-map-pin" ? "/facility-locator" : feature.icon === "i-calendar" ? "/appointments" : "/chat"}
                  className="group card block p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-[14px] flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-teal-100 text-teal-700">
                    <svg width="20" height="20"><use href={`#${feature.icon}`} /></svg>
                  </div>
                  <h3 className="text-base font-bold text-teal-900">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{feature.body}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </FadeUp>

      {/* Popular Topics */}
      <FadeUp>
        <section className="py-16" id="topics">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.topics.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[36px] text-teal-900">{t.topics.title}</h2>
            <p className="mt-3 text-[15.5px] text-ink-soft">{t.topics.body}</p>
          </div>
          <StaggerGrid className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {t.topics.items.map((topic) => (
              <StaggerItem key={topic.name}>
                <Link
                  href={`/chat?topic=${topic.icon}`}
                  className="group card flex h-full cursor-pointer flex-col gap-[14px] p-[26px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-[var(--radius-md)] ${topic.bg} ${topic.fg}`}>
                    <svg width="22" height="22"><use href={`#${topic.icon}`} /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-teal-900">{topic.name}</h3>
                  <p className="text-[13.5px] leading-[1.5] text-ink-soft">{topic.body}</p>
                  <span className="mt-auto flex items-center gap-1.5 text-[13px] font-bold text-coral-dark transition-all duration-150 group-hover:gap-2">
                    {t.topics.cta}
                    <svg width="13" height="13"><use href="#i-arrow" /></svg>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </FadeUp>

      {/* FAQ */}
      <FadeUp>
        <section className="py-16">
          <div className="mx-auto mb-10 max-w-[560px] text-center">
            <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
              {t.faq.eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[36px] text-teal-900">{t.faq.title}</h2>
          </div>
          <FaqSection items={t.faq.items} />
        </section>
      </FadeUp>
    </PageLayout>
  );
}
