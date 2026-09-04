import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { asString } from "@/lib/worker-payload";
import { requireNgoSession } from "@/lib/require-ngo-session";
import { ROLES } from "@/lib/navigation";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const gate = await requireNgoSession([ROLES.NGO_ADMIN, ROLES.WORKER]);
  if (gate.error) return jsonError(gate.error, gate.status);

  const body = await request.json().catch(() => null);
  const currentPassword = asString(body?.currentPassword);
  const newPassword = asString(body?.newPassword);
  if (!currentPassword || !newPassword) return jsonError("Current and new passwords are required.");
  if (newPassword.length < 8) return jsonError("New password must be at least 8 characters.");

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error?.message || "Could not change the password.", 400);
  }
}
