import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import { formatDate } from "@/lib/utils";

export default async function ProjectsPage({ searchParams }: { searchParams: { search?: string; city?: string; stage?: string; delayed?: string } }) {
  const session = await getSession();
  if (!session) redirect("/");

  const where: any = { tenantId: session.tenantId };
  if (searchParams.city) where.city = searchParams.city;
  if (searchParams.stage) where.currentStage = parseInt(searchParams.stage);
  if (searchParams.delayed === "true") where.isDelayed = true;
  if (searchParams.search) {
    where.OR = [
      { customerName: { contains: searchParams.search, mode: "insensitive" } },
      { projectCode: { contains: searchParams.search, mode: "insensitive" } },
      { city: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: { assignedTo: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>Projects</h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{projects.length} projects found</p>
          </div>
          {session.role !== "FIELD_EXECUTIVE" && (
            <a href="/projects/new" style={{
              background: "#6366f1", color: "#fff", textDecoration: "none",
              padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            }}>+ New Project</a>
          )}
        </div>

        {/* Search/Filter */}
        <form method="GET" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input name="search" defaultValue={searchParams.search} placeholder="Search customer, code, city..."
            style={{ flex: 1, minWidth: 200, background: "#161b27", border: "1px solid #1e2535", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
          <input name="city" defaultValue={searchParams.city} placeholder="City"
            style={{ width: 130, background: "#161b27", border: "1px solid #1e2535", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
          <select name="stage" defaultValue={searchParams.stage}
            style={{ width: 160, background: "#161b27", border: "1px solid #1e2535", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}>
            <option value="">All Stages</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(s => (
              <option key={s} value={s}>Stage {s}</option>
            ))}
          </select>
          <select name="delayed" defaultValue={searchParams.delayed}
            style={{ width: 130, background: "#161b27", border: "1px solid #1e2535", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }}>
            <option value="">All Status</option>
            <option value="true">Delayed Only</option>
          </select>
          <button type="submit" style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Filter
          </button>
          <a href="/projects" style={{ background: "#1e2535", color: "#64748b", textDecoration: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600 }}>
            Clear
          </a>
        </form>

        {/* Table */}
        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2535" }}>
                {["Code", "Customer", "City", "Stage", "Assigned To", "Status", "Updated", ""].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>No projects found</td></tr>
              ) : (
                projects.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1e2535" }}>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>{p.projectCode}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.customerName}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>{p.city || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#6366f120", color: "#818cf8" }}>
                        {p.currentStageName}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>{p.assignedTo?.name || "Unassigned"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {p.isDelayed ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#ef444420", color: "#ef4444" }}>
                          Delayed {p.delayDays}d
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#10b98120", color: "#10b981" }}>
                          On Track
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 11, color: "#475569" }}>{formatDate(p.updatedAt)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <a href={`/projects/${p.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}>View →</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
