"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, AlertTriangle, Users, Settings, LogOut, Sun, Menu, X } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/projects",  label: "Projects",   icon: FolderKanban },
  { href: "/delays",    label: "Delays",      icon: AlertTriangle },
  { href: "/staff",     label: "Staff",       icon: Users },
  { href: "/settings",  label: "Settings",    icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1117" }}>
      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#161b27", borderRight: "1px solid #1e2535",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50,
        transform: open ? "translateX(0)" : undefined,
        transition: "transform 0.2s",
      }} className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 }}>
          <div style={{ background: "#6366f1", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>SolarEPC</span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <a key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600,
                background: active ? "#6366f120" : "transparent",
                color: active ? "#818cf8" : "#64748b",
                transition: "all 0.15s",
              }}>
                <Icon size={16} />
                {label}
              </a>
            );
          })}
        </nav>

        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
          borderRadius: 10, background: "transparent", border: "none", cursor: "pointer",
          color: "#64748b", fontSize: 13, fontWeight: 600, width: "100%",
        }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", overflow: "auto" }}>
        {/* Mobile header */}
        <div style={{ display: "none", padding: "12px 16px", borderBottom: "1px solid #1e2535", alignItems: "center", gap: 12 }} className="mobile-header">
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e2e8f0" }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>SolarEPC</span>
        </div>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          main { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
