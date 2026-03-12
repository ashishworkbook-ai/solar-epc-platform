import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import { formatDate, getStageBadgeClass } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const tenantId = session.tenantId;
  const now = new Date();

  const [total, active, delayed, completedThisMonth, pipelineRaw, recentDelays, recentProjects] =
    await Promise.all([
      prisma.project.count({ where: { tenantId } }),
      prisma.project.count({ where: { tenantId, currentStage: { lt: 20 } } }),
      prisma.project.count({ where: { tenantId, isDelayed: true } }),
      prisma.project.count({ where: { tenantId, currentStage: 20, updatedAt: { gte: startOfMonth(now), lte: endOfMonth(now) } } }),
      prisma.project.groupBy({ by: ["currentStage"], where: { tenantId }, _count: { id: true } }),
      prisma.delayAlert.findMany({
        where: { tenantId, isActive: true },
        include: { project: { include: { assignedTo: { select: { name: true } } } } },
        orderBy: { daysOverdue: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { tenantId },
        include: { assignedTo: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

  const pipeline = [
    { label: "Leads",           stages: [1, 2],        count: 0, color: "#6366f1" },
    { label: "Survey/Portal",   stages: [3, 4],        count: 0, color: "#8b5cf6" },
    { label: "Feasibility",     stages: [5, 6],        count: 0, color: "#f59e0b" },
    { label: "Loan/Design",     stages: [7, 8, 9, 10], count: 0, color: "#f97316" },
    { label: "Installation",    stages: [11, 12, 13],  count: 0, color: "#10b981" },
    { label: "Net Meter",       stages: [14, 15, 16],  count: 0, color: "#06b6d4" },
    { label: "Subsidy",         stages: [17, 18, 19],  count: 0, color: "#84cc16" },
    { label: "Completed",       stages: [20],          count: 0, color: "#22c55e" },
  ];
  for (const row of pipelineRaw) {
    for (const b of pipeline) {
      if (b.stages.includes(row.currentStage)) b.count += row._count.id;
    }
  }

  const stats = [
    { label: "Total Projects",      value: total,              color: "#6366f1" },
    { label: "Active Projects",     value: active,             color: "#10b981" },
    { label: "Delayed",             value: delayed,            color: "#ef4444" },
    { label: "Completed This Month",value: completedThisMonth, color: "#f59e0b" },
  ];

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Welcome back, {session.name}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 32, fontWeight: 800, margin: "6px 0 0" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 22, marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 18px" }}>Project Pipeline</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
            {pipeline.map(b => (
              <div key={b.label} style={{ textAlign: "center", background: "#1e2535", borderRadius: 10, padding: "14px 8px" }}>
                <p style={{ color: b.color, fontSize: 26, fontWeight: 800, margin: 0 }}>{b.count}</p>
                <p style={{ color: "#64748b", fontSize: 11, fontWeight: 600, margin: "4px 0 0" }}>{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Delays */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>⚠️ Delayed Projects</h2>
            {recentDelays.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 14 }}>No delays! Great work.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentDelays.map((d: any) => (
                  <a key={d.id} href={`/projects/${d.projectId}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "#1e2535", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #ef4444" }}>
                      <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, margin: 0 }}>{d.project.customerName}</p>
                      <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>{d.stageName} · <span style={{ color: "#ef4444" }}>{d.daysOverdue} days overdue</span></p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>Recent Projects</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentProjects.map((p: any) => (
                <a key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e2535", borderRadius: 10, padding: "10px 14px" }}>
                    <div>
                      <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, margin: 0 }}>{p.customerName}</p>
                      <p style={{ color: "#64748b", fontSize: 11, margin: "2px 0 0" }}>{p.city} · {p.assignedTo?.name || "Unassigned"}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#6366f120", color: "#818cf8" }}>
                      Stage {p.currentStage}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
