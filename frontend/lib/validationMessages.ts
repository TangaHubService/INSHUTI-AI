import type { Language } from "@/lib/apiClient";

export const VALIDATION: Record<Language, {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  weakPassword: string;
  passwordMismatch: string;
  fixErrors: string;
}> = {
  EN: {
    required: "This field is required.",
    invalidEmail: "Enter a valid email address.",
    invalidPhone: "Enter a valid phone number.",
    weakPassword: "Password must be at least 8 characters and include a letter and a number.",
    passwordMismatch: "Passwords don't match.",
    fixErrors: "Please fix the highlighted fields.",
  },
  RW: {
    required: "Uyu murima ugomba kuzuzwa.",
    invalidEmail: "Andika imeri yemewe.",
    invalidPhone: "Andika nimero ya telefoni yemewe.",
    weakPassword: "Ijambobanga rigomba kuba nibura inyuguti 8, harimo inyuguti n'umubare.",
    passwordMismatch: "Amagambo y'ibanga ntahuye.",
    fixErrors: "Nyabona ukosore imirima yagaragajwe.",
  },
  FR: {
    required: "Ce champ est obligatoire.",
    invalidEmail: "Saisissez une adresse email valide.",
    invalidPhone: "Saisissez un numéro de téléphone valide.",
    weakPassword: "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    fixErrors: "Veuillez corriger les champs surlignés.",
  },
  SW: {
    required: "Sehemu hii inahitajika.",
    invalidEmail: "Ingiza barua pepe sahihi.",
    invalidPhone: "Ingiza nambari ya simu sahihi.",
    weakPassword: "Nywila lazima iwe na herufi 8 angalau, ikiwa na herufi na nambari.",
    passwordMismatch: "Nywila hazifanani.",
    fixErrors: "Tafadhali rekebisha sehemu zilizoangaziwa.",
  },
};
