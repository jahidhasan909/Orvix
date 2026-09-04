import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNgoAdmin } from "@/lib/require-ngo-admin";
import { publicPurchase } from "@/lib/procurement";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_request, { params }) {
  const gate = await requireNgoAdmin();
  if (gate.error) return jsonError(gate.error, gate.status);

  const { id } = await params;
  const item = await prisma.purchase.findFirst({
    where: { id, ngoId: gate.ngoId },
    include: {
      vendor: { select: { id: true, name: true, email: true, phone: true } },
      order: {
        select: { id: true, status: true, supplier: true, total: true, date: true },
      },
      receiving: {
        orderBy: { date: "asc" },
        include: {
          item: { select: { name: true, unit: true } },
          supplier: { select: { name: true } },
        },
      },
    },
  });
  if (!item) return jsonError("Purchase not found.", 404);

  return NextResponse.json({ item: publicPurchase(item) });
}
