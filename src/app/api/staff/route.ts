import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.user.findMany({
    where: { tenantId: session.tenantId, isActive: true },
    select: { id: true, name: true, email: true, mobile: true, role: true, createdAt: true,
      _count: { select: { assignedProjects: true } } },
  });

  const staffWithStats = await Promise.all(
    staff.map(async (member) => {
      const [delayed, completed] = await Promise.all([
        prisma.project.count({ where: { assignedToId: member.id, isDelayed: true } }),
        prisma.project.count({ where: { assignedToId: member.id, currentStage: 20 } }),
      ]);
      const total = member._count.assignedProjects;
      return {
        ...member,
        total,
        delayed,
        completed,
        onTimeRate: total > 0 ? Math.round(((total - delayed) / total) * 100) : 100,
      };
    })
  );

  return NextResponse.json(staffWithStats);
}
