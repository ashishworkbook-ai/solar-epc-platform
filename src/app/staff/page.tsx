import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";

export default async function StaffPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role === "FIELD_EXECUTIVE") redirect("/dashboard");

  const staff = await prisma.user.findMany({
    where: { tenantId: session.tenantId, isActive: true },
    select: { id: true, name: true, email: true, mobile: true, role: true,
      _count: { select: { assignedProjects: true } } },
  });

  const staffWithStats = await Promise.all(
    staff.map(async (member) => {
      const [delayed, completed] = await Promise.all([
        prisma.project.count({ where: { assignedToId: member.id, isDelayed: true } }),
        prisma.project.count({ where: { assignedToId: member.id, currentStage: 20 } }),
      ]);
      const total = member._count.assignedProjects;
      return { ...member, total, delayed, completed, onTimeRate: total > 0 ? Math.round(((total - delayed) / total) * 100) : 100 };
    })
  );

  const roleLabel: Record<string, string> = {
    OWNER: "Owner",
    BACKOFFICE: "Back Office",
    FIELD_EXECUTIVE: "Field Executive",
  };

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Staff Performance</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{staffWithStats.length} team members</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {staffWithStats.map(member => (
            <div key={member.id} style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                  {member.name[0]}
                </div>
                <div>
                  <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, margin: 0 }}>{member.name}</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>{roleLabel[member.role]}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Total",     value: member.total,      color: "#818cf8" },
                  { label: "Active",    value: member.total - member.completed, color: "#10b981" },
                  { label: "Delayed",   value: member.delayed,    color: "#ef4444" },
                  { label: "Done",      value: member.completed,  color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#1e2535", borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
                    <p style={{ color: s.color, fontSize: 20, fontWeight: 800, margin: 0 }}>{s.value}</p>
                    <p style={{ color: "#64748b", fontSize: 10, fontWeight: 600, margin: "3px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>On-time rate</span>
                  <span style={{ fontSize: 11, color: member.onTimeRate >= 80 ? "#10b981" : "#ef4444", fontWeight: 700 }}>{member.onTimeRate}%</span>
                </div>
                <div style={{ height: 6, background: "#1e2535", borderRadius: 99 }}>
                  <div style={{ height: 6, borderRadius: 99, background: member.onTimeRate >= 80 ? "#10b981" : "#ef4444", width: `${member.onTimeRate}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
