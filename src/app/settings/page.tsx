import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  const userCount = await prisma.user.count({ where: { tenantId: session.tenantId } });

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px", maxWidth: 600 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Settings</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Company</h3>
            {[
              ["Company Name", tenant?.name],
              ["Plan", tenant?.plan],
              ["Max Projects", tenant?.maxProjects],
              ["State", tenant?.state],
              ["Team Members", userCount],
            ].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2535" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{String(value)}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Your Account</h3>
            {[
              ["Name", session.name],
              ["Email", session.email],
              ["Role", session.role.replace("_", " ")],
            ].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2535" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Demo Credentials</h3>
            <p style={{ color: "#64748b", fontSize: 13 }}>owner@sunpowerepc.com / password123</p>
            <p style={{ color: "#64748b", fontSize: 13 }}>anita@sunpowerepc.com / password123</p>
            <p style={{ color: "#64748b", fontSize: 13 }}>rohit@sunpowerepc.com / password123</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
