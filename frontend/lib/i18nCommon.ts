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

export const FOOTER: Record<Language, { privacy: string; terms: string; admin: string }> = {
  EN: { privacy: "Privacy", terms: "Terms", admin: "Admin" },
  RW: { privacy: "Ibanga", terms: "Amabwiriza", admin: "Ubuyobozi" },
  FR: { privacy: "Confidentialité", terms: "Conditions", admin: "Admin" },
  SW: { privacy: "Faragha", terms: "Masharti", admin: "Msimamizi" },
};
