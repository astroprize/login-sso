"use client";

export default function SuccessPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2rem", textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--color-accent-subtle)",
          border: "1px solid var(--color-accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem",
          fontSize: "1.5rem",
        }}>
          ✓
        </div>
        <p style={{ color: "var(--color-text-primary)", fontWeight: 500, marginBottom: "0.5rem" }}>
          You&apos;re signed in
        </p>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          You can close this tab or return to where you came from.
        </p>
      </div>
    </main>
  );
}
