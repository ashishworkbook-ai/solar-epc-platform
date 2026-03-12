import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // Seed workflow stages
    const stages = [
      { id: 1,  stageName: "Lead Confirmed",                stageOrder: 1,  expectedDays: 2,  stageCategory: "Office" },
      { id: 2,  stageName: "Site Survey Completed",         stageOrder: 2,  expectedDays: 3,  stageCategory: "Field" },
      { id: 3,  stageName: "Customer Portal Registration",  stageOrder: 3,  expectedDays: 2,  stageCategory: "Office" },
      { id: 4,  stageName: "Feasibility Applied",           stageOrder: 4,  expectedDays: 1,  stageCategory: "Office" },
      { id: 5,  stageName: "Feasibility Approved",          stageOrder: 5,  expectedDays: 5,  stageCategory: "Utility" },
      { id: 6,  stageName: "Vendor Selected",               stageOrder: 6,  expectedDays: 2,  stageCategory: "Office" },
      { id: 7,  stageName: "Loan Application Submitted",    stageOrder: 7,  expectedDays: 3,  stageCategory: "Office" },
      { id: 8,  stageName: "Loan Approved",                 stageOrder: 8,  expectedDays: 7,  stageCategory: "Office" },
      { id: 9,  stageName: "System Design Completed",       stageOrder: 9,  expectedDays: 3,  stageCategory: "Office" },
      { id: 10, stageName: "Material Ordered",              stageOrder: 10, expectedDays: 5,  stageCategory: "Office" },
      { id: 11, stageName: "Installation Scheduled",        stageOrder: 11, expectedDays: 2,  stageCategory: "Office" },
      { id: 12, stageName: "Installation Completed",        stageOrder: 12, expectedDays: 7,  stageCategory: "Field" },
      { id: 13, stageName: "Installation Details Uploaded", stageOrder: 13, expectedDays: 1,  stageCategory: "Field" },
      { id: 14, stageName: "Net Meter Application Submitted", stageOrder: 14, expectedDays: 2, stageCategory: "Office" },
      { id: 15, stageName: "DISCOM Inspection Completed",   stageOrder: 15, expectedDays: 10, stageCategory: "Utility" },
      { id: 16, stageName: "Net Meter Installed",           stageOrder: 16, expectedDays: 10, stageCategory: "Utility" },
      { id: 17, stageName: "System Commissioned",           stageOrder: 17, expectedDays: 1,  stageCategory: "Field" },
      { id: 18, stageName: "Subsidy Claim Submitted",       stageOrder: 18, expectedDays: 2,  stageCategory: "Office" },
      { id: 19, stageName: "Subsidy Received",              stageOrder: 19, expectedDays: 30, stageCategory: "Office" },
      { id: 20, stageName: "Project Completed",             stageOrder: 20, expectedDays: 0,  stageCategory: "Office" },
    ];

    for (const stage of stages) {
      await prisma.workflowStage.upsert({ where: { id: stage.id }, update: stage, create: stage });
    }
    results.push("✅ Workflow stages created");

    // Create tenant
    const tenant = await prisma.tenant.upsert({
      where: { id: "demo-tenant-001" },
      update: {},
      create: { id: "demo-tenant-001", name: "SunPower EPC", state: "Maharashtra", plan: "growth", maxProjects: 100 },
    });
    results.push("✅ Tenant created");

    // Create users
    const owner = await prisma.user.upsert({
      where: { email: "owner@sunpowerepc.com" },
      update: {},
      create: { tenantId: tenant.id, name: "Rajesh Mehta", email: "owner@sunpowerepc.com", password: await bcrypt.hash("password123", 10), mobile: "9876543210", role: "OWNER" },
    });
    const anita = await prisma.user.upsert({
      where: { email: "anita@sunpowerepc.com" },
      update: {},
      create: { tenantId: tenant.id, name: "Anita Sawant", email: "anita@sunpowerepc.com", password: await bcrypt.hash("password123", 10), mobile: "9876543211", role: "BACKOFFICE" },
    });
    const rohit = await prisma.user.upsert({
      where: { email: "rohit@sunpowerepc.com" },
      update: {},
      create: { tenantId: tenant.id, name: "Rohit Marathe", email: "rohit@sunpowerepc.com", password: await bcrypt.hash("password123", 10), mobile: "9876543212", role: "FIELD_EXECUTIVE" },
    });
    results.push("✅ Users created");

    // Create projects
    const projectsData = [
      { customerName: "Ramesh Patil",   city: "Pune",    currentStage: 5,  currentStageName: "Feasibility Approved",           isDelayed: true,  delayDays: 8,  systemSizeKw: 5,  assignedToId: anita.id },
      { customerName: "Sunita Sharma",  city: "Mumbai",  currentStage: 12, currentStageName: "Installation Completed",          isDelayed: false, delayDays: 0,  systemSizeKw: 3,  assignedToId: rohit.id },
      { customerName: "Vijay Kulkarni", city: "Nashik",  currentStage: 16, currentStageName: "Net Meter Installed",             isDelayed: true,  delayDays: 16, systemSizeKw: 8,  assignedToId: rohit.id },
      { customerName: "Meena Desai",    city: "Nagpur",  currentStage: 3,  currentStageName: "Customer Portal Registration",    isDelayed: false, delayDays: 0,  systemSizeKw: 4,  assignedToId: anita.id },
      { customerName: "Arvind Joshi",   city: "Pune",    currentStage: 8,  currentStageName: "Loan Approved",                   isDelayed: true,  delayDays: 12, systemSizeKw: 6,  assignedToId: anita.id },
      { customerName: "Kavita Nair",    city: "Mumbai",  currentStage: 20, currentStageName: "Project Completed",               isDelayed: false, delayDays: 0,  systemSizeKw: 10, assignedToId: rohit.id },
      { customerName: "Sanjay Bhat",    city: "Solapur", currentStage: 1,  currentStageName: "Lead Confirmed",                  isDelayed: false, delayDays: 0,  systemSizeKw: 3,  assignedToId: anita.id },
      { customerName: "Pratibha More",  city: "Nashik",  currentStage: 14, currentStageName: "Net Meter Application Submitted", isDelayed: false, delayDays: 0,  systemSizeKw: 5,  assignedToId: rohit.id },
    ];

    for (let i = 0; i < projectsData.length; i++) {
      const p = projectsData[i];
      const project = await prisma.project.upsert({
        where: { id: `demo-project-00${i + 1}` },
        update: {},
        create: {
          id: `demo-project-00${i + 1}`,
          tenantId: tenant.id,
          projectCode: `SP-2024-00${i + 1}`,
          createdById: owner.id,
          mobile: `980000000${i}`,
          loanRequired: i % 3 === 0,
          panelBrand: "Waaree",
          inverterBrand: "Growatt",
          ...p,
        },
      });

      await prisma.stageHistory.create({
        data: { projectId: project.id, tenantId: tenant.id, stageId: p.currentStage, stageName: p.currentStageName, updatedById: owner.id },
      });

      if (p.isDelayed) {
        await prisma.delayAlert.create({
          data: { tenantId: tenant.id, projectId: project.id, stageId: p.currentStage, stageName: p.currentStageName, daysOverdue: p.delayDays },
        });
      }
    }
    results.push("✅ Sample projects created");

    return NextResponse.json({ success: true, results, message: "Database setup complete! You can now login." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}