"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const next = searchParams.get("next") ?? "";
    const emailRedirectTo = next
      ? `https://login.dparmar.com/auth/confirm?next=${encodeURIComponent(next)}`
      : "https://login.dparmar.com/auth/confirm";

    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--color-accent-subtle)",
          border: "1px solid var(--color-accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem",
          fontSize: "1.5rem"
        }}>
          ✉
        </div>
        <p style={{ color: "var(--color-text-primary)", fontWeight: 500, marginBottom: "0.5rem" }}>
          Check your inbox
        </p>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          We sent a magic link to <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.375rem",
          }}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      {status === "error" && (
        <p style={{
          fontSize: "0.8125rem",
          color: "var(--color-danger)",
          background: "var(--color-danger-subtle)",
          border: "1px solid #991b1b",
          borderRadius: "var(--radius-btn)",
          padding: "0.5rem 0.75rem",
        }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2rem" }}>
        <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
          <p style={{
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}>
            dparmar.com
          </p>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
            Sign in
          </h1>
        </div>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
