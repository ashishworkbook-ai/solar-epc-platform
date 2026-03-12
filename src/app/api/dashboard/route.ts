import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.tenantId;
  const now = new Date();

  const [total, active, delayed, completedThisMonth, pipelineRaw, recentDelays, recentProjects] =
    await Promise.all([
      prisma.project.count({ where: { tenantId } }),
      prisma.project.count({ where: { tenantId, currentStage: { lt: 20 } } }),
      prisma.project.count({ where: { tenantId, isDelayed: true } }),
      prisma.project.count({
        where: { tenantId, currentStage: 20, updatedAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
      }),
      prisma.project.groupBy({
        by: ["currentStage"],
        where: { tenantId },
        _count: { id: true },
      }),
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
    { label: "Leads",              stages: [1, 2],          count: 0, color: "#6366f1" },
    { label: "Survey / Portal",    stages: [3, 4],          count: 0, color: "#8b5cf6" },
    { label: "Feasibility",        stages: [5, 6],          count: 0, color: "#f59e0b" },
    { label: "Loan / Design",      stages: [7, 8, 9, 10],   count: 0, color: "#f97316" },
    { label: "Installation",       stages: [11, 12, 13],    count: 0, color: "#10b981" },
    { label: "Net Meter",          stages: [14, 15, 16],    count: 0, color: "#06b6d4" },
    { label: "Subsidy",            stages: [17, 18, 19],    count: 0, color: "#84cc16" },
    { label: "Completed",          stages: [20],            count: 0, color: "#22c55e" },
  ];

  for (const row of pipelineRaw) {
    for (const bucket of pipeline) {
      if (bucket.stages.includes(row.currentStage)) {
        bucket.count += row._count.id;
      }
    }
  }

  return NextResponse.json({
    stats: { total, active, delayed, completedThisMonth },
    pipeline,
    recentDelays,
    recentProjects,
  });
}
