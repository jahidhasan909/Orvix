import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNgoSession } from "@/lib/require-ngo-session";
import { ROLES } from "@/lib/navigation";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const gate = await requireNgoSession([ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);

  const items = await prisma.distributionRecord.findMany({
    where: { ngoId: gate.ngoId, workerId: gate.userId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    items: items.map((row) => ({
      id: row.id,
      date: row.date,
      itemName: row.item,
      quantity: row.quantity,
      reason: row.reason || "",
      notes: row.notes || "",
      requestId: row.requestId || "",
      status: row.status,
    })),
  });
}
