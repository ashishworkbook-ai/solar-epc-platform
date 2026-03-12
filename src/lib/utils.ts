import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysSince(date: string | Date): number {
  return differenceInDays(new Date(), new Date(date));
}

export function generateProjectCode(count: number): string {
  const year = new Date().getFullYear();
  return `SP-${year}-${String(count).padStart(3, "0")}`;
}

export function getStageColor(stage: number): string {
  if (stage <= 2) return "#6366f1";
  if (stage <= 5) return "#f59e0b";
  if (stage <= 10) return "#f97316";
  if (stage <= 13) return "#10b981";
  if (stage <= 16) return "#06b6d4";
  if (stage <= 19) return "#84cc16";
  return "#22c55e";
}

export function getStageBadgeClass(stage: number): string {
  if (stage <= 2) return "bg-indigo-100 text-indigo-700";
  if (stage <= 5) return "bg-amber-100 text-amber-700";
  if (stage <= 10) return "bg-orange-100 text-orange-700";
  if (stage <= 13) return "bg-emerald-100 text-emerald-700";
  if (stage <= 16) return "bg-cyan-100 text-cyan-700";
  if (stage <= 19) return "bg-lime-100 text-lime-700";
  return "bg-green-100 text-green-700";
}

export const WORKFLOW_STAGES = [
  { id: 1,  name: "Lead Confirmed",                expectedDays: 2,  category: "Office" },
  { id: 2,  name: "Site Survey Completed",         expectedDays: 3,  category: "Field" },
  { id: 3,  name: "Customer Portal Registration",  expectedDays: 2,  category: "Office" },
  { id: 4,  name: "Feasibility Applied",           expectedDays: 1,  category: "Office" },
  { id: 5,  name: "Feasibility Approved",          expectedDays: 5,  category: "Utility" },
  { id: 6,  name: "Vendor Selected",               expectedDays: 2,  category: "Office" },
  { id: 7,  name: "Loan Application Submitted",    expectedDays: 3,  category: "Office" },
  { id: 8,  name: "Loan Approved",                 expectedDays: 7,  category: "Office" },
  { id: 9,  name: "System Design Completed",       expectedDays: 3,  category: "Office" },
  { id: 10, name: "Material Ordered",              expectedDays: 5,  category: "Office" },
  { id: 11, name: "Installation Scheduled",        expectedDays: 2,  category: "Office" },
  { id: 12, name: "Installation Completed",        expectedDays: 7,  category: "Field" },
  { id: 13, name: "Installation Details Uploaded", expectedDays: 1,  category: "Field" },
  { id: 14, name: "Net Meter Application Submitted", expectedDays: 2, category: "Office" },
  { id: 15, name: "DISCOM Inspection Completed",   expectedDays: 10, category: "Utility" },
  { id: 16, name: "Net Meter Installed",           expectedDays: 10, category: "Utility" },
  { id: 17, name: "System Commissioned",           expectedDays: 1,  category: "Field" },
  { id: 18, name: "Subsidy Claim Submitted",       expectedDays: 2,  category: "Office" },
  { id: 19, name: "Subsidy Received",              expectedDays: 30, category: "Office" },
  { id: 20, name: "Project Completed",             expectedDays: 0,  category: "Office" },
];
