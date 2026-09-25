import type { AdminUser } from "./adminApiClient";
import type { UserProfile } from "./userApiClient";

let cachedUser: UserProfile | null = null;
let cachedAdmin: AdminUser | null = null;

export function getCachedUser() {
  return cachedUser;
}

export function setCachedUser(user: UserProfile | null) {
  cachedUser = user;
}

export function getCachedAdmin() {
  return cachedAdmin;
}

export function setCachedAdmin(admin: AdminUser | null) {
  cachedAdmin = admin;
}
