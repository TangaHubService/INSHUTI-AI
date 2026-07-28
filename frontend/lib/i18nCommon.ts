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

export const FOOTER_COLUMNS: Record<Language, {
  platform: { label: string; items: { label: string; href: string }[] };
  resources: { label: string; items: { label: string; href: string }[] };
  professionals: { label: string; items: { label: string; href: string }[] };
  support: { label: string; items: { label: string; href: string }[] };
  tagline: string;
}> = {
  EN: {
    platform: { label: "Platform", items: [
      { label: "Chat", href: "/chat" },
      { label: "Library", href: "/library" },
      { label: "Facility Locator", href: "/facility-locator" },
      { label: "Appointments", href: "/appointments" },
      { label: "My Space", href: "/my-space" },
    ]},
    resources: { label: "Resources", items: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ]},
    professionals: { label: "For Professionals", items: [
      { label: "Healthcare Portal", href: "/professional" },
      { label: "Government Portal", href: "/government" },
      { label: "Admin Dashboard", href: "/admin/login" },
    ]},
    support: { label: "Support", items: [
      { label: "Help Center", href: "/faq" },
      { label: "Report an Issue", href: "/contact" },
    ]},
    tagline: "Inshuti — Your AI Health Companion",
  },
  RW: {
    platform: { label: "Urubuga", items: [
      { label: "Ganira", href: "/chat" },
      { label: "Ububiko", href: "/library" },
      { label: "Shaka Ivuriro", href: "/facility-locator" },
      { label: "Gahunda", href: "/appointments" },
      { label: "Umwanya wanjye", href: "/my-space" },
    ]},
    resources: { label: "Ibikoresho", items: [
      { label: "Ibyerekeye", href: "/about" },
      { label: "Ibibazo", href: "/faq" },
      { label: "Ibanga", href: "/privacy" },
      { label: "Amabwiriza", href: "/terms" },
      { label: "Duhamagare", href: "/contact" },
    ]},
    professionals: { label: "Kubaganga", items: [
      { label: "Ikibaho cy'Ubuvuzi", href: "/professional" },
      { label: "Ikibaho cya Leta", href: "/government" },
      { label: "Ikibaho cy'Abayobozi", href: "/admin/login" },
    ]},
    support: { label: "Ubufasha", items: [
      { label: "Aho Wabaza", href: "/faq" },
      { label: "Menyesha Ikibazo", href: "/contact" },
    ]},
    tagline: "Inshuti — Umufasha wawe w'Ubuzima wa AI",
  },
  FR: {
    platform: { label: "Plateforme", items: [
      { label: "Discuter", href: "/chat" },
      { label: "Bibliothèque", href: "/library" },
      { label: "Localisateur", href: "/facility-locator" },
      { label: "Rendez-vous", href: "/appointments" },
      { label: "Mon Espace", href: "/my-space" },
    ]},
    resources: { label: "Ressources", items: [
      { label: "À propos", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ]},
    professionals: { label: "Professionnels", items: [
      { label: "Portail Santé", href: "/professional" },
      { label: "Portail Gouvernement", href: "/government" },
      { label: "Tableau de Bord Admin", href: "/admin/login" },
    ]},
    support: { label: "Soutien", items: [
      { label: "Centre d'Aide", href: "/faq" },
      { label: "Signaler un Problème", href: "/contact" },
    ]},
    tagline: "Inshuti — Votre Assistant Santé IA",
  },
  SW: {
    platform: { label: "Jukwaa", items: [
      { label: "Ongea", href: "/chat" },
      { label: "Maktaba", href: "/library" },
      { label: "Tafuta Kituo", href: "/facility-locator" },
      { label: "Miadi", href: "/appointments" },
      { label: "Nafasi Yangu", href: "/my-space" },
    ]},
    resources: { label: "Rasilimali", items: [
      { label: "Kuhusu", href: "/about" },
      { label: "Maswali", href: "/faq" },
      { label: "Faragha", href: "/privacy" },
      { label: "Masharti", href: "/terms" },
      { label: "Wasiliana", href: "/contact" },
    ]},
    professionals: { label: "Kwa Wataalamu", items: [
      { label: "Milango wa Afya", href: "/professional" },
      { label: "Milango wa Serikali", href: "/government" },
      { label: "Dashibodi ya Admin", href: "/admin/login" },
    ]},
    support: { label: "Msaada", items: [
      { label: "Kituo cha Msaada", href: "/faq" },
      { label: "Ripoti Tatizo", href: "/contact" },
    ]},
    tagline: "Inshuti — Msaidizi Wako wa Afya wa AI",
  },
};
