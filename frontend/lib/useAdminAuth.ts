import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentAdmin, UnauthorizedError, type AdminRole, type AdminUser } from "./adminApiClient";

const ROLE_RANK: Record<AdminRole, number> = {
  MODERATOR: 0,
  CONTENT_REVIEWER: 1,
  SUPER_ADMIN: 2,
};

// Client-side convenience only (redirect + hide UI you can't use) — every
// admin API route enforces its own role requirement server-side regardless
// of what this hook decides to render.
export function useRequireAdmin(minRole?: AdminRole) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then((result) => {
        if (!cancelled) setAdmin(result);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof UnauthorizedError) {
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

  const hasAccess = admin && (!minRole || ROLE_RANK[admin.role] >= ROLE_RANK[minRole]);

  return { admin, loading, hasAccess: Boolean(hasAccess) };
}
