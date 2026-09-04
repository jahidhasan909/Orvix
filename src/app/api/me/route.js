import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asString } from "@/lib/worker-payload";
import { requireNgoSession } from "@/lib/require-ngo-session";
import { ROLES } from "@/lib/navigation";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function publicMe(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    designation: user.designation || "",
    status: user.status,
  };
}

export async function GET() {
  const gate = await requireNgoSession([ROLES.NGO_ADMIN, ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);
  const user = await prisma.user.findFirst({
    where: { id: gate.userId, ngoId: gate.ngoId },
    select: { id: true, name: true, email: true, phone: true, designation: true, status: true },
  });
  if (!user) return jsonError("Account not found.", 404);
  return NextResponse.json({ item: publicMe(user) });
}

export async function PATCH(request) {
  const gate = await requireNgoSession([ROLES.NGO_ADMIN, ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);
  const body = await request.json().catch(() => null);
  const name = asString(body?.name);
  const phone = asString(body?.phone);
  if (!name) return jsonError("Name is required.");

  const user = await prisma.user.update({
    where: { id: gate.userId },
    data: { name, phone: phone || null },
    select: { id: true, name: true, email: true, phone: true, designation: true, status: true },
  });
  return NextResponse.json({ item: publicMe(user) });
}
