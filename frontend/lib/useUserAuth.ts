import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCachedUser, setCachedUser } from "./sessionCache";
import { getCurrentUser, type UserProfile } from "./userApiClient";

// Client-side convenience only (redirect + hide UI you can't use) — every
// user API route enforces its own auth requirement server-side regardless
// of what this hook decides to render.
export function useRequireUser() {
  const router = useRouter();
  const cached = getCachedUser();
  const [user, setUser] = useState<UserProfile | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setCachedUser(result);
          setUser(result);
        } else {
          setCachedUser(null);
          router.replace("/admin/login");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}
