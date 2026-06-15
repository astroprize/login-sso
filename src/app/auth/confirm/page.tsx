"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { buildCookieString } from "@/lib/cookie";
import { isTrustedNext } from "@/lib/trust";

function ConfirmHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleConfirm() {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") as "magiclink" | "email" | null;

      if (!token_hash || !type) {
        setError("Invalid confirmation link.");
        setTimeout(() => router.replace("/sign-in"), 2000);
        return;
      }

      const { data, error } = await getSupabase().auth.verifyOtp({ token_hash, type });

      if (error || !data.session) {
        setError(error?.message ?? "Confirmation failed. Please sign in again.");
        setTimeout(() => router.replace("/sign-in"), 2000);
        return;
      }

      const session = data.session;
      document.cookie = buildCookieString({
        access_token: session.access_token,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      });

      const next = searchParams.get("next") ?? "";

      router.replace(isTrustedNext(next) ? next : "/success");
    }

    handleConfirm();
  }, [router, searchParams]);

  if (error) {
    return (
      <main style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "1rem",
      }}>
        <div className="card" style={{ maxWidth: 400, width: "100%", padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-danger)", fontSize: "0.875rem" }}>{error}</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
            Redirecting to sign in…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid var(--color-accent)",
          borderTopColor: "transparent",
          animation: "spin 0.7s linear infinite",
          margin: "0 auto 1rem",
        }} />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          Signing you in…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmHandler />
    </Suspense>
  );
}
