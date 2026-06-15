"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { clearCookieString } from "@/lib/cookie";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleSignOut() {
      document.cookie = clearCookieString();
      await getSupabase().auth.signOut();
      router.replace("/sign-in");
    }

    handleSignOut();
  }, [router]);

  return (
    <main style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
        Signing out…
      </p>
    </main>
  );
}
