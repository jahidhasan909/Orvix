import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asString } from "@/lib/worker-payload";
import { requireNgoSession } from "@/lib/require-ngo-session";
import { ROLES } from "@/lib/navigation";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function publicNote(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body || "",
    unread: row.unread,
    createdAt: row.createdAt,
  };
}

export async function GET() {
  const gate = await requireNgoSession([ROLES.WORKER, ROLES.NGO_ADMIN]);
  if (gate.error) return jsonError(gate.error, gate.status);
  const items = await prisma.notification.findMany({
    where: { userId: gate.userId, ngoId: gate.ngoId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ items: items.map(publicNote) });
}

export async function PATCH(request) {
  const gate = await requireNgoSession([ROLES.WORKER, ROLES.NGO_ADMIN]);
  if (gate.error) return jsonError(gate.error, gate.status);
  const body = await request.json().catch(() => null);
  const id = asString(body?.id);
  if (asString(body?.action) === "readAll") {
    await prisma.notification.updateMany({
      where: { userId: gate.userId, ngoId: gate.ngoId, unread: true },
      data: { unread: false },
    });
    return NextResponse.json({ ok: true });
  }
  if (!id) return jsonError("Notification id is required.");
  const existing = await prisma.notification.findFirst({ where: { id, userId: gate.userId, ngoId: gate.ngoId } });
  if (!existing) return jsonError("Notification not found.", 404);
  const item = await prisma.notification.update({
    where: { id },
    data: { unread: false },
  });
  return NextResponse.json({ item: publicNote(item) });
}
