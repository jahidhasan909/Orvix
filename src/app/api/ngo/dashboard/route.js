import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNgoAdmin } from "@/lib/require-ngo-admin";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);
  const ngoId = gate.ngoId;

  const [projects, workers, pendingRequests, stockItems] = await Promise.all([
    prisma.project.count({ where: { ngoId, status: "active" } }),
    prisma.user.count({ where: { ngoId, role: "worker" } }),
    prisma.resourceRequest.count({ where: { ngoId, status: "pending" } }),
    prisma.inventoryItem.findMany({
      where: { ngoId, status: "active" },
      select: { quantity: true, minLevel: true },
    }),
  ]);
  const lowStock = stockItems.filter(
    (item) => item.quantity <= 0 || (item.minLevel > 0 && item.quantity <= item.minLevel)
  ).length;

  return NextResponse.json({
    projects,
    workers,
    pendingRequests,
    lowStock,
  });
}
