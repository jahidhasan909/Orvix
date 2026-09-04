import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNgoAdmin } from "@/lib/require-ngo-admin";
import { parseLeaveBody, publicLeave } from "@/lib/leave";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const include = { user: { select: { name: true } } };

export async function GET(request) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const where = { ngoId: gate.ngoId };
  if (status) where.status = status;

  const items = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include,
  });
  return NextResponse.json({ items: items.map(publicLeave) });
}

export async function POST(request) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);

  const parsed = parseLeaveBody(await request.json().catch(() => null));
  if (parsed.error) return jsonError(parsed.error);

  const worker = await prisma.user.findFirst({
    where: { id: parsed.data.userId, ngoId: gate.ngoId, role: "worker" },
    select: { id: true, name: true },
  });
  if (!worker) return jsonError("Worker not found.", 404);

  const item = await prisma.leaveRequest.create({
    data: {
      ngoId: gate.ngoId,
      userId: worker.id,
      worker: worker.name,
      ...parsed.data,
      status: "pending",
    },
    include,
  });
  return NextResponse.json({ item: publicLeave(item) }, { status: 201 });
}
