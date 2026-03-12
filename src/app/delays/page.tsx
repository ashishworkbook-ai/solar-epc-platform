import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import { formatDate } from "@/lib/utils";

export default async function DelaysPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const delays = await prisma.delayAlert.findMany({
    where: { tenantId: session.tenantId, isActive: true },
    include: { project: { include: { assignedTo: { select: { name: true } } } } },
    orderBy: { daysOverdue: "desc" },
  });

  const critical = delays.filter(d => d.daysOverdue >= 14);
  const warning  = delays.filter(d => d.daysOverdue >= 7 && d.daysOverdue < 14);
  const mild     = delays.filter(d => d.daysOverdue < 7);

  function DelayCard({ d, color }: { d: any; color: string }) {
    return (
      <a href={`/projects/${d.projectId}`} style={{ textDecoration: "none" }}>
        <div style={{ background: "#161b27", border: `1px solid ${color}40`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, margin: 0 }}>{d.project.customerName}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{d.project.projectCode} · {d.project.city}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>Stage: {d.stageName}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>Assigned: {d.project.assignedTo?.name || "Unassigned"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color, fontSize: 26, fontWeight: 800, margin: 0 }}>{d.daysOverdue}d</p>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>overdue</p>
            </div>
          </div>
        </div>
      </a>
    );
  }

  function Section({ title, items, color }: { title: string; items: any[]; color: string }) {
    return (
      <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{title}</h2>
          <span style={{ background: `${color}20`, color, fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>None</p>
        ) : (
          items.map(d => <DelayCard key={d.id} d={d} color={color} />)
        )}
      </div>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Delay Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{delays.length} delayed projects</p>
        </div>

        {delays.length === 0 ? (
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 32 }}>🎉</p>
            <p style={{ color: "#10b981", fontSize: 16, fontWeight: 700 }}>No delayed projects!</p>
            <p style={{ color: "#64748b", fontSize: 14 }}>All projects are on track.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <Section title="Critical (14+ days)" items={critical} color="#ef4444" />
            <Section title="Warning (7–14 days)"  items={warning}  color="#f59e0b" />
            <Section title="Mild (1–7 days)"      items={mild}     color="#06b6d4" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
