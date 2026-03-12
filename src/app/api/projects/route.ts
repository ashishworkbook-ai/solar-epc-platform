import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { generateProjectCode } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const stage = searchParams.get("stage");
  const delayed = searchParams.get("delayed");
  const search = searchParams.get("search");

  const where: any = { tenantId: session.tenantId };
  if (city) where.city = city;
  if (stage) where.currentStage = parseInt(stage);
  if (delayed === "true") where.isDelayed = true;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { projectCode: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "FIELD_EXECUTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const count = await prisma.project.count({ where: { tenantId: session.tenantId } });
    const projectCode = generateProjectCode(count + 1);

    const project = await prisma.project.create({
      data: {
        ...body,
        tenantId: session.tenantId,
        projectCode,
        createdById: session.id,
        currentStage: 1,
        currentStageName: "Lead Confirmed",
      },
    });

    await prisma.stageHistory.create({
      data: {
        projectId: project.id,
        tenantId: session.tenantId,
        stageId: 1,
        stageName: "Lead Confirmed",
        updatedById: session.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        userId: session.id,
        projectId: project.id,
        actionPerformed: "PROJECT_CREATED",
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
