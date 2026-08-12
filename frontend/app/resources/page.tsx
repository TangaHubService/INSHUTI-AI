"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Resource browsing now lives inside the Library page's "Resources" tab —
// this route stays only to redirect any existing links/bookmarks.
export default function ResourcesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/library?tab=resources");
  }, [router]);

  return null;
}
