import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asString } from "@/lib/worker-payload";
import { requireNgoAdmin } from "@/lib/require-ngo-admin";
import { publicLeave } from "@/lib/leave";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request, { params }) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);
  const { id } = await params;
  const existing = await prisma.leaveRequest.findFirst({
    where: { id, ngoId: gate.ngoId },
    include: { user: { select: { name: true } } },
  });
  if (!existing) return jsonError("Leave request not found.", 404);
  if (existing.status !== "pending") return jsonError("Only pending leave can be updated.");

  const action = asString((await request.json().catch(() => null))?.action);
  if (action !== "approve" && action !== "reject") return jsonError("Use approve or reject.");

  const item = await prisma.leaveRequest.update({
    where: { id },
    data: { status: action === "approve" ? "approved" : "rejected" },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json({ item: publicLeave(item) });
}
