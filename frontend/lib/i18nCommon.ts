import type { Language } from "@/lib/apiClient";

export const NAV: Record<Language, {
  home: string;
  chat: string;
  mySpace: string;
  appointments: string;
  consultations: string;
  notifications: string;
  profile: string;
  dashboard: string;
  logIn: string;
  register: string;
  loading: string;
  startChatting: string;
  findCare: string;
}> = {
  EN: {
    home: "Home",
    chat: "Chat",
    mySpace: "My Space",
    appointments: "Appointments",
    consultations: "Consultations",
    notifications: "Notifications",
    profile: "Profile",
    dashboard: "Dashboard",
    logIn: "Log in",
    register: "Register",
    loading: "Loading…",
    startChatting: "Start chatting",
    findCare: "Find Care",
  },
  RW: {
    home: "Ahabanza",
    chat: "Ganira",
    mySpace: "Umwanya wanjye",
    appointments: "Gahunda",
    consultations: "Ubujyanama",
    notifications: "Amamenyesha",
    profile: "Umwirondoro",
    dashboard: "Ikibaho",
    logIn: "Injira",
    register: "Iyandikishe",
    loading: "Turimo gutegura…",
    startChatting: "Tangira kuganira",
    findCare: "Shaka Ubuvuzi",
  },
  FR: {
    home: "Accueil",
    chat: "Discuter",
    mySpace: "Mon Espace",
    appointments: "Rendez-vous",
    consultations: "Consultations",
    notifications: "Notifications",
    profile: "Profil",
    dashboard: "Tableau de bord",
    logIn: "Connexion",
    register: "S'inscrire",
    loading: "Chargement…",
    startChatting: "Commencer à discuter",
    findCare: "Trouver des Soins",
  },
  SW: {
    home: "Nyumbani",
    chat: "Ongea",
    mySpace: "Nafasi Yangu",
    appointments: "Miadi",
    consultations: "Mashauriano",
    notifications: "Arifa",
    profile: "Wasifu",
    dashboard: "Dashibodi",
    logIn: "Ingia",
    register: "Jisajili",
    loading: "Inapakia…",
    startChatting: "Anza kuongea",
    findCare: "Tafuta Huduma",
  },
};

export function publicNav(language: Language): { href: string; label: string }[] {
  const labels: Record<Language, { how: string; library: string; support: string; safety: string; about: string; contact: string }> = {
    EN: { how: "How it works", library: "Library", support: "Find support", safety: "Safety", about: "About", contact: "Contact" },
    RW: { how: "Uko bikora", library: "Ububiko", support: "Shaka ubufasha", safety: "Umutekano", about: "Ibyerekeye", contact: "Duhamagare" },
    FR: { how: "Comment ça marche", library: "Bibliothèque", support: "Trouver du soutien", safety: "Sécurité", about: "À propos", contact: "Contact" },
    SW: { how: "Jinsi inavyofanya kazi", library: "Maktaba", support: "Tafuta msaada", safety: "Usalama", about: "Kuhusu", contact: "Wasiliana" },
  };
  const t = labels[language];
  return [
    { href: "/#how", label: t.how },
    { href: "/library", label: t.library },
    { href: "/facility-locator", label: t.support },
    { href: "/#safety", label: t.safety },
    { href: "/about", label: t.about },
    { href: "/contact", label: t.contact },
  ];
}

export const FOOTER_COLUMNS: Record<Language, {
  platform: { label: string; items: { label: string; href: string }[] };
  resources: { label: string; items: { label: string; href: string }[] };
  professionals: { label: string; items: { label: string; href: string }[] };
  support: { label: string; items: { label: string; href: string }[] };
  tagline: string;
}> = {
  EN: {
    platform: { label: "Support", items: [
      { label: "Talk to Inshuti", href: "/chat" },
      { label: "Find support", href: "/facility-locator" },
      { label: "Health library", href: "/library" },
    ]},
    resources: { label: "Information", items: [
      { label: "About", href: "/about" },
      { label: "Safety and privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ]},
    professionals: { label: "For professionals", items: [
      { label: "Professional portal", href: "/professional" },
      { label: "Become a professional", href: "/register" },
      { label: "Resources", href: "/library" },
    ]},
    support: { label: "Who it's for", items: [
      { label: "Young people", href: "/#young-people" },
      { label: "Parents", href: "/#parents" },
      { label: "How it works", href: "/#how" },
      { label: "Emergency help", href: "/help-resources" },
    ]},
    tagline: "Inshuti — a safe place to ask, learn, and get support.",
  },
  RW: {
    platform: { label: "Ubufasha", items: [
      { label: "Ganira na Inshuti", href: "/chat" },
      { label: "Shaka ubufasha", href: "/facility-locator" },
      { label: "Ububiko bw'ubuzima", href: "/library" },
    ]},
    resources: { label: "Amakuru", items: [
      { label: "Ibyerekeye", href: "/about" },
      { label: "Umutekano n'ibanga", href: "/privacy" },
      { label: "Amabwiriza", href: "/terms" },
      { label: "Ibibazo", href: "/faq" },
      { label: "Duhamagare", href: "/contact" },
    ]},
    professionals: { label: "Ku bakozi b'ubuzima", items: [
      { label: "Ikibaho cy'umukozi", href: "/professional" },
      { label: "Iyandikishe nk'umukozi", href: "/register" },
      { label: "Ibikoresho", href: "/library" },
    ]},
    support: { label: "Abagenewe", items: [
      { label: "Urubyiruko", href: "/#young-people" },
      { label: "Ababyeyi", href: "/#parents" },
      { label: "Uko bikora", href: "/#how" },
      { label: "Ubufasha bwihutirwa", href: "/help-resources" },
    ]},
    tagline: "Inshuti — ahantu hizewe ho kubaza, kwiga, no kubona ubufasha.",
  },
  FR: {
    platform: { label: "Soutien", items: [
      { label: "Parler à Inshuti", href: "/chat" },
      { label: "Trouver du soutien", href: "/facility-locator" },
      { label: "Bibliothèque santé", href: "/library" },
    ]},
    resources: { label: "Informations", items: [
      { label: "À propos", href: "/about" },
      { label: "Sécurité et confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ]},
    professionals: { label: "Pour les professionnels", items: [
      { label: "Portail professionnel", href: "/professional" },
      { label: "Devenir professionnel", href: "/register" },
      { label: "Ressources", href: "/library" },
    ]},
    support: { label: "Pour qui", items: [
      { label: "Jeunes", href: "/#young-people" },
      { label: "Parents", href: "/#parents" },
      { label: "Comment ça marche", href: "/#how" },
      { label: "Aide d'urgence", href: "/help-resources" },
    ]},
    tagline: "Inshuti — un endroit sûr pour demander, apprendre et être accompagné.",
  },
  SW: {
    platform: { label: "Msaada", items: [
      { label: "Ongea na Inshuti", href: "/chat" },
      { label: "Tafuta msaada", href: "/facility-locator" },
      { label: "Maktaba ya afya", href: "/library" },
    ]},
    resources: { label: "Taarifa", items: [
      { label: "Kuhusu", href: "/about" },
      { label: "Usalama na faragha", href: "/privacy" },
      { label: "Masharti", href: "/terms" },
      { label: "Maswali", href: "/faq" },
      { label: "Wasiliana", href: "/contact" },
    ]},
    professionals: { label: "Kwa wataalamu", items: [
      { label: "Milango ya mtaalamu", href: "/professional" },
      { label: "Kuwa mtaalamu", href: "/register" },
      { label: "Rasilimali", href: "/library" },
    ]},
    support: { label: "Kwa nani", items: [
      { label: "Vijana", href: "/#young-people" },
      { label: "Wazazi", href: "/#parents" },
      { label: "Jinsi inavyofanya kazi", href: "/#how" },
      { label: "Msaada wa dharura", href: "/help-resources" },
    ]},
    tagline: "Inshuti — mahali salama pa kuuliza, kujifunza, na kupata msaada.",
  },
};
