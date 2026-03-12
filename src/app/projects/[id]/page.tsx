import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import { formatDate, timeAgo, WORKFLOW_STAGES } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/");

  const project = await prisma.project.findFirst({
    where: { id: params.id, tenantId: session.tenantId },
    include: {
      assignedTo: true,
      createdBy: { select: { name: true } },
      stageHistory: { orderBy: { enteredAt: "asc" } },
      documents: { include: { uploadedBy: { select: { name: true } } }, orderBy: { uploadedAt: "desc" } },
      photos: { include: { uploadedBy: { select: { name: true } } }, orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!project) notFound();

  const currentStageInfo = WORKFLOW_STAGES.find(s => s.id === project.currentStage);

  return (
    <AppLayout>
      <div style={{ padding: "28px 28px 48px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <a href="/projects" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back to Projects</a>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{project.customerName}</h1>
              <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{project.projectCode} · {project.city}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {project.isDelayed && (
                <span style={{ background: "#ef444420", color: "#ef4444", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                  ⚠️ Delayed {project.delayDays}d
                </span>
              )}
              <span style={{ background: "#6366f120", color: "#818cf8", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                Stage {project.currentStage}/20
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Current Stage */}
            <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Current Stage</h3>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#818cf8", margin: 0 }}>{project.currentStageName}</p>
              {currentStageInfo && (
                <p style={{ color: "#64748b", fontSize: 12, margin: "6px 0 0" }}>
                  Expected: {currentStageInfo.expectedDays} days · {currentStageInfo.category}
                </p>
              )}
              <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>
                Assigned to: {project.assignedTo?.name || "Unassigned"}
              </p>
            </div>

            {/* Customer Details */}
            <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Customer Details</h3>
              {[
                ["Mobile", project.mobile],
                ["Email", project.email],
                ["Address", project.address],
                ["City", project.city],
                ["PIN", project.pincode],
                ["Consumer No.", project.consumerNumber],
                ["Sanctioned Load", project.sanctionedLoad ? `${project.sanctionedLoad} kW` : null],
                ["Tariff Category", project.tariffCategory],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e2535" }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>
                  <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Solar System */}
            <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>Solar System</h3>
              {[
                ["System Size", project.systemSizeKw ? `${project.systemSizeKw} kW` : null],
                ["Panel Brand", project.panelBrand],
                ["Inverter Brand", project.inverterBrand],
                ["Panel Quantity", project.panelQuantity],
                ["Loan Required", project.loanRequired ? "Yes" : "No"],
                ["Bank", project.bankName],
                ["Loan Status", project.loanStatus],
                ["Loan Amount", project.loanAmount ? `₹${project.loanAmount.toLocaleString()}` : null],
              ].filter(([, v]) => v !== null && v !== undefined).map(([label, value]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1e2535" }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>
                  <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Timeline */}
          <div>
            <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Project Timeline</h3>

              {/* Stage Progress */}
              <div style={{ marginBottom: 20 }}>
                {WORKFLOW_STAGES.map(stage => {
                  const done = project.currentStage > stage.id;
                  const current = project.currentStage === stage.id;
                  return (
                    <div key={stage.id} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        background: done ? "#10b981" : current ? "#6366f1" : "#1e2535",
                        border: current ? "2px solid #818cf8" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#fff", fontWeight: 700,
                      }}>
                        {done ? "✓" : stage.id}
                      </div>
                      <span style={{ fontSize: 12, color: done ? "#10b981" : current ? "#818cf8" : "#475569", fontWeight: current ? 700 : 400 }}>
                        {stage.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Activity */}
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.stageHistory.map((h: any) => (
                  <div key={h.id} style={{ background: "#1e2535", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, margin: 0 }}>Entered: {h.stageName}</p>
                    <p style={{ color: "#64748b", fontSize: 11, margin: "3px 0 0" }}>{formatDate(h.enteredAt)}</p>
                  </div>
                ))}
                {project.photos.map((ph: any) => (
                  <div key={ph.id} style={{ background: "#1e2535", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, margin: 0 }}>📷 Photo uploaded: {ph.photoCategory}</p>
                    <p style={{ color: "#64748b", fontSize: 11, margin: "3px 0 0" }}>{ph.uploadedBy.name} · {timeAgo(ph.uploadedAt)}</p>
                  </div>
                ))}
                {project.documents.map((d: any) => (
                  <div key={d.id} style={{ background: "#1e2535", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, margin: 0 }}>📄 Document: {d.docType}</p>
                    <p style={{ color: "#64748b", fontSize: 11, margin: "3px 0 0" }}>{d.uploadedBy.name} · {timeAgo(d.uploadedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
