"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";
import { useToast } from "@/lib/useToast";
import { GroupCall } from "@/components/GroupCall";

function JoinInner() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [validCode, setValidCode] = useState("");
  const codeParam = searchParams.get("code") ?? "";

  useEffect(() => {
    if (!codeParam.trim()) {
      setActive(true);
      return;
    }
    setValidCode(codeParam.trim());
    setActive(true);
  }, [codeParam]);

  if (!active) return null;

  return (
    <div className="min-h-screen bg-[#101817]">
      {validCode ? (
        <GroupCall
          code={validCode}
          onClose={() => {
            toast("You left the call", "info");
            router.push("/chat");
          }}
        />
      ) : (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-xl font-bold text-white">Join a group call</h1>
          <p className="mt-2 max-w-sm text-sm text-white/60">Enter the invite code from the person who started the call, or open a shared invite link.</p>
          <form
            className="mt-6 flex w-full max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const value = new FormData(e.currentTarget).get("code")?.toString().trim() ?? "";
              if (!value) {
                toast("Enter an invite code", "error");
                return;
              }
              setValidCode(value);
            }}
          >
            <input name="code" placeholder="Invite code" className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40" />
            <button type="submit" className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500">Join</button>
          </form>
          <button type="button" onClick={() => router.push("/chat")} className="mt-6 text-sm text-white/50 hover:text-white">Cancel</button>
        </div>
      )}
    </div>
  );
}

export default function JoinCallPage() {
  return (
    <Suspense fallback={null}>
      <JoinInner />
    </Suspense>
  );
}