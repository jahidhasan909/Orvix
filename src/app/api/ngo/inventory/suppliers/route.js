import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asString } from "@/lib/worker-payload";
import { requireInventory } from "@/lib/require-inventory";
import { publicSupplier } from "@/lib/inventory";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const gate = await requireInventory("manage");
  if (gate.error) return jsonError(gate.error, gate.status);

  const items = await prisma.supplier.findMany({
    where: { ngoId: gate.ngoId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ items: items.map((row) => publicSupplier(row)) });
}

export async function POST(request) {
  const gate = await requireInventory("manage");
  if (gate.error) return jsonError(gate.error, gate.status);

  const body = await request.json().catch(() => null);
  const name = asString(body?.name);
  if (!name) return jsonError("Supplier name is required.");

  const item = await prisma.supplier.create({
    data: {
      ngoId: gate.ngoId,
      name,
      contact: asString(body?.contact) || null,
      email: asString(body?.email) || null,
      phone: asString(body?.phone) || null,
      address: asString(body?.address) || null,
      category: asString(body?.category) || null,
      status: asString(body?.status) === "inactive" ? "inactive" : "active",
    },
  });
  return NextResponse.json({ item: publicSupplier(item) }, { status: 201 });
}
