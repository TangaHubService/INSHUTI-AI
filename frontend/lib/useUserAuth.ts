import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, type UserProfile } from "./userApiClient";

// Client-side convenience only (redirect + hide UI you can't use) — every
// user API route enforces its own auth requirement server-side regardless
// of what this hook decides to render.
export function useRequireUser() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setUser(result);
        } else {
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
