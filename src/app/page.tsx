"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@sunpowerepc.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117" }}>
      <div style={{ width: 360, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>☀️</div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Solar EPC Platform</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Project Management System</p>
        </div>
        <form onSubmit={handleLogin} style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", background: "#1e2535", border: "1px solid #2a3347", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none" }} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", background: "#1e2535", border: "1px solid #2a3347", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none" }} required />
          </div>
          {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 14 }}>Demo: owner@sunpowerepc.com / password123</p>
      </div>
    </div>
  );
}
