"use client";
import { useState } from "react";

export function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/dashboard-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #F0F4F8)",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #DDE3EA",
          boxShadow: "0 8px 30px rgba(15,25,35,0.08)",
          padding: "32px",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#F0FDFA",
            border: "1px solid #99F6E4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
            fontSize: "20px",
          }}
        >
          🔒
        </div>
        <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "#0F1923" }}>
          Statistik-dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#5A6A7A", margin: "0 0 20px 0" }}>
          Privat område — kun for administratoren.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Adgangskode"
          autoFocus
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: "10px",
            border: error ? "1.5px solid #e34948" : "1.5px solid #DDE3EA",
            fontSize: "14px",
            outline: "none",
            marginBottom: "10px",
          }}
        />
        {error && (
          <p style={{ fontSize: "12.5px", color: "#e34948", margin: "0 0 10px 0" }}>
            Forkert adgangskode. Prøv igen.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "none",
            background: loading || !password ? "#99C7C2" : "#0D9488",
            color: "#fff",
            fontWeight: 700,
            fontSize: "14px",
            cursor: loading || !password ? "default" : "pointer",
          }}
        >
          {loading ? "Logger ind…" : "Log ind"}
        </button>
      </form>
    </div>
  );
}
